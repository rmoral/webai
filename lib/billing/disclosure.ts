import {
  PRICES,
  TRIAL,
  formatUsd,
  trialDaysFor,
  type BillingInterval,
  type PaidTier,
} from "@/lib/billing/plans";
import type { Locale } from "@/lib/i18n/routing";

/**
 * Pre-purchase disclosure required before collecting payment details
 * (study §6.1): no charge today, the exact date and amount of the first
 * charge, and how to cancel. Kept here so the wording cannot drift between
 * the pricing page and the paywall.
 *
 * The translator and the date formatter are arguments rather than imports
 * from next-intl/server. That keeps this a pure function -- the disclosure
 * is a legal obligation and has to be testable in both languages without a
 * request context, which is exactly what a server-only helper would deny.
 *
 * The date is formatted for the language being read, not for Spain: a US
 * customer reading 09/11/2026 as 9 November when it means 11 September is a
 * disclosure that failed at the only job it has. The month goes in words.
 */
export function trialDisclosure(
  locale: Locale,
  t: (key: "disclosure", values: Record<string, string | number>) => string,
  formatDate: (date: Date) => string,
  now = new Date(),
): string {
  const chargeDate = new Date(now);
  chargeDate.setDate(chargeDate.getDate() + TRIAL.days);

  return t("disclosure", {
    date: formatDate(chargeDate),
    days: TRIAL.days,
    unlimited: formatUsd(PRICES.unlimited.monthly.amount, locale),
    pro: formatUsd(PRICES.pro.monthly.amount, locale),
  });
}

/** When the next charge falls, from today, for a cycle without a trial. */
export function renewalDate(interval: BillingInterval, now = new Date()): Date {
  const next = new Date(now);
  if (interval === "yearly") next.setFullYear(next.getFullYear() + 1);
  else next.setMonth(next.getMonth() + 1);
  return next;
}

/**
 * The disclosure shown immediately above the card field.
 *
 * Longer than the one on the paywall, because at this point the card is
 * the next thing the customer touches: the trial version adds that we keep
 * the card, and both versions say cancelling works during the trial too.
 *
 * Same shape as `trialDisclosure` and for the same reason -- the translator
 * and the date formatter are arguments, so the exact sentence a customer
 * was shown can be asserted in a test, in either language, without a
 * request context.
 */
export function paymentDisclosure(
  locale: Locale,
  tier: PaidTier,
  interval: BillingInterval,
  t: (
    key: "formDisclosureTrial" | "formDisclosureCharge",
    values: Record<string, string | number>,
  ) => string,
  formatDate: (date: Date) => string,
  now = new Date(),
): string {
  const trialDays = trialDaysFor(tier, interval);
  const amount = formatUsd(PRICES[tier][interval].amount, locale);

  if (trialDays !== null) {
    const chargeDate = new Date(now);
    chargeDate.setDate(chargeDate.getDate() + trialDays);
    return t("formDisclosureTrial", {
      date: formatDate(chargeDate),
      days: trialDays,
      amount,
    });
  }

  return t("formDisclosureCharge", {
    amount,
    date: formatDate(renewalDate(interval, now)),
  });
}
