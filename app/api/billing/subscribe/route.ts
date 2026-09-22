import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth/server";
import {
  SubscribeError,
  createSubscription,
  ensureCustomer,
  hasLiveSubscription,
  undoSubscription,
} from "@/lib/billing/subscribe";
import { getDb } from "@/lib/db/client";
import { billingConsents } from "@/lib/db/schema";
import { TERMS_VERSION } from "@/lib/i18n/legal";
import { hashIp } from "@/lib/security/crypto";
import { subscribeRequestSchema } from "@/lib/security/validation";
import { checkBurstLimit } from "@/lib/usage/quotas";

// Opens a subscription for payment inside the site. Answers with the secret
// the Payment Element confirms against, never with a price: what is owed is
// decided here and in Stripe.

function error(status: number, code: string) {
  return NextResponse.json({ error: code }, { status });
}

export async function POST(request: NextRequest) {
  const parsed = subscribeRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) return error(400, "invalid_request");
  const { plan, cycle, locale } = parsed.data;

  const user = await getSession();
  // The client sends them to sign up, keeping what they were doing.
  if (!user) return error(401, "unauthenticated");

  // Creating subscriptions is a Stripe write; a loop here costs money and
  // leaves incomplete subscriptions behind.
  if (!(await checkBurstLimit(`subscribe:${user.id}`)).allowed) {
    return error(429, "rate_limited");
  }

  // Already paying: a second subscription would bill twice for the same
  // account. Changing plan is the portal's job.
  if (await hasLiveSubscription(user.id)) {
    return error(409, "already_subscribed");
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  try {
    // The IP goes to Stripe so it can work out the tax jurisdiction, and
    // into our own row only as a hash (below).
    const customerId = await ensureCustomer(user.id, user.email ?? null, ip);
    const result = await createSubscription({
      userId: user.id,
      customerId,
      tier: plan,
      interval: cycle,
      locale,
    });

    // Written before the card is confirmed, and deliberately not awaited on
    // the happy path alone: a consent recorded after the money moved proves
    // nothing about what was on screen beforehand. If this insert fails the
    // request still fails -- an unprovable charge is worse than no charge.
    try {
      await getDb()
        .insert(billingConsents)
        .values({
          userId: user.id,
          ipHash: hashIp(ip ?? "0.0.0.0"),
          userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
          termsVersion: TERMS_VERSION,
          plan,
          interval: cycle,
          amountTodayCents: result.amountTodayCents,
          amountNextCents: result.amountNextCents,
          nextChargeAt: result.nextChargeAt,
          stripeSubscriptionId: result.subscriptionId,
          locale,
        });
    } catch (e) {
      // The subscription above already exists in Stripe. Failing the
      // request without taking it back would leave a live trial nobody
      // asked for and refuse every later attempt as `already_subscribed`,
      // which is a worse state than the failure itself.
      await undoSubscription(result.subscriptionId);
      throw e;
    }

    return NextResponse.json(
      {
        clientSecret: result.clientSecret,
        mode: result.mode,
        subscriptionId: result.subscriptionId,
        amountTodayCents: result.amountTodayCents,
        amountNextCents: result.amountNextCents,
        nextChargeAt: result.nextChargeAt?.toISOString() ?? null,
        trialDays: result.trialDays,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (e) {
    if (e instanceof SubscribeError) return error(400, e.code);
    console.error(`[subscribe] ${e instanceof Error ? e.message : String(e)}`);
    Sentry.captureException(e);
    return error(500, "server_error");
  }
}
