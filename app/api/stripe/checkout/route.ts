import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth/server";
import { getSubscriber } from "@/lib/billing/entitlements";
import { TRIAL } from "@/lib/billing/plans";
import { findPrice, getStripe, lookupKeyFor } from "@/lib/billing/stripe";
import { getDb } from "@/lib/db/client";
import { events } from "@/lib/db/schema";
import { hashIp } from "@/lib/security/crypto";

// Terms version recorded with the consent, per study §6.7.
const TERMS_VERSION = "2026-09-15";

const bodySchema = z.object({
  plan: z.enum(["pro", "unlimited", "topup"]),
  interval: z.enum(["monthly", "yearly"]).default("yearly"),
});

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const { plan, interval } = parsed.data;

  const subscriber = await getSubscriber(user.id);

  // Top-ups top up an existing plan: they are worthless without one.
  if (plan === "topup" && subscriber.plan.id === "free") {
    return NextResponse.json(
      { error: "subscription_required" },
      { status: 403 },
    );
  }

  const price = await findPrice(lookupKeyFor(plan, interval));
  if (!price) {
    return NextResponse.json(
      { error: "price_not_configured" },
      { status: 503 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const isSubscription = plan !== "topup";
  // The trial is only offered on Ilimitado monthly, and only to newcomers.
  const withTrial =
    isSubscription &&
    plan === TRIAL.tier &&
    interval === TRIAL.interval &&
    subscriber.plan.id === "free";

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: isSubscription ? "subscription" : "payment",
      line_items: [{ price: price.id, quantity: 1 }],
      client_reference_id: user.id,
      // Reusing the customer keeps one billing profile per user; a brand
      // new customer only gets an email (customer_update needs a customer).
      ...(subscriber.subscriptionId || subscriber.plan.id !== "free"
        ? {}
        : { customer_email: user.email }),
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      // Required by Stripe Tax in the US: tax follows the buyer's address.
      ...(subscriber.plan.id !== "free"
        ? {
            customer_update: {
              address: "auto" as const,
              name: "auto" as const,
            },
          }
        : {}),
      consent_collection: { terms_of_service: "required" },
      locale: "es",
      ...(isSubscription
        ? {
            payment_method_collection: "always" as const,
            subscription_data: {
              ...(withTrial
                ? {
                    trial_period_days: TRIAL.days,
                    trial_settings: {
                      end_behavior: {
                        missing_payment_method: "cancel" as const,
                      },
                    },
                  }
                : {}),
              metadata: {
                user_id: user.id,
                plan,
                origin: withTrial ? "trial_3d" : "direct",
              },
            },
          }
        : { metadata: { user_id: user.id, purchase: "topup" } }),
      success_url: `${appUrl}/app?checkout=success`,
      cancel_url: `${appUrl}/precios?checkout=cancelled`,
    });

    // Auditable consent record: who, when, from where, which terms.
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    await getDb()
      .insert(events)
      .values({
        userId: user.id,
        name: "checkout_started",
        props: {
          plan,
          interval,
          trial: withTrial,
          termsVersion: TERMS_VERSION,
          sessionId: session.id,
          ipHash: ip ? hashIp(ip) : null,
        },
      });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "checkout_failed" }, { status: 502 });
  }
}
