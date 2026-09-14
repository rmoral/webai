import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { TrialEndingEmail } from "@/emails/trial-ending";
import { WelcomeEmail } from "@/emails/welcome";
import { getStripe } from "@/lib/billing/stripe";
import { getDb } from "@/lib/db/client";
import { events, stripeEvents, subscriptions, users } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";

// Statuses that keep Pro access (entitlements uses the same set).
const PRO_STATUSES = new Set(["trialing", "active", "past_due"]);

function subscriptionFields(sub: Stripe.Subscription) {
  // current_period_end moved to subscription items in newer Stripe API versions.
  const periodEnd =
    sub.items?.data[0]?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end;
  return {
    stripeSubscriptionId: sub.id,
    stripeCustomerId: sub.customer as string,
    plan: (PRO_STATUSES.has(sub.status) ? "pro" : "free") as "pro" | "free",
    interval: sub.items?.data[0]?.price?.recurring?.interval ?? null,
    status: sub.status as typeof subscriptions.$inferInsert.status,
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    cancelAtPeriodEnd: sub.cancel_at_period_end ? 1 : 0,
    updatedAt: new Date(),
  };
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      secret,
    );
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const db = getDb();

  // Idempotency: first insert wins; replays are acknowledged and skipped.
  const inserted = await db
    .insert(stripeEvents)
    .values({ id: event.id })
    .onConflictDoNothing()
    .returning({ id: stripeEvents.id });
  if (inserted.length === 0) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const email = session.customer_details?.email;
        if (!userId || !session.subscription) break;

        const sub = await getStripe().subscriptions.retrieve(
          session.subscription as string,
        );

        if (email) {
          await db
            .insert(users)
            .values({ id: userId, email })
            .onConflictDoNothing();
        }
        const fields = subscriptionFields(sub);
        await db
          .insert(subscriptions)
          .values({ userId, ...fields })
          .onConflictDoUpdate({
            target: subscriptions.userId,
            set: fields,
          });

        // Attribution mirror for Ads conversions (gclid wiring in Sprint 4).
        await db.insert(events).values({
          userId,
          name: "purchase",
          props: { amountTotal: session.amount_total, mode: session.mode },
        });

        if (email) {
          await sendEmail({
            to: email,
            subject: "Tu prueba de Verbalyx Pro ya está activa",
            react: WelcomeEmail({ appUrl }),
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const fields = subscriptionFields(sub);
        await db
          .update(subscriptions)
          .set(fields)
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        break;
      }

      case "customer.subscription.trial_will_end": {
        const sub = event.data.object;
        const customer = await getStripe().customers.retrieve(
          sub.customer as string,
        );
        const email = customer.deleted ? null : customer.email;
        if (email) {
          await sendEmail({
            to: email,
            subject: "Tu prueba de Verbalyx Pro termina mañana",
            react: TrialEndingEmail({ appUrl }),
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        // Stripe dunning handles retries and emails; keep the trace.
        Sentry.captureMessage("stripe.invoice.payment_failed", {
          level: "warning",
          extra: { eventId: event.id },
        });
        break;
      }
    }
  } catch (error) {
    // Let Stripe retry: remove the idempotency mark before failing.
    await db.delete(stripeEvents).where(eq(stripeEvents.id, event.id));
    Sentry.captureException(error);
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
