import { createFormatter } from "next-intl";
import type Stripe from "stripe";

import { CancellationEmail } from "@/emails/cancellation";
import type { DataRow } from "@/emails/layout";
import { SubscriptionConfirmationEmail } from "@/emails/subscription-confirmation";
import { TrialReminderEmail } from "@/emails/trial-reminder";
import { WelcomeEmail, welcomeWords } from "@/emails/welcome";
import { emailTranslator, planTranslator } from "@/emails/translator";
import { PLANS, PRICES, formatUsd } from "@/lib/billing/plans";
import { sendEmail } from "@/lib/email";
import type { Locale } from "@/lib/i18n/routing";

// The two billing emails, and the figures they exist to carry.
//
// Both are rendered outside a request -- one from a Stripe webhook, one
// from a cron -- so the date has to be formatted without a locale context.
// createFormatter does that, and it is the same formatter the pages use, so
// "21 de septiembre de 2026" cannot come out one way on screen and another
// in the inbox.

/**
 * The month in words, always: 09/13/2026 means two different days to two
 * readers, and a first-charge date cannot be ambiguous.
 *
 * Pinned to UTC. Any zone shifts a charge near midnight by a day for
 * somebody, and there is no zone that is right for every customer; UTC at
 * least makes the date deterministic and matches what Stripe shows us.
 * Without an explicit zone next-intl falls back to the server's, so the
 * same subscription could be dated differently by the webhook and by the
 * cron.
 */
