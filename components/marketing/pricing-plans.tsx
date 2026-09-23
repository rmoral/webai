"use client";

import { useEffect, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";

import { TrialDisclosure } from "@/components/billing/paywall";
import { track } from "@/lib/analytics/events";
import { createClient } from "@/lib/auth/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import {
  PLANS,
  PRICES,
  TRIAL,
  formatUsd,
  sharedYearlyDiscount,
  trialDaysFor,
  yearlySaving,
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
// nowhere else, so the badge, the button and the disclosure all change
// with the cycle rather than only the price.

export function PricingPlans() {
  const t = useTranslations("pricing");
  const plans = useTranslations("plans");
  const locale = useLocale() as Locale;
  const format = useFormatter();
  // Monthly by default. Yearly is the better deal and the toggle says so,
  // but defaulting to it hides the trial -- the strongest thing this page
  // has to offer -- behind a click.
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const posthog = usePostHog();
  // undefined until the browser has answered. The free column's call to
  // action depends on it, and showing "create a free account" to somebody
  // who has one -- and then correcting it -- is worse than waiting a
  // moment for the truth.
  const [signedIn, setSignedIn] = useState<boolean | undefined>(undefined);
  // Where they came from, when the link said so. Read against the one
  // value we set rather than trusted: it is a query parameter, so anyone
  // can write anything in it.
  const from =
    useSearchParams().get("from") === "header" ? "header" : undefined;

  // `pricing_view` is the middle of the funnel: everything upstream is
  // measured by how many people reach it, and everything downstream by how
  // many leave it for the card field.
  //
  // The page is statically prerendered, so whether there is a session is a
  // question only the browser can answer. `getSession` reads the token the
  // client already holds -- no request, no cost on an SEO page -- which is
  // enough to tell a visitor from a customer.
  useEffect(() => {
    let active = true;
    // Wrapped, and wrapped around the client's construction as well as the
    // call: `createClient` throws synchronously when the Supabase keys are
    // missing, and a throw inside an effect unmounts the tree above it --
    // so a misconfigured deployment would render the pricing page blank.
    // Counting a view is never worth the page that sells.
    try {
      createClient()
        .auth.getSession()
        .then(({ data }) => {
          if (!active) return;
          setSignedIn(Boolean(data.session));
          track(posthog, "pricing_view", {
            cycle: interval,
            logged_in: Boolean(data.session),
            from,
          });
        })
        .catch(() => {});
    } catch {
      setSignedIn(false);
      track(posthog, "pricing_view", {
        cycle: interval,
        logged_in: false,
        from,
      });
    }
    return () => {
      active = false;
    };
    // Once per visit, with the cycle the page opened on. The toggle is a
    // change of view, not a second view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posthog]);

  const yearly = interval === "yearly";
  // Read from the prices, never typed into the copy: the line used to
  // promise two months while the prices gave away six.
  const discount = sharedYearlyDiscount();
  const n = (value: number) => format.number(value);

  return (
    <>
      <div
        role="radiogroup"
        aria-label={t("compareTitle")}
        className="mt-6 flex flex-wrap items-center gap-2"
      >
        {(["monthly", "yearly"] as const).map((option) => (
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
        {yearly && (
          <span className="text-muted-foreground text-sm">
            {discount
              ? t("yearlySave", {
                  percent: discount.percent,
                  months: discount.freeMonths,
                })
              : t("yearlySaveGeneric")}
          </span>
        )}
      </div>

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
            // reading it from their own account.
            signedIn ? (
              <Button variant="outline" className="w-full" disabled>
                {t("currentPlan")}
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                asChild
                // Holds the row while the session resolves, so the card
                // does not change its mind in front of the reader.
                aria-busy={signedIn === undefined}
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
                  saving: formatUsd(yearlySaving("pro"), locale),
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
            <Button className="w-full" asChild>
              <Link
                href={{
                  pathname: "/checkout",
                  query: { plan: "pro", cycle: interval },
                }}
              >
                {yearly ? t("chooseProYearly") : t("chooseProMonthly")}
              </Link>
            </Button>
          }
        />

        <Card
          highlighted
          title={plans("unlimited")}
          // The badge is tied to the rule, not to the plan: an annual cycle
          // has no trial and must not advertise one.
          badge={
            trialDaysFor("unlimited", interval) !== null
              ? t("trialBadge", { days: TRIAL.days })
              : undefined
          }
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
                  saving: formatUsd(yearlySaving("unlimited"), locale),
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
          }
          disclosure={
            yearly ? (
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
      className={`flex flex-col rounded-xl border p-5 ${
        highlighted ? "border-brand ring-brand ring-1" : ""
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
      {total && (
        <p data-testid="plan-total" className="text-muted-foreground text-sm">
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

      <div className="mt-5">{cta}</div>
      {disclosure}
    </section>
  );
}
