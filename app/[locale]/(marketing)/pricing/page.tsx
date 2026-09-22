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
import { PLANS, TOPUP, TRIAL, formatUsd } from "@/lib/billing/plans";
import { alternatesFor } from "@/lib/i18n/metadata";
import { Link } from "@/lib/i18n/navigation";
import { LEGAL_SLUGS } from "@/lib/i18n/legal";
import type { Locale } from "@/lib/i18n/routing";

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

  const rows: { label: string; values: string[] }[] = [
    {
      label: t("rowWordsDay"),
      values: [perDay("free"), perDay("pro"), perDay("unlimited")],
    },
    {
      label: t("rowWordsMonth"),
      values: [perMonth("free"), perMonth("pro"), perMonth("unlimited")],
    },
    {
      label: t("rowPerRequest"),
      values: (["free", "pro", "unlimited"] as const).map((tier) =>
        n(limitsOf(tier).maxWordsPerRequest),
      ),
    },
    {
      label: t("rowTools"),
      values: [t("valueFreeTools"), t("valueAllTools"), t("valueAllTools")],
    },
    {
      label: t("rowHistory"),
      values: (["free", "pro", "unlimited"] as const).map((tier) =>
        limitsOf(tier).history ? yes : no,
      ),
    },
    {
      label: t("rowBreakdown"),
      values: (["free", "pro", "unlimited"] as const).map((tier) =>
        limitsOf(tier).sentenceHighlight ? yes : no,
      ),
    },
    {
      label: t("rowPriority"),
      values: (["free", "pro", "unlimited"] as const).map((tier) =>
        limitsOf(tier).priorityQueue ? yes : no,
      ),
    },
    {
      label: t("rowTopup"),
      values: [
        t("valueTopupNeedsPlan"),
        t("valueTopup", {
          amount: formatUsd(TOPUP.amount, locale),
          words: n(TOPUP.words),
        }),
        t("valueTopup", {
          amount: formatUsd(TOPUP.amount, locale),
          words: n(TOPUP.words),
        }),
      ],
    },
  ];

  return (
    <main className="mx-auto max-w-[65rem] px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t("h1")}</h1>
      <p className="text-muted-foreground mt-3">
        {t("intro", { days: TRIAL.days })}
      </p>

      <PricingPlans />

      {/* Above the table, not below it: the promise that makes the table
          worth reading is that none of it is a trap. */}
      <p className="text-success-ink border-success-line bg-success-soft mt-8 rounded-xl border p-4 text-sm">
        {t("guarantee")}
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">
        {t("compareTitle")}
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead>
            <tr className="border-b">
              <th scope="col" className="py-2 pr-4 font-medium" />
              {(["free", "pro", "unlimited"] as const).map((tier) => (
                <th key={tier} scope="col" className="py-2 pr-4 font-semibold">
                  {plans(tier)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {rows.map((row) => (
              <tr key={row.label} className="border-b last:border-0">
                <th
                  scope="row"
                  className="text-foreground py-2 pr-4 font-normal"
                >
                  {row.label}
                </th>
                {row.values.map((value, i) => (
                  <td key={i} className="py-2 pr-4">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">
        {t("faqTitle")}
      </h2>
      <dl className="mt-4 space-y-5">
        {faq.map((entry) => (
          <div key={entry.q}>
            <dt className="font-medium">{entry.q}</dt>
            <dd className="text-muted-foreground mt-1 text-sm leading-relaxed">
              {entry.a}
            </dd>
          </div>
        ))}
      </dl>

      <section className="mt-8 rounded-xl border p-4">
        <h2 className="font-semibold">{t("topupTitle")}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("topupBody", {
            amount: formatUsd(TOPUP.amount, locale),
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