export function longDate(locale: Locale, date: Date): string {
  return createFormatter({ locale, timeZone: "UTC" }).dateTime(date, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Numbers as the reader's language writes them, outside a request. */
function numberIn(locale: Locale): (value: number) => string {
  const format = createFormatter({ locale, timeZone: "UTC" });
  return (value) => format.number(value);
}

/** "Pro · anual", from the metadata the checkout wrote. */
export function planLabel(
  locale: Locale,
  tier: string | undefined,
  interval: string | undefined,
): string {
  const t = emailTranslator(locale);
  const plans = planTranslator(locale);
  return t("planCycle", {
    plan: plans(tier === "unlimited" ? "unlimited" : "pro"),
    cycle: t(interval === "year" ? "cycleYearly" : "cycleMonthly"),
  });
}

function amountOf(subscription: Stripe.Subscription): number {
  const unit = subscription.items.data[0]?.price?.unit_amount;
  return unit != null ? unit / 100 : PRICES.unlimited.monthly.amount;
}

function endOf(subscription: Stripe.Subscription): Date | null {
  const seconds =
    subscription.trial_end ??
    subscription.items.data[0]?.current_period_end ??
    null;
  return seconds ? new Date(seconds * 1000) : null;
}

/**
 * Confirms a subscription that has just become real -- a card saved for a
 * trial, or a first invoice paid.
 *
 * Silently does nothing without a date to state, because an email whose
 * whole purpose is "here is when you will be charged" is worse than no
 * email when it cannot answer that.
 */
export async function sendSubscriptionConfirmation(args: {
  subscription: Stripe.Subscription;
  to: string;
  locale: Locale;
  appUrl: string;
  paidTodayCents: number;
  /** The receipt, when money actually moved. Built by `receiptRows`. */
  receipt?: DataRow[];
}): Promise<void> {
  const charge = endOf(args.subscription);
  if (!charge) return;

  const t = emailTranslator(args.locale);
  const trialDays = args.subscription.trial_end
    ? Math.max(
        1,
        Math.round(
          (args.subscription.trial_end * 1000 -
            args.subscription.start_date * 1000) /
            86_400_000,
        ),
      )
    : null;
  const date = longDate(args.locale, charge);

  const plan = planLabel(
    args.locale,
    args.subscription.metadata?.plan,
    args.subscription.items.data[0]?.price?.recurring?.interval,
  );
  const paidToday = formatUsd(args.paidTodayCents / 100, args.locale);

  await sendEmail({
    to: args.to,
    subject:
      trialDays !== null
        ? t("confirmSubject", { date })
        : // The receipt says what it is, for whom and how much, so it can
          // be found again in a mailbox six months later.
          t("receiptSubject", { plan, amount: paidToday }),
    react: SubscriptionConfirmationEmail({
      appUrl: args.appUrl,
      locale: args.locale,
      trialDays,
      chargeDate: date,
      chargeAmount: formatUsd(amountOf(args.subscription), args.locale),
      paidToday,
      plan,
      receipt: args.receipt,
    }),
  });
}

/**
 * The receipt rows, read off the invoice.
 *
 * Nothing here is computed: an amount we worked out ourselves that
 * disagrees with the invoice is worse than no receipt at all. A row whose
 * source is missing is left out rather than guessed, which is why every
 * lookup below can fail without the email failing with it.
 *
 * The card and the statement descriptor live on the charge rather than on
 * the invoice, so they cost one retrieve. If it fails -- an old API
 * version, a payment method with no card, a network blip -- those two rows
 * are simply absent, and "what is this charge on my statement?" stays a
 * question the customer has to ask. That is a worse email, not a broken
 * one.
 */
export async function receiptRows(args: {
  stripe: Stripe;
  invoice: Stripe.Invoice;
  locale: Locale;
  plan: string;
}): Promise<DataRow[]> {
  const { invoice, locale } = args;
  const t = emailTranslator(locale);
  const money = (cents: number) => formatUsd(cents / 100, locale);
  const rows: DataRow[] = [];

  rows.push({
    key: t("rowAmountPaid"),
    value: money(invoice.amount_paid),
    lead: true,
  });

  const tax = (invoice.total_taxes ?? []).reduce(
    (sum, entry) => sum + (entry.amount ?? 0),
    0,
  );
  if (tax > 0) rows.push({ key: t("rowTaxes"), value: money(tax) });

  rows.push({ key: t("rowPlan"), value: args.plan });

  const paidAt = invoice.status_transitions?.paid_at;
  if (paidAt) {
    rows.push({
      key: t("rowPaidOn"),
      value: longDate(locale, new Date(paidAt * 1000)),
    });
  }

  const charge = await latestCharge(args.stripe, invoice);
  const card = charge?.payment_method_details?.card;
  if (card?.last4) {
    rows.push({
      key: t("rowMethod"),
      value: t("rowCard", {
        brand: card.brand ? capitalise(card.brand) : "",
        last4: card.last4,
      }),
    });
  } else if (charge?.payment_method_details?.type) {
    rows.push({
      key: t("rowMethod"),
      value: capitalise(charge.payment_method_details.type),
    });
  }

  // Never a name we chose: this is the string the bank will print.
  if (charge?.calculated_statement_descriptor) {
    rows.push({
      key: t("rowStatement"),
      value: charge.calculated_statement_descriptor,
    });
  }

  if (invoice.hosted_invoice_url) {
    rows.push({
      key: t("rowInvoice"),
      value: t("invoiceLink"),
      href: invoice.hosted_invoice_url,
    });
  }

  return rows;
}

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

async function latestCharge(
  stripe: Stripe,
  invoice: Stripe.Invoice,
): Promise<Stripe.Charge | null> {
  const payment = invoice.payments?.data[0]?.payment?.payment_intent;
  const id = typeof payment === "string" ? payment : payment?.id;
  if (!id) return null;
  try {
    const intent = await stripe.paymentIntents.retrieve(id, {
      expand: ["latest_charge"],
    });
    const latest = intent.latest_charge;
    return latest && typeof latest !== "string" ? latest : null;
  } catch {
    return null;
  }
}

/** The pre-charge warning. Sent by the cron, never by a Stripe event. */
export async function sendTrialReminder(args: {
  to: string;
  locale: Locale;
  appUrl: string;
  trialEnd: Date;
  amount: number;
}): Promise<void> {
  const t = emailTranslator(args.locale);
  const amount = formatUsd(args.amount, args.locale);
  const date = longDate(args.locale, args.trialEnd);

  await sendEmail({
    to: args.to,
    // The figure and the date both go in the subject line: a good share of
    // people decide whether this matters without opening it.
    subject: t("reminderSubject", { amount, date }),
    react: TrialReminderEmail({
      appUrl: args.appUrl,
      locale: args.locale,
      chargeDate: date,
      chargeAmount: amount,
      proAmount: formatUsd(PRICES.pro.monthly.amount, args.locale),
    }),
  });
}

/**
 * The welcome, sent once when the account is created.
 *
 * It sells nothing, and says so: the only promise worth making to a new
 * free account is that we will not email it to sell, which is a promise
 * this email is in a position to keep.
 */
export async function sendWelcome(args: {
  to: string;
  locale: Locale;
  appUrl: string;
}): Promise<void> {
  const t = emailTranslator(args.locale);
  const n = numberIn(args.locale);
  const words = welcomeWords(n);

  await sendEmail({
    to: args.to,
    subject: t("welcomeSubject", { free: words.free }),
    react: WelcomeEmail({
      appUrl: args.appUrl,
      locale: args.locale,
      words,
    }),
  });
}

/**
 * The cancellation, sent once per subscription.
 *
 * No retention and no link to pricing: somebody who has just cancelled is
 * not a lead, and arguing with the decision is how a cancellation turns
 * into a complaint. What it does answer, before it is asked, is whether
 * anything more will be charged.
 */
export async function sendCancellation(args: {
  subscription: Stripe.Subscription;
  to: string;
  locale: Locale;
  appUrl: string;
  /** True while the trial was still running: nothing was ever charged. */
  trial: boolean;
  /** What was last paid, in cents, when anything was. */
  lastChargeCents?: number | null;
  lastChargeAt?: Date | null;
}): Promise<void> {
  const until = endOf(args.subscription);
  if (!until) return;

  const t = emailTranslator(args.locale);
  const n = numberIn(args.locale);
  const plan = planLabel(
    args.locale,
    args.subscription.metadata?.plan,
    args.subscription.items.data[0]?.price?.recurring?.interval,
  );
  const date = longDate(args.locale, until);

  await sendEmail({
    to: args.to,
    subject: t(args.trial ? "cancelledTrialSubject" : "cancelledSubject"),
    react: CancellationEmail({
      appUrl: args.appUrl,
      locale: args.locale,
      trial: args.trial,
      plan,
      until: date,
      cancelledOn: longDate(args.locale, new Date()),
      rows: {
        lastCharge:
          !args.trial && args.lastChargeCents && args.lastChargeAt
            ? `${longDate(args.locale, args.lastChargeAt)} · ${formatUsd(
                args.lastChargeCents / 100,
                args.locale,
              )}`
            : undefined,
        freeWords: n(PLANS.free.limits.wordsPerDay ?? 0),
        zero: formatUsd(0, args.locale),
      },
    }),
  });
}
