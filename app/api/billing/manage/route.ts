import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth/server";
import { getStripe, findPrice, lookupKeyFor } from "@/lib/billing/stripe";
import { getDb } from "@/lib/db/client";
import { subscriptions } from "@/lib/db/schema";
import { manageSubscriptionSchema } from "@/lib/security/validation";

// The two exits from the end-of-trial wall, and from the account page.
//
// Both only ever reduce what someone is charged -- down to Pro, or to
// nothing. That is what makes them safe to put on a screen with no way out:
// the wall cannot be used to charge anybody more than they already agreed
// to, whatever is sent to it.
//
// Cancelling is deliberately not a Stripe Portal round-trip. We promise two
// clicks in the paywall, in the checkout and in both emails, and a promise
// of two clicks has to be two clicks.

function error(status: number, code: string) {
  return NextResponse.json({ error: code }, { status });
}

export async function POST(request: NextRequest) {
  const parsed = manageSubscriptionSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) return error(400, "invalid_request");

  const user = await getSession();
  if (!user) return error(401, "unauthenticated");

  const [row] = await getDb()
    .select({ subscriptionId: subscriptions.stripeSubscriptionId })
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .limit(1);
  if (!row?.subscriptionId) return error(404, "no_subscription");

  try {
    const stripe = getStripe();

    if (parsed.data.action === "cancel") {
      // At period end, not immediately: during a trial that means the trial
      // runs out with no charge, and on a paid plan it means they keep what
      // they have already paid for.
      await stripe.subscriptions.update(row.subscriptionId, {
        cancel_at_period_end: true,
      });
      return NextResponse.json({ ok: true, action: "cancel" });
    }

    const price = await findPrice(lookupKeyFor("pro", "monthly"));
    if (!price) return error(400, "price_not_configured");

    const current = await stripe.subscriptions.retrieve(row.subscriptionId);
    const item = current.items.data[0];
    if (!item) return error(400, "no_subscription");

    await stripe.subscriptions.update(row.subscriptionId, {
      items: [{ id: item.id, price: price.id }],
      // The difference is credited or charged automatically, which is what
      // the wall's disclosure promises in as many words.
      proration_behavior: "create_prorations",
      metadata: { ...current.metadata, plan: "pro", cycle: "monthly" },
    });

    // The row is refreshed by customer.subscription.updated; nothing here
    // writes entitlements, so the two paths cannot disagree.
    return NextResponse.json({ ok: true, action: "switch_to_pro" });
  } catch (e) {
    console.error(
      `[billing/manage] ${e instanceof Error ? e.message : String(e)}`,
    );
    Sentry.captureException(e);
    return error(500, "server_error");
  }
}
