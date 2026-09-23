import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import type { FunnelEvents } from "@/lib/analytics/events";
import { trackServer } from "@/lib/analytics/server";
import {
  planLabel,
  receiptRows,
  sendCancellation,
  sendSubscriptionConfirmation,
} from "@/lib/billing/notify";
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
async function applySubscription(
  sub: Stripe.Subscription,
): Promise<string | null> {
  const updated = await getDb()
    .update(subscriptions)
    .set(await subscriptionFields(sub))
    .where(eq(subscriptions.stripeSubscriptionId, sub.id))
    .returning({ userId: subscriptions.userId });
  if (updated.length > 0) return updated[0].userId;

  const userId = sub.metadata?.user_id;
  if (!userId) {
    console.error(
      `[webhook] ${sub.id} has no local row and no user_id in its metadata: the account cannot be identified`,
    );
    Sentry.captureMessage("stripe.subscription.unattributed", {
      level: "error",
      extra: { subscriptionId: sub.id },
    });
    return null;
  }

  await upsertSubscription(userId, sub);
  console.warn(
    `[webhook] recreated the missing row for ${sub.id}: an earlier checkout.session.completed never arrived`,
  );
  return userId;
}

/**
 * What was bought, read off the subscription itself.
 *
 * The cycle comes from the price rather than from our metadata: a plan
 * changed in the Stripe dashboard moves the price and leaves the metadata
 * behind, and a revenue number that disagrees with the invoice is worse
 * than no number.
 */
function saleOf(
  sub: Stripe.Subscription,
  amountCents: number,
  trial: boolean,
): FunnelEvents["purchase"] {
  const interval = sub.items?.data[0]?.price?.recurring?.interval;
  return {
    plan: sub.metadata?.plan === "unlimited" ? "unlimited" : "pro",
    cycle: interval === "year" ? "yearly" : "monthly",
    amount: amountCents / 100,
    trial,
  };
}

/**
 * A sale, recorded in both places that need it.
 *
 * `purchase` is emitted here and never from a browser. The tab that paid
 * can be closed by the redirect, locked by a phone or killed by a bank's
 * 3-D Secure app, so a sale counted on the client is always low and never
 * by a knowable amount. The row in `events` is the same fact kept for Ads
 * attribution, which reads from our own database rather than PostHog.
 */
async function reportPurchase(
  userId: string,
  props: FunnelEvents["purchase"],
): Promise<void> {
  await getDb().insert(events).values({ userId, name: "purchase", props });
  await trackServer(userId, "purchase", props);
}

async function customerEmail(customer: string): Promise<string | null> {
  const record = await getStripe().customers.retrieve(customer);
  return record.deleted ? null : record.email;
}

/**
 * The language this customer was reading when they paid, put into the
 * Stripe metadata at checkout. Anything else -- a subscription created
 * before this shipped, or through the Stripe dashboard -- falls back to
 * the default rather than guessing.
 */
function localeOf(metadata?: Stripe.Metadata | null): Locale {
  const value = metadata?.locale;
  return typeof value === "string" && isLocale(value)
    ? value
    : routing.defaultLocale;
}

/** "Pro · anual", from the metadata the checkout wrote. */
function planOf(locale: Locale, sub: Stripe.Subscription): string {
  return planLabel(
    locale,
    sub.metadata?.plan,
    sub.items.data[0]?.price?.recurring?.interval,
  );
}

/**
 * The cancellation email, on whichever of the two events reported it.
 *
 * Never allowed to fail the webhook: Stripe retries a non-2xx, and a
 * retried cancellation would re-run everything else in the handler to send
 * one email again. The customer is cancelled either way.
 */
