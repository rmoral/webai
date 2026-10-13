import type { Locale } from "@/lib/i18n/routing";

/**
 * Every dollar figure on the site, in one shape: "US$14,99".
 *
 * The symbol leads and names the currency, because the readers are spread
 * across countries where a bare "$" is their own peso. Only the punctuation
 * follows the locale: an English reader takes the comma in "14,99" as a
 * thousands separator -- a price a hundred times off -- so English gets
 * "US$14.99". Grouping is forced because es-ES leaves four-digit numbers
 * ungrouped ("1234,56") while every other figure on the page is grouped.
 *
 * Word counts are not money and keep the plain locale format ("3000",
 * "60.000").
 */
export function formatUSD(amount: number, locale: Locale = "es"): string {
  return (
    "US$" +
    new Intl.NumberFormat(locale === "en" ? "en-US" : "es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: "always",
    }).format(amount)
  );
}
