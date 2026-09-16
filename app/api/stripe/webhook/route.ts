import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { TrialEndingEmail } from "@/emails/trial-ending";
import { WelcomeEmail } from "@/emails/welcome";
import { ACTIVE_STATUSES } from "@/lib/billing/entitlements";
import { resolveEntitlements } from "@/lib/billing/metadata";
import { TOPUP } from "@/lib/billing/plans";
import { getStripe } from "@/lib/billing/stripe";
import { getDb } from "@/lib/db/client";
import { events, stripeEvents, subscriptions, users } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";
import { addTopupWords } from "@/lib/usage/quotas";

// The seven events of study §3.4. Idempotency is enforced by inserting the
// event id first; the mark is rolled back if the handler throws, so Stripe
// retries a failed delivery instead of skipping it as a duplicate.

function timestampToDate(seconds: number | null | undefined): Date | null {
  return seconds ? new Date(seconds * 1000) : null;
}

/**
 * Maps a Stripe subscription onto our row, resolving the plan limits from
 * the product metadata (falling back to plans.ts) and snapshotting them.
 */
async function subscriptionFields(sub: Stripe.Subscription) {
  const item = sub.items?.data[0];
  const price = item?.price;
  const active = (ACTIVE_STATUSES as readonly string[]).includes(sub.status);

  let product: Stripe.Product | null = null;
  if (price?.product) {
    product =
      typeof price.product === "string"
        ? ((await getStripe().products.retrieve(
            price.product,
          )) as Stripe.Product)
        : (price.product as Stripe.Product);
  }

  const fallbackTier =
    (sub.metadata?.plan as "pro" | "unlimited" | undefined) ?? "pro";
  const resolved = resolveEntitlements(product?.metadata, fallbackTier);

  return {
    stripeSubscriptionId: sub.id,
    stripeCustomerId: sub.customer as string,
    plan: (active ? resolved.tier : "free") as "pro" | "unlimited" | "free",
    entitlements: resolved.limits,
    interval: price?.recurring?.interval ?? null,
    status: sub.status as typeof subscriptions.$inferInsert.status,
    currentPeriodStart: timestampToDate(item?.current_period_start),
    currentPeriodEnd: timestampToDate(item?.current_period_end),
    cancelAtPeriodEnd: sub.cancel_at_period_end ? 1 : 0,
    updatedAt: new Date(),
  };
}

async function upsertSubscription(userId: string, sub: Stripe.Subscription) {
  const fields = await subscriptionFields(sub);
  await getDb()
    .insert(subscriptions)
    .values({ userId, ...fields })
    .onConflictDoUpdate({ target: subscriptions.userId, set: fields });
}

/**
 * Applies a subscription to our row, creating it if the row is missing.
 *
 * checkout.session.completed is what normally creates it, and it is the
 * only event carrying client_reference_id. When that one delivery is lost
 * -- a redirect Stripe will not follow, an endpoint added after the first
 * sale, an outage -- every later event was an UPDATE matching no row, so
 * the customer kept paying and kept the free plan, and nothing said so.
 * The subscription metadata carries the user id, so any later event can
 * repair the state instead of discarding it.
 */
async function applySubscription(sub: Stripe.Subscription) {
  const updated = await getDb()
    .update(subscriptions)
    .set(await subscriptionFields(sub))
    .where(eq(subscriptions.stripeSubscriptionId, sub.id))
    .returning({ userId: subscriptions.userId });
  if (updated.length > 0) return;

  const userId = sub.metadata?.user_id;
  if (!userId) {
    console.error(
      `[webhook] ${sub.id} has no local row and no user_id in its metadata: the account cannot be identified`,
    );
    Sentry.captureMessage("stripe.subscription.unattributed", {
      level: "error",
      extra: { subscriptionId: sub.id },
    });
    return;
  }

  await upsertSubscription(userId, sub);
  console.warn(
    `[webhook] recreated the missing row for ${sub.id}: an earlier checkout.session.completed never arrived`,
  );
}

