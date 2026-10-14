import { Suspense } from "react";
import type { Metadata } from "next";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";

// Subscriptions are paid at /checkout, inside the site. The top-up stays on
// the hosted session: it is a one-off payment, not a subscription, and the
// embedded flow here only creates subscriptions.
import { CheckoutButton } from "@/components/marketing/checkout-button";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { DetectorProof } from "@/components/marketing/detector-proof";
import { PLANS, PRICES, TOPUP, TRIAL } from "@/lib/billing/plans";
import { formatUSD } from "@/lib/format";
import { alternatesFor } from "@/lib/i18n/metadata";
import { Link } from "@/lib/i18n/navigation";
import { LEGAL_SLUGS } from "@/lib/i18n/legal";
import type { Locale } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

type Params = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription", { days: TRIAL.days }),
    alternates: alternatesFor("/pricing", locale),
  };
}

export default async function PricingPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pricing");
  const plans = await getTranslations("plans");
  const format = await getFormatter();
  const n = (value: number) => format.number(value);

  const faq = t.raw("faq") as { q: string; a: string }[];

  // Every cell comes from PLANS. A comparison table with a number typed
  // into it is the first thing to go stale, and the last thing anybody
  // thinks to check.
  const limitsOf = (tier: "free" | "pro" | "unlimited") => PLANS[tier].limits;
  const yes = t("valueYes");
  const no = t("valueNo");
  const none = t("valueNone");
  const perDay = (tier: "free" | "pro" | "unlimited") => {
    const value = limitsOf(tier).wordsPerDay;
    return value === null ? none : n(value);
  };
  const perMonth = (tier: "free" | "pro" | "unlimited") => {
    const value = limitsOf(tier).wordsPerMonth;
    return value === null ? none : n(value);
  };

  // Values in the order the cards read on a desktop: Gratis · Ilimitado ·
  // Pro, with Ilimitado in the middle (F1-15).
  const TIERS = ["free", "unlimited", "pro"] as const;
  const rows: { label: string; values: string[] }[] = [
    {
      label: t("rowWordsDay"),
      values: TIERS.map(perDay),
    },
    {
      label: t("rowWordsMonth"),
      values: TIERS.map(perMonth),
    },
    {
      label: t("rowPerRequest"),
      values: TIERS.map((tier) => n(limitsOf(tier).maxWordsPerRequest)),
    },
    {
      label: t("rowTools"),
      values: [
        t("valueFreeTools", {
          perUse: n(PLANS.free.limits.uses.paraphrase?.perUse ?? 0),
          uses: PLANS.free.limits.uses.paraphrase?.usesPerDay ?? 0,
        }),
        t("valueAllTools"),
        t("valueAllTools"),
      ],
    },
    {
      label: t("rowHistory"),
      values: TIERS.map((tier) => (limitsOf(tier).history ? yes : no)),
    },
    {
      label: t("rowBreakdown"),
      values: TIERS.map((tier) =>
        limitsOf(tier).sentenceHighlight ? yes : no,
      ),
    },
    {
      label: t("rowPriority"),
      values: TIERS.map((tier) => (limitsOf(tier).priorityQueue ? yes : no)),
    },
    {
      label: t("rowTopup"),
      values: TIERS.map((tier) =>
        tier === "free"
          ? t("valueTopupNeedsPlan")
          : t("valueTopup", {
              amount: formatUSD(TOPUP.amount, locale),
              words: n(TOPUP.words),
            }),
      ),
    },
  ];

  // "—" and "No" are absences, and read as such: greyed, not black.
  const absent = (value: string) => value === none || value === no;
  // The accordion lists the plans the way the cards stack on a phone.
  const stacked = [1, 2, 0] as const;
  const headline = (tier: (typeof TIERS)[number]) =>
    tier === "free"
      ? formatUSD(0, locale)
      : `${formatUSD(PRICES[tier].yearly.monthlyEquivalent, locale)}${t("perMonth")}`;

  return (
    <main className="mx-auto max-w-[65rem] px-4 pt-6 pb-12 sm:px-6 md:pt-10">
      <h1 className="text-3xl font-bold tracking-tight">{t("h1")}</h1>
      <p className="text-muted-foreground mt-3">
        {t("intro", { days: TRIAL.days })}
      </p>

      {/* It reads `?from=` to attribute the visit, which needs a boundary
          for the page to stay prerendered. */}
      <Suspense>
        <PricingPlans />
      </Suspense>

      {/* The proof that it works, and the promise that none of it is a
          trap, side by side. The way out is named in full -- the clicks,
          in order -- because "cancel whenever you want" is what every
          subscription says. Without detector figures the first renders
          nothing and the second takes the row. */}
      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_320px] md:gap-5">
        <DetectorProof
          variant="block"
          className="mt-0 md:mt-0 md:grid-cols-[200px_1fr]"
        />
        <p className="text-success-ink border-success-line bg-success-soft rounded-[14px] border p-5 text-sm leading-normal">
          <strong className="font-semibold">{t("guaranteeLead")}</strong>
          {t("guaranteeBody")}
        </p>
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">
        {t("compareTitle")}
      </h2>

      {/* A phone gets one plan at a time, Ilimitado open: a three-column
          table at 390 was a sideways scroll nobody did. */}
      <div className="mt-4 flex flex-col gap-3 md:hidden">
        {stacked.map((column) => {
          const tier = TIERS[column];
          return (
            <details
              key={tier}
              open={tier === "unlimited"}
              className="group rounded-xl border px-4"
            >
              <summary className="flex min-h-[52px] cursor-pointer list-none items-center gap-2 text-base font-semibold [&::-webkit-details-marker]:hidden">
                {plans(tier)}
                <span className="text-muted-foreground text-[13px] font-normal">
                  {headline(tier)}
                </span>
                <svg
                  aria-hidden
                  viewBox="0 0 10 6"
                  className="ml-auto w-[9px] transition-transform group-open:rotate-180"
                >
                  <path
                    d="M1 1l4 4 4-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </summary>
              <dl className="pb-2">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[1fr_auto] gap-4 border-t border-neutral-100 py-[9px] text-sm leading-5"
                  >
                    <dt className="text-neutral-600">{row.label}</dt>
                    <dd
                      className={cn(
                        "text-right font-medium",
                        absent(row.values[column]) && "text-neutral-400",
                      )}
                    >
                      {row.values[column]}
                    </dd>
                  </div>
                ))}
              </dl>
            </details>
          );
        })}
      </div>

      <table className="mt-4 hidden w-full text-left text-sm leading-5 md:table">
        <thead>
          <tr className="border-b">
            <th scope="col" className="px-4 py-[11px] font-semibold" />
            {TIERS.map((tier) => (
              <th
                key={tier}
                scope="col"
                className={cn(
                  "px-4 py-[11px] font-semibold",
                  tier === "unlimited" && "bg-brand-softer",
                )}
              >
                {plans(tier)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b last:border-0">
              <th scope="row" className="px-4 py-[11px] font-normal">
                {row.label}
              </th>
              {row.values.map((value, i) => (
                <td
                  key={i}
                  className={cn(
                    "text-muted-foreground px-4 py-[11px]",
                    TIERS[i] === "unlimited" && "bg-brand-softer",
                    absent(value) && "text-neutral-400",
                  )}
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">
        {t("faqTitle")}
      </h2>
      {/* An accordion on a phone; two columns above, no answer split
          across them. */}
      <div className="mt-4 md:hidden">
        {faq.map((entry) => (
          <details key={entry.q} className="border-b">
            <summary className="flex min-h-[52px] cursor-pointer list-none items-center py-3 text-[15px] leading-[21px] font-semibold [&::-webkit-details-marker]:hidden">
              {entry.q}
            </summary>
            <p className="pb-4 text-sm leading-[21px] text-neutral-600">
              {entry.a}
            </p>
          </details>
        ))}
      </div>
      <dl className="mt-4 hidden gap-10 md:block md:columns-2">
        {faq.map((entry) => (
          <div key={entry.q} className="mb-6 break-inside-avoid">
            <dt className="text-[15px] font-semibold">{entry.q}</dt>
            <dd className="mt-1 text-sm leading-[21px] text-neutral-600">
              {entry.a}
            </dd>
          </div>
        ))}
      </dl>

      <section className="mt-8 rounded-xl border p-4">
        <h2 className="font-semibold">{t("topupTitle")}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("topupBody", {
            amount: formatUSD(TOPUP.amount, locale),
            words: n(TOPUP.words),
          })}
        </p>
        <CheckoutButton
          plan="topup"
          interval="monthly"
          variant="outline"
          label={t("topupCta")}
        />
      </section>

      <p className="text-muted-foreground mt-8 text-xs">
        {t("taxNote")}{" "}
        <Link
          href={{
            pathname: "/legal/[slug]",
            params: { slug: LEGAL_SLUGS[locale].terms },
          }}
          className="underline"
        >
          {t("taxNoteLink")}
        </Link>
        .
      </p>
    </main>
  );
}
