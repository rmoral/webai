import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { sendSubscriptionConfirmation } from "@/lib/billing/notify";
import { ACTIVE_STATUSES } from "@/lib/billing/entitlements";
import { resolveEntitlements } from "@/lib/billing/metadata";
import { TOPUP } from "@/lib/billing/plans";
import { getStripe } from "@/lib/billing/stripe";
import { getDb } from "@/lib/db/client";
import { events, stripeEvents, subscriptions, users } from "@/lib/db/schema";
import { isLocale, routing, type Locale } from "@/lib/i18n/routing";
import { addTopupWords } from "@/lib/usage/quotas";

// The events of study §3.4, less customer.subscription.trial_will_end and
// plus setup_intent.succeeded.
//
// trial_will_end fires three days before a trial ends, which on a
// three-day trial is the moment it is created: it was sending "your trial
// ends tomorrow" on day zero. The 24-hour warning is a cron of ours
// (app/api/cron/trial-reminder), which is the only way to get it right. Idempotency is
// enforced by inserting the event id first; the mark is rolled back if the
// handler throws, so Stripe retries a failed delivery instead of skipping it
// as a duplicate.
//
// Which event confirms a sale moved with the embedded payment flow. There is
// no checkout session any more, so it can no longer be the thing that sends
// the confirmation email -- and it could never have been, for a trial, since
// a trial has no session and no invoice. The two moments that do exist in
// both flows are:
//
//   setup_intent.succeeded   a card was saved: the trial is real and will be
//                            able to convert.
//   invoice.paid             money moved. Only the first invoice of a
//                            subscription is a sale; the rest are renewals.
//
// Sending from those two, and from nowhere else, is what keeps a customer
// who paid through either door from getting the email twice or not at all.

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
    // Read by the end-of-trial wall, which has to appear before the charge,
    // and by the 24-hour reminder. Neither can call Stripe on the hot path.
    trialEnd: timestampToDate(sub.trial_end),
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
  // Trimmed: a newline picked up while pasting into a dashboard fails
  // verification exactly like a wrong secret, and reads as one.
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
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
    // Two different mistakes arrive as the same failure. A value that is
    // not a signing secret at all -- the endpoint id `we_…`, an API key --
    // is worth naming apart, because looking for the "right" secret when
    // the wrong *kind* of value is configured wastes the whole search.
    // The value itself is never logged.
    console.error(
      secret.startsWith("whsec_")
        ? "[webhook] signature verification failed. STRIPE_WEBHOOK_SECRET is a signing secret, but not this endpoint's: every endpoint has its own, and test and live never share one. Copy it from this endpoint's page in Stripe and redeploy — Vercel only applies a variable to new deployments."
        : "[webhook] STRIPE_WEBHOOK_SECRET does not look like a signing secret: it must start with whsec_. The endpoint id (we_…) and the API key (sk_…) are different values and neither will ever verify.",
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

  /**
   * The language this customer was reading when they paid, put into the
   * Stripe metadata at checkout. Anything else -- a subscription created
   * before this shipped, or through the Stripe dashboard -- falls back to
   * the default rather than guessing.
   */
  const localeOf = (metadata?: Stripe.Metadata | null): Locale => {
    const value = metadata?.locale;
    return typeof value === "string" && isLocale(value)
      ? value
      : routing.defaultLocale;
  };

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
          // The email is sent by invoice.paid or setup_intent.succeeded,
          // whichever applies; both fire for a hosted session too.
          await upsertSubscription(userId, sub);
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

      // 2. The card was saved during a trial. Nothing is owed yet, so no
      // invoice event will arrive -- this is the only confirmation that the
      // trial will actually be able to convert, rather than cancelling
      // itself for want of a payment method.
      case "setup_intent.succeeded": {
        const intent = event.data.object;
        const customer = intent.customer;
        if (!customer) break;
        const subscription = await getStripe().subscriptions.list({
          customer: typeof customer === "string" ? customer : customer.id,
          status: "trialing",
          limit: 1,
        });
        const sub = subscription.data[0];
        if (!sub) break;
        await applySubscription(sub);

        const trialEmail = await customerEmail(
          typeof customer === "string" ? customer : customer.id,
        );
        if (trialEmail) {
          await sendSubscriptionConfirmation({
            subscription: sub,
            to: trialEmail,
            locale: localeOf(sub.metadata),
            appUrl,
            paidTodayCents: 0,
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
        const paidSub = await getStripe().subscriptions.retrieve(
          typeof subscriptionId === "string"
            ? subscriptionId
            : subscriptionId.id,
        );
        await applySubscription(paidSub);

        // A renewal is not a sale, and a customer who gets "welcome" every
        // month stops reading the ones that matter.
        if (
          invoice.billing_reason === "subscription_create" &&
          invoice.customer
        ) {
          const buyer = await customerEmail(
            typeof invoice.customer === "string"
              ? invoice.customer
              : invoice.customer.id,
          );
          if (buyer) {
            await sendSubscriptionConfirmation({
              subscription: paidSub,
              to: buyer,
              locale: localeOf(paidSub.metadata),
              appUrl,
              paidTodayCents: invoice.amount_paid ?? 0,
            });
          }
        }
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
