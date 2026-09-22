import { eq } from "drizzle-orm";
import type Stripe from "stripe";

import { ACTIVE_STATUSES } from "@/lib/billing/entitlements";
import {
  PAYMENT_METHOD_TYPES,
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
  /**
   * The caller's IP, for Stripe to infer the tax jurisdiction.
   *
   * CLAUDE.md forbids persisting an IP in the clear and this does not: it
   * is handed to the payment processor that needs it and never written to
   * our tables (the consent row stores hashIp). Inferring from the address
   * would mean asking for one, and with tax-inclusive prices the total is
   * the same wherever they are -- only the split between net and tax
   * moves -- so the friction would buy nothing.
   */
  ip: string | null,
): Promise<string> {
  const db = getDb();
  const tax = ip ? { tax: { ip_address: ip } } : {};
  const [row] = await db
    .select({ customerId: subscriptions.stripeCustomerId })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);
  if (row?.customerId) {
    // Refreshed on every attempt: people move, and a stale location is a
    // tax line computed for somewhere they no longer are.
    if (ip) {
      await getStripe()
        .customers.update(row.customerId, tax)
        .catch(() => {});
    }
    return row.customerId;
  }

  const customer = await getStripe().customers.create({
    ...(email ? { email } : {}),
    ...tax,
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
/**
 * The parameters of the subscription, as a value.
 *
 * Pure and exported so the rules that matter -- tax on, the trial only
 * where it belongs, the right field expanded for each of the two charging
 * mechanisms -- can be asserted without a Stripe account. They were
 * previously an object literal inside the API call, which is the one place
 * a test cannot reach.
 */
export function subscriptionParams(args: {
  customerId: string;
  priceId: string;
  userId: string;
  tier: PaidTier;
  interval: BillingInterval;
  locale: Locale;
}): Stripe.SubscriptionCreateParams {
  const trialDays = trialDaysFor(args.tier, args.interval);

  return {
    customer: args.customerId,
    items: [{ price: args.priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: {
      save_default_payment_method: "on_subscription",
      // The Element is built from the same list; see PAYMENT_METHOD_TYPES.
      payment_method_types: [...PAYMENT_METHOD_TYPES],
    },
    // Prices are tax-inclusive, so this does not change what anybody pays:
    // it splits the amount into net and tax so the invoice is correct and
    // the tax is actually declared. Without it the whole 29,99 is booked as
    // revenue and the VAT on an EU sale comes out of the margin unrecorded.
    automatic_tax: { enabled: true },
    ...(trialDays
      ? {
          trial_period_days: trialDays,
          // No card saved by the end of the trial means no charge and no
          // access, rather than a subscription nobody can bill.
          trial_settings: {
            end_behavior: { missing_payment_method: "cancel" as const },
          },
          expand: ["pending_setup_intent"],
        }
      : { expand: ["latest_invoice.confirmation_secret"] }),
    metadata: {
      user_id: args.userId,
      plan: args.tier,
      cycle: args.interval,
      locale: args.locale,
    },
  };
}

/**
 * Removes a subscription this request created and could not finish.
 *
 * A trial subscription is live from the moment it exists, so one left
 * behind is not litter: the webhook writes it to our table, and from then
 * on every further attempt is refused as `already_subscribed` -- locking
 * out an account that never got as far as entering a card. Best effort,
 * because the failure that brought us here is the one worth reporting.
 */
export async function undoSubscription(subscriptionId: string) {
  await getStripe()
    .subscriptions.cancel(subscriptionId)
    .catch(() => {});
}

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

  const subscription = await getStripe().subscriptions.create(
    subscriptionParams({
      customerId: args.customerId,
      priceId: price.id,
      userId: args.userId,
      tier,
      interval,
      locale: args.locale,
    }),
  );

  const amount = amountOf(price, tier, interval);
  const invoice = subscription.latest_invoice as Stripe.Invoice | null;
  const setup = subscription.pending_setup_intent as Stripe.SetupIntent | null;

  const clientSecret = trialDays
    ? setup?.client_secret
    : invoice?.confirmation_secret?.client_secret;

  if (!clientSecret) {
    // Recoverable for the customer -- nothing was charged -- but not for
    // this request.
    await undoSubscription(subscription.id);
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
