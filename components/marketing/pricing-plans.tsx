"use client";

import { useEffect, useRef, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";

import { useViewer } from "@/components/marketing/viewer";
import { track } from "@/lib/analytics/events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import {
  PLANS,
  PRICES,
  TRIAL,
  sharedYearlyDiscount,
  yearlyDiscount,
  type BillingInterval,
} from "@/lib/billing/plans";
import { formatUSD } from "@/lib/format";
import { Link } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

// The three plans, with the cycle as a toggle.
//
// The toggle moves the big number inside each card. It used to show the
// yearly equivalent as the headline and the monthly price underneath, so
// Unlimited read "$14.99/month" while the disclosure under it said the
// customer would be charged $29.99 -- two prices competing in one card,
// and the single most expensive confusion on the site.
//
// Unlimited carries the trial on both cycles (F1-01); what changes with the
// cycle is the amount the trial ends in, and the note under the button
// names it -- the whole year, on the yearly cycle. The hierarchy is in the
// buttons (F1-10): Ilimitado filled, Pro outlined, Gratis a text link.

/** The day the trial ends if it starts now: the day of the first charge. */
function trialEnd(): Date {
  const date = new Date();
  date.setDate(date.getDate() + TRIAL.days);
  return date;
}

export function PricingPlans() {
  const t = useTranslations("pricing");
  const plans = useTranslations("plans");
  const locale = useLocale() as Locale;
  const format = useFormatter();
  const posthog = usePostHog();
  const params = useSearchParams();

  // Yearly by default: it is the better deal for the reader and the one
  // that lets us keep a customer for a year, and it has the trial too. A
  // wall that opens with the monthly trial links to `?cycle=monthly` so
  // it lands on the cycle it just offered.
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
      className="text-muted-foreground flex h-12 w-full items-center justify-center rounded-md border border-dashed text-sm font-medium"
    >
      {t("currentPlan")}
    </div>
  );

  /** A change of plan is a proration, and Stripe's portal owns it. */
  const switchTo = (label: string, filled: boolean) => (
    <Button
      size="lg"
      variant={filled ? "default" : "outline"}
      className="w-full"
      asChild
    >
      <Link href="/app/account">{label}</Link>
    </Button>
  );

  /** "Hoy $0,00 · el {date} …", with the two figures in bold. */
  const trialNote = (key: "trialNoteYearly" | "trialNoteMonthly") =>
    t.rich(key, {
      zero: formatUSD(0, locale),
      date: format.dateTime(trialEnd(), {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      amount: formatUSD(PRICES.unlimited[interval].amount, locale),
      months: yearlyDiscount("unlimited").freeMonths,
      b: (chunks) => <b className="text-foreground font-semibold">{chunks}</b>,
    });

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
        <div
          role="radiogroup"
          // Not the page's heading: this group chooses a billing cycle,
          // and a screen reader announcing "what each plan includes" here
          // describes the table further down instead.
          aria-label={t("cycleLabel")}
          className="flex items-center gap-1.5"
        >
          {(["yearly", "monthly"] as const).map((option) => (
            <Chip
              key={option}
              role="radio"
              aria-checked={interval === option}
              pressed={interval === option}
              onClick={() => setInterval(option)}
              className="h-10 px-4 text-[15px] md:h-9 md:px-3.5 md:text-sm"
            >
              {t(option)}
            </Chip>
          ))}
        </div>
        {yearly && (
          <span className="text-success text-sm font-medium">
            {discount
              ? t("saveHalf", {
                  percent: discount.percent,
                  months: discount.freeMonths,
                })
              : t("yearlySaveGeneric")}
          </span>
        )}
      </div>

      {/* F1-02: the trial is the offer, on both cycles, so it is said once
          above the cards rather than only inside one of them. Not to
          somebody who is already paying: they cannot start one. */}
      {!paying && (
        <p className="border-success-line bg-success-soft text-success-ink mt-4 rounded-[10px] border px-3.5 py-3 text-sm leading-5 md:mt-[18px] md:px-4 md:text-center">
          {t.rich("trialBand", {
            days: TRIAL.days,
            b: (chunks) => <b className="font-semibold">{chunks}</b>,
          })}
        </p>
      )}

      {/* In the DOM, Ilimitado first: on a phone what is read first is
          what is read at all. From md up the order puts it in the middle,
          Gratis · Ilimitado · Pro, which is how the eye reads three. */}
      <div className="mt-4 grid items-stretch gap-4 md:mt-5 md:grid-cols-3 md:gap-5">
        <Card
          highlighted
          // The paraphraser's result note links here (F2-04).
          id="ilimitado"
          className="md:order-2"
          // The only badge on the page, and it names the recommendation
          // rather than an offer.
          badge={t("mostPopular")}
          title={plans("unlimited")}
          price={formatUSD(
            PRICES.unlimited[interval].monthlyEquivalent,
            locale,
          )}
          suffix={t("perMonth")}
          total={
            yearly
              ? t("yearlyTotal", {
                  amount: formatUSD(PRICES.unlimited.yearly.amount, locale),
                })
              : undefined
          }
          billing={
            yearly
              ? undefined
              : t("billingUnlimitedMonthly", {
                  days: TRIAL.days,
                  amount: formatUSD(PRICES.unlimited.monthly.amount, locale),
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
              <Button size="lg" className="w-full" asChild>
                <Link
                  href={{
                    pathname: "/checkout",
                    query: { plan: "unlimited", cycle: interval },
                  }}
                >
                  {t("tryFree", { days: TRIAL.days })}
                </Link>
              </Button>
            )
          }
          note={
            viewer?.plan === "unlimited" ? null : viewer?.plan === "pro" ? (
              // A proration is arithmetic we do not do here. Promising an
              // amount we have not computed is how a change of plan turns
              // into a complaint.
              <span data-testid="trial-disclosure">{t("switchNote")}</span>
            ) : (
              // What the trial ends in, under the button that starts it:
              // the whole year on the yearly cycle.
              <span data-testid="trial-note">
                {trialNote(yearly ? "trialNoteYearly" : "trialNoteMonthly")}
              </span>
            )
          }
        />

        <Card
          className="md:order-3"
          title={plans("pro")}
          price={formatUSD(PRICES.pro[interval].monthlyEquivalent, locale)}
          suffix={t("perMonth")}
          total={
            yearly
              ? t("yearlyTotal", {
                  amount: formatUSD(PRICES.pro.yearly.amount, locale),
                })
              : undefined
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
              // Outlined in the brand colour: second in line, still a plan
              // somebody can buy here (F1-10).
              <Button
                size="lg"
                variant="outline"
                className="border-brand text-brand hover:bg-brand-softer hover:text-brand w-full border-[1.5px]"
                asChild
              >
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
          className="md:order-1"
          title={plans("free")}
          price={formatUSD(0, locale)}
          billing={t("billingFree")}
          features={[
            t("wordsPerDay", { words: n(PLANS.free.limits.wordsPerDay ?? 0) }),
            t("perRequest", { words: n(PLANS.free.limits.maxWordsPerRequest) }),
            t("freeTools", {
              perUse: n(PLANS.free.limits.uses.paraphrase?.perUse ?? 0),
              uses: PLANS.free.limits.uses.paraphrase?.usesPerDay ?? 0,
            }),
          ]}
          cta={
            // Never propose something already done. With a session this
            // column went on selling "create a free account" to somebody
            // reading it from their own account -- and to a customer it
            // has nothing to say at all.
            viewer?.plan === "free" ? (
              currentPlan
            ) : paying ? null : (
              // A text link with a full-width 48px target: the free account
              // used to be the biggest button above the fold (F1-16).
              <Link
                href="/signup"
                aria-busy={viewer === undefined}
                className="text-brand focus-visible:ring-brand/30 flex h-12 w-full items-center justify-center rounded-md text-base font-semibold outline-none hover:underline focus-visible:ring-[3px]"
              >
                {t("signup")}
              </Link>
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
  note,
  highlighted = false,
  className,
  id,
}: {
  /** An anchor other pages link to. */
  id?: string;
  title: string;
  badge?: string;
  price: string;
  suffix?: string;
  /** The amount actually charged, when it differs from the headline. */
  total?: string;
  billing?: string;
  features: string[];
  cta: React.ReactNode;
  /** Under the button. The space is kept on every card, so the three
      buttons sit on one line. */
  note?: React.ReactNode;
  highlighted?: boolean;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-label={title}
      className={cn(
        "flex scroll-mt-28 flex-col rounded-[14px] border p-5 md:p-6",
        highlighted &&
          "border-brand border-2 p-[19px] md:p-[23px] md:shadow-[0_8px_24px_rgb(43_69_196/0.10)]",
        className,
      )}
    >
      <h2 className="flex items-center gap-2 text-[17px] font-semibold">
        {title}
        {badge && <Badge variant="brand">{badge}</Badge>}
      </h2>

      {/* One number, big. Anything else about money goes below it, as a
          sentence about when it is taken. */}
      <p
        data-testid="plan-price"
        className="mt-2 text-4xl font-bold tracking-[-0.02em]"
      >
        {price}
        {suffix && (
          <span className="text-muted-foreground text-base font-normal tracking-normal">
            {" "}
            {suffix}
          </span>
        )}
      </p>
      {/* The row is kept on every card, so the cards do not jump as the
          cycle changes under the reader's cursor. */}
      <p data-testid="plan-total" className="min-h-5 text-sm font-medium">
        {total}
      </p>
      {/* One line held on every card, so switching cycle does not move
          the buttons: Ilimitado has a line on the monthly cycle only. */}
      <p
        className={cn(
          "text-muted-foreground mt-2 text-sm leading-5 md:min-h-5",
          !billing && "max-md:hidden",
        )}
      >
        {billing}
      </p>

      {/* Grows, so the three buttons line up whatever each list holds. */}
      <ul className="text-muted-foreground mt-4 flex-1 space-y-1 text-sm">
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      <div className="mt-[18px]">{cta}</div>
      <p
        className={cn(
          "mt-2.5 text-center text-[13px] leading-[18px] text-neutral-700 md:min-h-[54px]",
          !note && "hidden md:invisible md:block",
        )}
      >
        {note}
      </p>
    </section>
  );
}
