"use client";

import { useEffect, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { usePostHog } from "posthog-js/react";

import {
  PaymentPanel,
  type PaymentTarget,
} from "@/components/billing/payment-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { track } from "@/lib/analytics/events";
import {
  PRICES,
  formatUsd,
  trialDaysFor,
  type BillingInterval,
  type PaidTier,
} from "@/lib/billing/plans";
import { Link } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

// What goes around the Payment Element: the breakdown, the two exits, and
// the confirmation. Shared by the modal that opens from a paywall and by
// the /checkout page that opens from pricing.

export interface Paid {
  amountTodayCents: number;
  nextChargeAt: string | null;
}

/**
 * The breakdown.
 *
 * The trial shows as a negative line rather than as a claim, so that "you
 * pay $0.00 today" is something the reader can check by adding up the
 * column instead of something we assert.
 */
export function OrderSummary({
  target,
  className,
}: {
  target: PaymentTarget;
  className?: string;
}) {
  const t = useTranslations("checkout");
  const plans = useTranslations("plans");
  const locale = useLocale() as Locale;
  const [howTo, setHowTo] = useState(false);

  const trialDays = trialDaysFor(target.tier, target.interval);
  const price = PRICES[target.tier][target.interval].amount;
  const dueToday = trialDays !== null ? 0 : price;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="font-medium">{plans(target.tier)}</span>
        <span>{formatUsd(price, locale)}</span>
      </div>

      {trialDays !== null && (
        <div className="text-success-ink flex items-baseline justify-between gap-4 text-sm">
          <span>{t("trialLine", { days: trialDays })}</span>
          <span>−{formatUsd(price, locale)}</span>
        </div>
      )}

      <div className="text-muted-foreground flex items-baseline justify-between gap-4 text-sm">
        <span>{t("taxes")}</span>
        <span>{t("taxesValue")}</span>
      </div>

      <div className="flex items-baseline justify-between gap-4 border-t pt-3 font-semibold">
        <span>{t("dueToday")}</span>
        <span>{formatUsd(dueToday, locale)}</span>
      </div>

      {/* Answered before the card is asked for, not after. A cancellation
          policy that only appears once you have paid is not a policy. */}
      <div>
        <button
          type="button"
          onClick={() => setHowTo((open) => !open)}
          aria-expanded={howTo}
          className="text-brand text-sm underline"
        >
          {t("howToCancel")}
        </button>
        {howTo && (
          <div className="text-muted-foreground mt-2 text-sm leading-normal">
            <p className="font-medium">{t("howToCancelTitle")}</p>
            <ol className="mt-1 list-decimal pl-5">
              <li>{t("cancelStep1")}</li>
              <li>{t("cancelStep2")}</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The confirmation.
 *
 * The date of the first charge is the largest thing on it, in its own
 * panel with the amount underneath. It is the single fact that decides
 * whether this turns into a chargeback in three days' time.
 */
export function PaymentSuccess({
  target,
  paid,
  onResume,
}: {
  target: PaymentTarget;
  paid: Paid;
  /** Present only when payment happened over the work they were doing. */
  onResume?: () => void;
}) {
  const t = useTranslations("checkout");
  const plans = useTranslations("plans");
  const locale = useLocale() as Locale;
  const format = useFormatter();

  const trialDays = trialDaysFor(target.tier, target.interval);
  const trial = trialDays !== null;
  const charged = paid.amountTodayCents / 100;
  const recurring = formatUsd(
    PRICES[target.tier][target.interval].amount,
    locale,
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Badge variant="success">
          {trial ? t("successTrialBadge") : t("successPaidBadge")}
        </Badge>
        <h2 className="mt-3 text-xl font-semibold">
          {trial
            ? t("successTrialTitle")
            : t("successPaidTitle", { plan: plans(target.tier) })}
        </h2>
        {trial && (
          <p className="text-muted-foreground mt-2 text-sm leading-normal">
            {t("successTrialBody", { days: trialDays })}
          </p>
        )}
      </div>

      <div className="border-brand-line bg-brand-softer rounded-xl border p-5 text-center">
        <p className="text-brand-ink text-sm font-medium">
          {trial ? t("firstCharge") : t("nextRenewal")}
        </p>
        <p className="text-brand-ink mt-1 text-2xl font-semibold">
          {paid.nextChargeAt
            ? format.dateTime(new Date(paid.nextChargeAt), {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "—"}
        </p>
        <p className="text-brand-ink mt-1 text-sm">
          {trial
            ? t("chargeNoteTrial", { amount: recurring })
            : t("chargeNotePaid", { amount: recurring })}
        </p>
      </div>

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{t("rowPlan")}</dt>
          <dd>{plans(target.tier)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{t("rowPaidToday")}</dt>
          <dd>{formatUsd(charged, locale)}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2">
        {onResume ? (
          <Button size="lg" onClick={onResume}>
            {t("resume")}
          </Button>
        ) : (
          <Button size="lg" asChild>
            <Link href="/app">{t("goToApp")}</Link>
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href="/app/account">{t("manage")}</Link>
        </Button>
      </div>

      <p className="text-muted-foreground text-xs leading-normal">
        {t("successClose")}
      </p>
    </div>
  );
}

/**
 * Payment over the editor.
 *
 * The cycle cannot be changed here: it was decided by the wall that opened
 * this, and re-opening the decision at the card field loses people. Back
 * returns to the wall; closing returns to the editor with the text still
 * in it.
 */
export function CheckoutPanel({
  target,
  onBack,
}: {
  target: PaymentTarget;
  onBack?: () => void;
}) {
  const t = useTranslations("checkout");
  const [paid, setPaid] = useState<Paid | null>(null);

  if (paid) {
    return <PaymentSuccess target={target} paid={paid} onResume={onBack} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-muted/40 rounded-xl border p-4">
        <p className="text-muted-foreground mb-3 text-sm">{t("summaryNote")}</p>
        <OrderSummary target={target} />
      </div>
      <PaymentPanel
        target={target}
        onPaid={(amountTodayCents, nextChargeAt) =>
          setPaid({ amountTodayCents, nextChargeAt })
        }
      />
    </div>
  );
}

/**
 * The /checkout page: summary and cycle on the left, card on the right.
 *
 * Changing the cycle moves the breakdown, the amount on the button and the
 * disclosure together. Anything less and the page shows two prices at once,
 * which is the exact confusion this redesign was written to remove -- so
 * the Element is remounted on the change rather than patched, because its
 * mode ("setup" for a trial, "subscription" otherwise) changes with it.
 */
export function CheckoutPageView({
  tier,
  initialInterval,
}: {
  tier: PaidTier;
  initialInterval: BillingInterval;
}) {
  const t = useTranslations("checkout");
  const [interval, setInterval] = useState<BillingInterval>(initialInterval);
  const [paid, setPaid] = useState<Paid | null>(null);
  const target = { tier, interval };
  const posthog = usePostHog();

  // The page only renders behind a session, so `logged_in` is a constant
  // here -- it is carried anyway so the event has the same shape wherever
  // it is emitted from.
  useEffect(() => {
    track(posthog, "checkout_view", {
      plan: tier,
      cycle: initialInterval,
      logged_in: true,
    });
  }, [posthog, tier, initialInterval]);

  if (paid) {
    return (
      <div className="mx-auto max-w-lg">
        <PaymentSuccess target={target} paid={paid} />
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("pageTitle")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("pageLede")}</p>
        </div>

        <div
          role="radiogroup"
          aria-label={t("dueToday")}
          className="flex gap-2"
        >
          {(["monthly", "yearly"] as const).map((option) => (
            <Chip
              key={option}
              pressed={interval === option}
              onClick={() => setInterval(option)}
              role="radio"
            >
              {t(option)}
            </Chip>
          ))}
        </div>

        <div className="bg-muted/40 rounded-xl border p-5">
          <OrderSummary target={target} />
        </div>
      </div>

      <PaymentPanel
        key={interval}
        target={target}
        onPaid={(amountTodayCents, nextChargeAt) =>
          setPaid({ amountTodayCents, nextChargeAt })
        }
      />
    </div>
  );
}

export type { PaidTier };
