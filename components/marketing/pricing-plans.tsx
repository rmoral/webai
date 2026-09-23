"use client";

import { useEffect, useRef, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";

import { TrialDisclosure } from "@/components/billing/paywall";
import { useViewer } from "@/components/marketing/viewer";
import { track } from "@/lib/analytics/events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import {
  PLANS,
  PRICES,
  TRIAL,
  formatUsd,
  sharedYearlyDiscount,
  type BillingInterval,
} from "@/lib/billing/plans";
import { Link } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";

// The three plans, with the cycle as a toggle.
//
// The toggle moves the big number inside each card. It used to show the
// yearly equivalent as the headline and the monthly price underneath, so
// Unlimited read "$14.99/month" while the disclosure under it said the
// customer would be charged $29.99 -- two prices competing in one card,
// and the single most expensive confusion on the site.
//
// And the rule that closes it: the trial exists on Unlimited monthly and
// nowhere else, so the button and the disclosure both change with the
// cycle rather than only the price.

export function PricingPlans() {
  const t = useTranslations("pricing");
  const plans = useTranslations("plans");
  const locale = useLocale() as Locale;
  const format = useFormatter();
  const posthog = usePostHog();
  const params = useSearchParams();

  // Yearly by default: it is the better deal for the reader and the one
  // that lets us keep a customer for a year. The trial does not disappear
  // with it -- the line under the toggle says where it lives and moves
  // the page there in one click -- and a wall that opens with the trial
  // links to `?cycle=monthly` so it lands on the cycle it just offered.
  const [interval, setInterval] = useState<BillingInterval>(
    params.get("cycle") === "monthly" ? "monthly" : "yearly",
  );
  // undefined until the browser has answered. Every call to action here
  // depends on it, and telling somebody to buy what they already pay for
  // -- and then correcting it -- is worse than waiting a moment. Resolved
  // once for the whole marketing tree rather than again here.
  const viewer = useViewer();
  // Where they came from, when the link said so. Read against the one
  // value we set rather than trusted: it is a query parameter, so anyone
  // can write anything in it.
  const from = params.get("from") === "header" ? "header" : undefined;

  // `pricing_view` is the middle of the funnel: everything upstream is
  // measured by how many people reach it, and everything downstream by how
  // many leave it for the card field. Counted once the reader is known and
  // once per visit -- the toggle is a change of view, not a second view.
  const counted = useRef(false);
  useEffect(() => {
    if (!viewer || counted.current) return;
    counted.current = true;
    track(posthog, "pricing_view", {
      cycle: interval,
      logged_in: viewer.signedIn,
      from,
    });
  }, [viewer, posthog, interval, from]);

  const yearly = interval === "yearly";
  // Nobody can start a trial, or change cycle to get one, while they are
  // already paying.
  const paying = viewer?.plan === "pro" || viewer?.plan === "unlimited";
  // Read from the prices, never typed into the copy: the line used to
  // promise two months while the prices gave away six.
  const discount = sharedYearlyDiscount();
  const n = (value: number) => format.number(value);

  /** The box that replaces the button on the card already being paid for. */
  const currentPlan = (
    <div
      data-testid="current-plan"
      className="text-muted-foreground flex h-11 w-full items-center justify-center rounded-md border border-dashed text-sm font-medium md:h-9"
    >
      {t("currentPlan")}
    </div>
  );

  /** A change of plan is a proration, and Stripe's portal owns it. */
  const switchTo = (label: string, filled: boolean) => (
    <Button variant={filled ? "default" : "outline"} className="w-full" asChild>
      <Link href="/app/account">{label}</Link>
    </Button>
  );

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div
          role="radiogroup"
          // Not the page's heading: this group chooses a billing cycle,
          // and a screen reader announcing "what each plan includes" here
          // describes the table further down instead.
          aria-label={t("cycleLabel")}
          className="flex flex-wrap items-center gap-2"
        >
          {(["yearly", "monthly"] as const).map((option) => (
            <Chip
              key={option}
              role="radio"
              aria-checked={interval === option}
              pressed={interval === option}
              onClick={() => setInterval(option)}
            >
              {t(option)}
            </Chip>
          ))}
        </div>
        {yearly && (
          <span className="text-success-ink text-sm font-medium">
            {discount
              ? t("saveHalf", {
                  percent: discount.percent,
                  months: discount.freeMonths,
                })
              : t("yearlySaveGeneric")}
          </span>
        )}
      </div>

      {/* The trial is the strongest thing this page has to offer and the
          yearly cycle does not have one. Rather than default to the cycle
          that shows it, the page says where it is. Hidden from somebody
          who is already paying: they cannot start one. */}
      {!paying && (
        <p className="text-muted-foreground mt-3 text-sm leading-normal">
          {yearly
            ? t("trialHint", { days: TRIAL.days })
            : discount
              ? t("yearlyHint", {
                  percent: discount.percent,
                  months: discount.freeMonths,
                })
              : t("yearlyHintGeneric")}{" "}
          <button
            type="button"
            onClick={() => setInterval(yearly ? "monthly" : "yearly")}
            className="text-brand cursor-pointer underline underline-offset-[3px]"
          >
            {yearly ? t("seeMonthly") : t("seeYearly")}
          </button>
        </p>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        <Card
          title={plans("free")}
          price={formatUsd(0, locale)}
          billing={t("billingFree")}
          features={[
            t("wordsPerDay", { words: n(PLANS.free.limits.wordsPerDay ?? 0) }),
            t("perRequest", { words: n(PLANS.free.limits.maxWordsPerRequest) }),
            t("freeTools"),
          ]}
          cta={
            // Never propose something already done. With a session this
            // column went on selling "create a free account" to somebody
            // reading it from their own account -- and to a customer it
            // has nothing to say at all.
            viewer?.plan === "free" ? (
              currentPlan
            ) : paying ? null : (
              <Button
                variant="outline"
                className="w-full"
                asChild
                // Holds the row while the session resolves, so the card
                // does not change its mind in front of the reader.
                aria-busy={viewer === undefined}
              >
                <Link href="/signup">{t("signup")}</Link>
              </Button>
            )
          }
        />

        <Card
          title={plans("pro")}
          price={formatUsd(PRICES.pro[interval].monthlyEquivalent, locale)}
          suffix={t("perMonth")}
          total={
            yearly
              ? t("yearlyTotal", {
                  amount: formatUsd(PRICES.pro.yearly.amount, locale),
                })
              : undefined
          }
          billing={
            yearly
              ? t("billingProYearly", {
                  amount: formatUsd(PRICES.pro.yearly.amount, locale),
                })
              : t("billingProMonthly", {
                  amount: formatUsd(PRICES.pro.monthly.amount, locale),
                })
          }
          features={[
            t("wordsPerMonth", {
              words: n(PLANS.pro.limits.wordsPerMonth ?? 0),
            }),
            t("perRequest", { words: n(PLANS.pro.limits.maxWordsPerRequest) }),
            t("proTools"),
          ]}
          cta={
            viewer?.plan === "pro" ? (
              currentPlan
            ) : viewer?.plan === "unlimited" ? (
              switchTo(t("switchToPro"), false)
            ) : (
              // Outline, because the only filled button on this page is
              // the one we are recommending.
              <Button variant="outline" className="w-full" asChild>
                <Link
                  href={{
                    pathname: "/checkout",
                    query: { plan: "pro", cycle: interval },
                  }}
                >
                  {yearly ? t("chooseProYearly") : t("chooseProMonthly")}
                </Link>
              </Button>
            )
          }
        />

        <Card
          highlighted
          // The only badge on the page, and it names the recommendation
          // rather than an offer that half the cycles do not have.
          badge={t("mostPopular")}
          title={plans("unlimited")}
          price={formatUsd(
            PRICES.unlimited[interval].monthlyEquivalent,
            locale,
          )}
          suffix={t("perMonth")}
          total={
            yearly
              ? t("yearlyTotal", {
                  amount: formatUsd(PRICES.unlimited.yearly.amount, locale),
                })
              : undefined
          }
          billing={
            yearly
              ? t("billingUnlimitedYearly", {
                  amount: formatUsd(PRICES.unlimited.yearly.amount, locale),
                })
              : t("billingUnlimitedMonthly", {
                  days: TRIAL.days,
                  amount: formatUsd(PRICES.unlimited.monthly.amount, locale),
                })
          }
          features={[
            t("wordsPerMonth", {
              words: n(PLANS.unlimited.limits.wordsPerMonth ?? 0),
            }),
            t("perRequest", {
              words: n(PLANS.unlimited.limits.maxWordsPerRequest),
            }),
            t("priority"),
          ]}
          cta={
            viewer?.plan === "unlimited" ? (
              currentPlan
            ) : viewer?.plan === "pro" ? (
              switchTo(t("switchToUnlimited"), true)
            ) : (
              <Button className="w-full" asChild>
                <Link
                  href={{
                    pathname: "/checkout",
                    query: { plan: "unlimited", cycle: interval },
                  }}
                >
                  {yearly
                    ? t("chooseUnlimitedYearly")
                    : t("tryFree", { days: TRIAL.days })}
                </Link>
              </Button>
            )
          }
          disclosure={
            viewer?.plan === "unlimited" ? null : viewer?.plan === "pro" ? (
              // A proration is arithmetic we do not do here. Promising an
              // amount we have not computed is how a change of plan turns
              // into a complaint.
              <p
                className="border-brand-line bg-brand-softer text-brand-ink mt-3 rounded-xl border p-3 text-sm leading-normal"
                data-testid="trial-disclosure"
              >
                {t("switchNote")}
              </p>
            ) : yearly ? (
              // Explaining why there is no trial here turns an absence into
              // the reason it exists.
              <p
                className="border-brand-line bg-brand-softer text-brand-ink mt-3 rounded-xl border p-3 text-sm leading-normal"
                data-testid="trial-disclosure"
              >
                {t("annualNoTrial", {
                  amount: formatUsd(PRICES.unlimited.yearly.amount, locale),
                  days: TRIAL.days,
                })}
              </p>
            ) : (
              <TrialDisclosure
                className="mt-3"
                data-testid="trial-disclosure"
              />
            )
          }
        />
      </div>
    </>
  );
}

function Card({
  title,
  badge,
  price,
  suffix,
  total,
  billing,
  features,
  cta,
  disclosure,
  highlighted = false,
}: {
  title: string;
  badge?: string;
  price: string;
  suffix?: string;
  /** The amount actually charged, when it differs from the headline. */
  total?: string;
  billing: string;
  features: string[];
  cta: React.ReactNode;
  disclosure?: React.ReactNode;
  highlighted?: boolean;
}) {
  return (
    <section
      aria-label={title}
      className={`flex flex-col rounded-xl border p-5 ${
        // First in one column: it is the recommendation, and what is read
        // first in a stack is what is read at all.
        highlighted
          ? "border-brand ring-brand order-first ring-1 sm:order-none"
          : ""
      }`}
    >
      <h2 className="flex items-center gap-2 font-semibold">
        {title}
        {badge && <Badge variant="brand">{badge}</Badge>}
      </h2>

      {/* One number, big. Anything else about money goes below it, as a
          sentence about when it is taken. */}
      <p
        data-testid="plan-price"
        className="mt-2 text-3xl font-semibold tracking-tight"
      >
        {price}
        {suffix && (
          <span className="text-muted-foreground text-base font-normal">
            {" "}
            {suffix}
          </span>
        )}
      </p>
      {/* The row is kept even when there is no yearly total, so the cards
          do not jump as the cycle changes under the reader's cursor. */}
      {suffix && (
        <p
          data-testid="plan-total"
          className="min-h-[1.3em] text-sm font-medium"
        >
          {total}
        </p>
      )}
      <p className="text-muted-foreground mt-2 text-sm leading-normal">
        {billing}
      </p>

      <ul className="text-muted-foreground mt-4 space-y-1 text-sm">
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      <div className="mt-5 flex-1 content-end">{cta}</div>
      {disclosure}
    </section>
  );
}