async function customerEmail(customer: string): Promise<string | null> {
  const record = await getStripe().customers.retrieve(customer);
  return record.deleted ? null : record.email;
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    console.error(
      `[webhook] rejected: ${secret ? "request carried no stripe-signature header" : "STRIPE_WEBHOOK_SECRET is not set"}`,
    );
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
    // Almost always the wrong secret: each endpoint in Stripe has its own,
    // and test and live endpoints never share one.
    console.error(
      "[webhook] signature verification failed. STRIPE_WEBHOOK_SECRET must be the signing secret of this exact endpoint, in this exact mode.",
    );
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const db = getDb();
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
      // 1. New subscription or word top-up.
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const email = session.customer_details?.email;
        if (!userId) {
          // Someone paid and we cannot say who: the session did not come
          // from our checkout route, which is the only thing that sets
          // client_reference_id. Answering 200 is right -- a retry would
          // carry the same missing field -- but doing it silently leaves a
          // paying customer on the free plan with nothing to find them by.
          console.error(
            `[webhook] unattributed payment: session=${session.id} email=${email ?? "unknown"}`,
          );
          Sentry.captureMessage("stripe.checkout.unattributed", {
            level: "error",
            extra: { eventId: event.id, sessionId: session.id },
          });
          break;
        }

        if (email) {
          await db
            .insert(users)
            .values({ id: userId, email })
            .onConflictDoNothing();
        }

        if (session.mode === "payment") {
          await addTopupWords(userId, TOPUP.words);
        } else if (session.subscription) {
          const sub = await getStripe().subscriptions.retrieve(
            session.subscription as string,
          );
          await upsertSubscription(userId, sub);
          if (email) {
            await sendEmail({
              to: email,
              subject: "Tu prueba de Verbalyx ya está activa",
              react: WelcomeEmail({ appUrl }),
            });
          }
        }

        // Mirrored for the Google Ads conversion (gclid wiring, sprint 4).
        await db.insert(events).values({
          userId,
          name: "purchase",
          props: {
            amountTotal: session.amount_total,
            currency: session.currency,
            mode: session.mode,
          },
        });
        break;
      }

      // 2. Reminder 24 h before the trial converts (required by §6.5).
      case "customer.subscription.trial_will_end": {
        const sub = event.data.object;
        const email = await customerEmail(sub.customer as string);
        if (email) {
          await sendEmail({
            to: email,
            subject: "Tu prueba de Verbalyx termina mañana",
            react: TrialEndingEmail({ appUrl }),
          });
        }
        break;
      }

      // 3. Plan or status change: recompute entitlements.
      case "customer.subscription.updated": {
        await applySubscription(event.data.object);
        break;
      }

      // 4. Cancelled: back to free. The date feeds the win-back campaign.
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await db
          .update(subscriptions)
          .set({
            plan: "free",
            status: "canceled",
            entitlements: null,
            canceledAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        break;
      }

      // 5. Renewal paid: move the period forward. The monthly quota key is
      // derived from this date, so the allowance resets by itself.
      case "invoice.paid": {
        const invoice = event.data.object;
        const subscriptionId = invoice.lines?.data[0]?.subscription;
        if (!subscriptionId) break;
        await applySubscription(
          await getStripe().subscriptions.retrieve(
            typeof subscriptionId === "string"
              ? subscriptionId
              : subscriptionId.id,
          ),
        );
        break;
      }

      // 6. Payment failed: Stripe dunning retries and emails the customer.
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subscriptionId = invoice.lines?.data[0]?.subscription;
        if (subscriptionId) {
          await db
            .update(subscriptions)
            .set({ status: "past_due", updatedAt: new Date() })
            .where(
              eq(
                subscriptions.stripeSubscriptionId,
                typeof subscriptionId === "string"
                  ? subscriptionId
                  : subscriptionId.id,
              ),
            );
        }
        Sentry.captureMessage("stripe.invoice.payment_failed", {
          level: "warning",
          extra: { eventId: event.id, customer: invoice.customer },
        });
        break;
      }

      // 7. Chargeback: drop to free and alert. Disputes are the metric that
      // can close the payment gateway (§4), so they page the owner.
      case "charge.dispute.created": {
        const dispute = event.data.object;
        const customer =
          typeof dispute.charge === "string"
            ? null
            : ((dispute.charge as Stripe.Charge)?.customer as string | null);
        const customerId = customer ?? null;

        if (customerId) {
          await db
            .update(subscriptions)
            .set({
              plan: "free",
              entitlements: null,
              suspendedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeCustomerId, customerId));
        }

        Sentry.captureMessage("stripe.charge.dispute.created", {
          level: "error",
          extra: {
            eventId: event.id,
            amount: dispute.amount,
            reason: dispute.reason,
            customer: customerId,
          },
        });
        break;
      }
    }
  } catch (error) {
    // Let Stripe retry: remove the idempotency mark before failing.
    await db.delete(stripeEvents).where(eq(stripeEvents.id, event.id));
    console.error(
      `[webhook] ${event.type} failed, Stripe will retry: ${error instanceof Error ? error.message : String(error)}`,
    );
    Sentry.captureException(error);
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
