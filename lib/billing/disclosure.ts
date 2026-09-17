import { PRICES, TRIAL, formatUsd } from "@/lib/billing/plans";
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
