import { createFormatter } from "next-intl";
import type Stripe from "stripe";

import { SubscriptionConfirmationEmail } from "@/emails/subscription-confirmation";
import { TrialReminderEmail } from "@/emails/trial-reminder";
import { emailTranslator } from "@/emails/translator";
import { PRICES, formatUsd } from "@/lib/billing/plans";
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

  await sendEmail({
    to: args.to,
    subject:
      trialDays !== null
        ? t("confirmSubject", { date })
        : t("confirmPaidSubject", { date }),
    react: SubscriptionConfirmationEmail({
      appUrl: args.appUrl,
      locale: args.locale,
      trialDays,
      chargeDate: date,
      chargeAmount: formatUsd(amountOf(args.subscription), args.locale),
      paidToday: formatUsd(args.paidTodayCents / 100, args.locale),
    }),
  });
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