async function cancellationEmail(
  sub: Stripe.Subscription,
  appUrl: string,
): Promise<void> {
  try {
    const customer =
      typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const to = await customerEmail(customer);
    if (!to) return;
    await sendCancellation({
      subscription: sub,
      to,
      locale: localeOf(sub.metadata),
      appUrl,
      // Cancelled before the first charge: nothing was ever taken, which
      // is the single thing this email has to be unambiguous about.
      trial: sub.status === "trialing",
      lastChargeCents: sub.items.data[0]?.price?.unit_amount ?? null,
      lastChargeAt: sub.start_date ? new Date(sub.start_date * 1000) : null,
    });
  } catch (error) {
    Sentry.captureException(error);
  }
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
          // A top-up is a single payment and has no invoice event of its
          // own, so this is where it is counted. A subscription is not
          // counted here: it is counted by invoice.paid or by
          // setup_intent.succeeded, which is the only pair of moments
          // that exists in both the hosted and the embedded flow. Counting
          // it in both places would double every sale made through a
          // hosted session.
          await reportPurchase(userId, {
            plan: "topup",
            cycle: null,
            amount: (session.amount_total ?? 0) / 100,
            trial: false,
          });
        } else if (session.subscription) {
          const sub = await getStripe().subscriptions.retrieve(
            session.subscription as string,
          );
          // The email is sent by invoice.paid or setup_intent.succeeded,
          // whichever applies; both fire for a hosted session too.
          await upsertSubscription(userId, sub);
        }
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
        const trialUserId = await applySubscription(sub);

        // A trial charges nothing today and is still the sale: it is the
        // moment a card exists and a date is set. `amount` is 0, `trial`
        // is true, and the conversion three days later is the renewal.
        if (trialUserId) {
          await reportPurchase(trialUserId, saleOf(sub, 0, true));
        }

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
        const sub = event.data.object;
        const userId = await applySubscription(sub);

        // Cancelling is the one change worth its own event, and it is
        // reported from here rather than from the button: most of them
        // happen in the Stripe portal, where there is no button of ours
        // to fire. The flag turning on is the moment they left; the
        // subscription itself runs to the end of the paid period.
        const wasCancelling = (
          event.data.previous_attributes as
            { cancel_at_period_end?: boolean } | undefined
        )?.cancel_at_period_end;
        if (userId && sub.cancel_at_period_end && wasCancelling === false) {
          await trackServer(userId, "cancel_done", {
            plan: sub.metadata?.plan === "unlimited" ? "unlimited" : "pro",
          });
          // Same condition as the event above, so the email is sent once
          // per subscription for the same reason the count is right.
          await cancellationEmail(sub, appUrl);
        }
        break;
      }

      // 4. Cancelled: back to free. The date feeds the win-back campaign.
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const gone = await db
          .update(subscriptions)
          .set({
            plan: "free",
            status: "canceled",
            entitlements: null,
            canceledAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id))
          .returning({ userId: subscriptions.userId });

        // Only when it ended outright. A subscription already flagged to
        // stop at period end was counted the day they asked, and counting
        // it again here would make every cancellation look like two.
        if (gone[0] && !sub.cancel_at_period_end) {
          await trackServer(gone[0].userId, "cancel_done", {
            plan: sub.metadata?.plan === "unlimited" ? "unlimited" : "pro",
          });
          await cancellationEmail(sub, appUrl);
        }
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
        const paidUserId = await applySubscription(paidSub);

        // A renewal is not a sale, and a customer who gets "welcome" every
        // month stops reading the ones that matter.
        if (invoice.billing_reason === "subscription_create" && paidUserId) {
          await reportPurchase(
            paidUserId,
            saleOf(paidSub, invoice.amount_paid ?? 0, false),
          );
        }

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
            const locale = localeOf(paidSub.metadata);
            const paidCents = invoice.amount_paid ?? 0;
            await sendSubscriptionConfirmation({
              subscription: paidSub,
              to: buyer,
              locale,
              appUrl,
              paidTodayCents: paidCents,
              // A trial's first invoice is for nothing, and a receipt for
              // nothing is a receipt nobody needs.
              receipt:
                paidCents > 0
                  ? await receiptRows({
                      stripe: getStripe(),
                      invoice,
                      locale,
                      plan: planOf(locale, paidSub),
                    })
                  : undefined,
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
