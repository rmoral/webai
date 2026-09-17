import type { Metadata } from "next";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";

import { CheckoutButton } from "@/components/marketing/checkout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trialDisclosure } from "@/lib/billing/disclosure";
import {
  PLANS,
  PRICES,
  TOPUP,
  TRIAL,
  formatUsd,
  yearlySaving,
} from "@/lib/billing/plans";
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
  const checkout = await getTranslations("checkout");
  const format = await getFormatter();
  const n = (value: number) => format.number(value);

  return (
    <main className="mx-auto max-w-[65rem] px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t("h1")}</h1>
      <p className="text-muted-foreground mt-3">
        {t("intro", { days: TRIAL.days })}
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <section className="rounded-xl border p-4">
          <h2 className="font-semibold">{plans("free")}</h2>
          <p className="mt-1 text-2xl font-semibold">{formatUsd(0, locale)}</p>
          <ul className="text-muted-foreground mt-4 space-y-1 text-sm">
            <li>
              {t("wordsPerDay", {
                words: n(PLANS.free.limits.wordsPerDay ?? 0),
              })}
            </li>
            <li>
              {t("perRequest", {
                words: n(PLANS.free.limits.maxWordsPerRequest),
              })}
            </li>
            <li>{t("freeTools")}</li>
          </ul>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/login">{t("signup")}</Link>
          </Button>
        </section>

        <section className="rounded-xl border p-4">
          <h2 className="font-semibold">{plans("pro")}</h2>
          <p className="mt-1 text-2xl font-semibold">
            {formatUsd(PRICES.pro.yearly.monthlyEquivalent, locale)}
            <span className="text-muted-foreground text-base font-normal">
              {" "}
              {t("perMonth")}
            </span>
          </p>
          <p className="text-muted-foreground text-sm">
            {t("yearlyLine", {
              yearly: formatUsd(PRICES.pro.yearly.amount, locale),
              saving: formatUsd(yearlySaving("pro"), locale),
              monthly: formatUsd(PRICES.pro.monthly.amount, locale),
            })}
          </p>
          <ul className="text-muted-foreground mt-4 space-y-1 text-sm">
            <li>
              {t("wordsPerMonth", {
                words: n(PLANS.pro.limits.wordsPerMonth ?? 0),
              })}
            </li>
            <li>
              {t("perRequest", {
                words: n(PLANS.pro.limits.maxWordsPerRequest),
              })}
            </li>
            <li>{t("proTools")}</li>
          </ul>
          <div className="mt-4 flex flex-col gap-2">
            <CheckoutButton
              plan="pro"
              interval="yearly"
              label={t("choosePro")}
            />
            <CheckoutButton
              plan="pro"
              interval="monthly"
              variant="outline"
              label={t("proMonthly")}
            />
          </div>
        </section>

        <section className="border-brand ring-brand rounded-xl border p-4 ring-1">
          <h2 className="flex items-center gap-2 font-semibold">
            {plans("unlimited")}{" "}
            <Badge variant="brand">
              {t("trialBadge", { days: TRIAL.days })}
            </Badge>
          </h2>
          <p className="mt-1 text-2xl font-semibold">
            {formatUsd(PRICES.unlimited.yearly.monthlyEquivalent, locale)}
            <span className="text-muted-foreground text-base font-normal">
              {" "}
              {t("perMonth")}
            </span>
          </p>
          <p className="text-muted-foreground text-sm">
            {t("yearlyLine", {
              yearly: formatUsd(PRICES.unlimited.yearly.amount, locale),
              saving: formatUsd(yearlySaving("unlimited"), locale),
              monthly: formatUsd(PRICES.unlimited.monthly.amount, locale),
            })}
          </p>
          <ul className="text-muted-foreground mt-4 space-y-1 text-sm">
            <li>
              {t("wordsPerMonth", {
                words: n(PLANS.unlimited.limits.wordsPerMonth ?? 0),
              })}
            </li>
            <li>
              {t("perRequest", {
                words: n(PLANS.unlimited.limits.maxWordsPerRequest),
              })}
            </li>
            <li>{t("priority")}</li>
          </ul>
          <div className="mt-4 flex flex-col gap-2">
            <CheckoutButton
              plan="unlimited"
              interval="monthly"
              label={t("tryFree", { days: TRIAL.days })}
            />
            <CheckoutButton
              plan="unlimited"
              interval="yearly"
              variant="outline"
              label={t("unlimitedYearly")}
            />
          </div>
          {/* Required before collecting payment details (§6.1). */}
          <p className="mt-3 text-xs" data-testid="trial-disclosure">
            {trialDisclosure(locale, checkout, (date) =>
              format.dateTime(date, {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }),
            )}
          </p>
        </section>
      </div>

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
