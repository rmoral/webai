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

/**
 * What the chosen plan costs, as rows, for the panel beside the sign-up
 * form.
 *
 * The same four facts /checkout will show, computed from the same
 * catalogue, so the two pages cannot disagree about the date or the
 * amount -- which is the disagreement that turns into a chargeback. No
 * copy here: the labels belong to the catalogue of messages, the figures
 * to `PRICES`.
 *
 * `today` is the row that decides whether somebody keeps going, so it is
 * marked rather than left for the layout to guess.
 */
export type PlanRow =
  | { key: "trial"; days: number }
  | { key: "today"; amount: number }
  | { key: "firstCharge"; date: Date }
  | { key: "renewal"; date: Date }
  | { key: "after"; perMonth: number }
  | { key: "equivalent"; perMonth: number };

export function planRows(
  tier: PaidTier,
  interval: BillingInterval,
  now = new Date(),
): PlanRow[] {
  const price = PRICES[tier][interval];
  const trialDays = trialDaysFor(tier, interval);

  if (trialDays !== null) {
    const firstCharge = new Date(now);
    firstCharge.setDate(firstCharge.getDate() + trialDays);
    return [
      { key: "trial", days: trialDays },
      // Nothing is taken today, and the column has to add up to that.
      { key: "today", amount: 0 },
      { key: "firstCharge", date: firstCharge },
      { key: "after", perMonth: price.monthlyEquivalent },
    ];
  }

  return interval === "yearly"
    ? [
        { key: "today", amount: price.amount },
        { key: "equivalent", perMonth: price.monthlyEquivalent },
        { key: "renewal", date: renewalDate(interval, now) },
      ]
    : [
        { key: "today", amount: price.amount },
        { key: "renewal", date: renewalDate(interval, now) },
        { key: "after", perMonth: price.monthlyEquivalent },
      ];
}
