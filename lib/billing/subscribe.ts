import { eq } from "drizzle-orm";
import type Stripe from "stripe";

import { ACTIVE_STATUSES } from "@/lib/billing/entitlements";
import {
  PRICES,
  trialDaysFor,
  type BillingInterval,
  type PaidTier,
} from "@/lib/billing/plans";
import { findPrice, getStripe, lookupKeyFor } from "@/lib/billing/stripe";
import { getDb } from "@/lib/db/client";
import { subscriptions } from "@/lib/db/schema";
import type { Locale } from "@/lib/i18n/routing";

// Subscriptions created for payment inside the site. The card is still
// handled by Stripe -- the Payment Element is their iframe and the details
// never reach this server, so the PCI scope stays SAQ A -- but the page
// around it is ours, and the customer never leaves the text they were
// working on.

export type SubscribeRefusal =
  "already_subscribed" | "price_not_configured" | "no_client_secret";

export class SubscribeError extends Error {
  constructor(readonly code: SubscribeRefusal) {
    super(code);
  }
}

export interface SubscribeResult {
  clientSecret: string;
  /** `setup` saves a card for later; `payment` collects money now. */
  mode: "setup" | "payment";
  subscriptionId: string;
  /** Charged today, in cents. Zero whenever a trial starts. */
  amountTodayCents: number;
  /** The first recurring charge, in cents. */
  amountNextCents: number;
  nextChargeAt: Date | null;
  trialDays: number | null;
}

/** Cents Stripe will actually charge, falling back to the shipped price. */
function amountOf(price: Stripe.Price, tier: PaidTier, i: BillingInterval) {
  return price.unit_amount ?? Math.round(PRICES[tier][i].amount * 100);
}

function toDate(seconds: number | null | undefined): Date | null {
  return seconds ? new Date(seconds * 1000) : null;
}

/**
 * The Stripe customer for this user, created once and remembered.
 *
 * Idempotent by the stored id rather than by email: two customers for one
 * account splits their invoices and their payment methods, and nothing
 * afterwards tells you which half you are looking at.
 */
export async function ensureCustomer(
  userId: string,
  email: string | null,
): Promise<string> {
  const db = getDb();
  const [row] = await db
    .select({ customerId: subscriptions.stripeCustomerId })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);
  if (row?.customerId) return row.customerId;

  const customer = await getStripe().customers.create({
    ...(email ? { email } : {}),
    metadata: { user_id: userId },
  });

  await db
    .insert(subscriptions)
    .values({ userId, stripeCustomerId: customer.id })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: { stripeCustomerId: customer.id, updatedAt: new Date() },
    });

  return customer.id;
}

/** True while the account already has something it is paying for. */
export async function hasLiveSubscription(userId: string): Promise<boolean> {
  const [row] = await getDb()
    .select({ status: subscriptions.status, plan: subscriptions.plan })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);
  return (
    !!row &&
    row.plan !== "free" &&
    row.status !== null &&
    (ACTIVE_STATUSES as readonly string[]).includes(row.status)
  );
}

/**
 * Creates the incomplete subscription and hands back the secret the browser
 * confirms against.
 *
 * The two cases are different Stripe mechanisms and this is where that is
 * most often got wrong:
 *
 *   trial   Nothing is owed today, so there is no invoice to pay. What the
 *           browser confirms is a SetupIntent -- it saves the card -- and
 *           the subscription cancels itself if none is saved.
 *   charge  There is an invoice from the first minute, and the browser
 *           confirms its payment.
 *
 * The secret for the second case lives on `latest_invoice.confirmation_secret`.
 * Older guides (including this project's own design document) say
 * `latest_invoice.payment_intent`; that field is gone from the API version
 * this SDK pins, and reading it yields undefined rather than an error.
 */
export async function createSubscription(args: {
  userId: string;
  customerId: string;
  tier: PaidTier;
  interval: BillingInterval;
  locale: Locale;
}): Promise<SubscribeResult> {
  const { tier, interval } = args;
  const trialDays = trialDaysFor(tier, interval);

  const price = await findPrice(lookupKeyFor(tier, interval));
  if (!price) throw new SubscribeError("price_not_configured");

  const subscription = await getStripe().subscriptions.create({
    customer: args.customerId,
    items: [{ price: price.id }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    ...(trialDays
      ? {
          trial_period_days: trialDays,
          // No card saved by the end of the trial means no charge and no
          // access, rather than a subscription nobody can bill.
          trial_settings: {
            end_behavior: { missing_payment_method: "cancel" },
          },
          expand: ["pending_setup_intent"],
        }
      : { expand: ["latest_invoice.confirmation_secret"] }),
    metadata: {
      user_id: args.userId,
      plan: tier,
      cycle: interval,
      locale: args.locale,
    },
  });

  const amount = amountOf(price, tier, interval);
  const invoice = subscription.latest_invoice as Stripe.Invoice | null;
  const setup = subscription.pending_setup_intent as Stripe.SetupIntent | null;

  const clientSecret = trialDays
    ? setup?.client_secret
    : invoice?.confirmation_secret?.client_secret;

  if (!clientSecret) {
    // Recoverable for the customer -- nothing was charged -- but not for
    // this request. Leaving the incomplete subscription behind would block
    // their next attempt on `already_subscribed`, so it goes.
    await getStripe()
      .subscriptions.cancel(subscription.id)
      .catch(() => {});
    throw new SubscribeError("no_client_secret");
  }

  return {
    clientSecret,
    mode: trialDays ? "setup" : "payment",
    subscriptionId: subscription.id,
    amountTodayCents: trialDays ? 0 : amount,
    amountNextCents: amount,
    nextChargeAt: trialDays
      ? toDate(subscription.trial_end)
      : toDate(subscription.items.data[0]?.current_period_end),
    trialDays,
  };
}
