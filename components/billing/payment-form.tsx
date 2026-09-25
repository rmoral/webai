"use client";

import { useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { loadStripe, type Appearance } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { usePostHog } from "posthog-js/react";

import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/events";
import { paymentDisclosure } from "@/lib/billing/disclosure";
import {
  CURRENCY,
  PAYMENT_METHOD_TYPES,
  PRICES,
  formatUsd,
  trialDaysFor,
  type BillingInterval,
  type PaidTier,
} from "@/lib/billing/plans";
import { pathFor, type Locale } from "@/lib/i18n/routing";
import { getPathname, useRouter } from "@/lib/i18n/navigation";

// Payment, inside the site.
//
// The card itself never touches this server: the Payment Element is an
// iframe of Stripe's and the details go straight to them encrypted, so the
// PCI scope is SAQ A, exactly as it was with the redirect. The page says so
// out loud -- an embedded form without that line reads as less trustworthy
// than the redirect it replaces, not more.

const PUBLISHABLE = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = PUBLISHABLE ? loadStripe(PUBLISHABLE) : null;

/**
 * The Element wearing the product's tokens. Not cosmetic: a payment form
 * that does not look like the rest of the site is the point where people
 * decide they are somewhere else.
 */
const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#2b45c4",
    colorBackground: "#ffffff",
    colorText: "#252525",
    colorDanger: "#8f2018",
    fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif',
    fontSizeBase: "14px",
    borderRadius: "8px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      border: "1px solid #ebebeb",
      boxShadow: "none",
      padding: "10px 12px",
    },
    ".Input:focus": {
      border: "1px solid #2b45c4",
      boxShadow: "0 0 0 3px rgba(43,69,196,.3)",
    },
    ".Label": { fontWeight: "500", fontSize: "14px" },
  },
};

export interface PaymentTarget {
  tier: PaidTier;
  interval: BillingInterval;
}

/**
 * Mounts the Element for a plan and cycle.
 *
 * It uses Stripe's deferred intent: the form renders with no secret, and
 * the subscription is created at submit. Creating it on mount would leave
 * an incomplete subscription behind for everyone who opens the form and
 * changes their mind -- and the next attempt would then be refused as
 * `already_subscribed`.
 */
export function PaymentPanel({
  target,
  onPaid,
}: {
  target: PaymentTarget;
  onPaid: (charged: number, nextChargeAt: string | null) => void;
}) {
  const t = useTranslations("payment");
  const locale = useLocale() as Locale;
  const trialDays = trialDaysFor(target.tier, target.interval);
  const amountCents = Math.round(
    PRICES[target.tier][target.interval].amount * 100,
  );

  if (!stripePromise) {
    return (
      <p className="text-destructive text-sm" role="alert">
        {t("unavailable")}
      </p>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={
        trialDays !== null
          ? {
              mode: "setup",
              currency: CURRENCY.toLowerCase(),
              // The card is kept for the charge at the end of the trial.
              setupFutureUsage: "off_session",
              // Named rather than automatic: the subscription names them
              // too, and Stripe.js will not confirm across that gap.
              paymentMethodTypes: [...PAYMENT_METHOD_TYPES],
              appearance,
              locale,
            }
          : {
              mode: "subscription",
              amount: amountCents,
              currency: CURRENCY.toLowerCase(),
              paymentMethodTypes: [...PAYMENT_METHOD_TYPES],
              appearance,
              locale,
            }
      }
    >
      <PaymentForm target={target} onPaid={onPaid} />
    </Elements>
  );
}

function PaymentForm({
  target,
  onPaid,
}: {
  target: PaymentTarget;
  onPaid: (charged: number, nextChargeAt: string | null) => void;
}) {
  const t = useTranslations("payment");
  const locale = useLocale() as Locale;
  const format = useFormatter();
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const posthog = usePostHog();

  const [consented, setConsented] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trialDays = trialDaysFor(target.tier, target.interval);
  const price = PRICES[target.tier][target.interval].amount;
  const dueToday = trialDays !== null ? 0 : price;

  async function pay() {
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);
    track(posthog, "payment_submitted", {
      plan: target.tier,
      cycle: target.interval,
    });

    // Stripe validates the fields before anything is created, so a typo in
    // the card number does not cost a subscription object.
    const submitted = await elements.submit();
    if (submitted.error) {
      setError(submitted.error.message ?? t("declined"));
      setBusy(false);
      return;
    }

    const res = await fetch("/api/billing/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        plan: target.tier,
        cycle: target.interval,
        locale,
        consent: true,
      }),
    });

    if (res.status === 401) {
      // They have to have an account to be billed. They come back to this
      // card field with this plan, not to a pricing page they have already
      // read -- and the `next` is the localised path, since /checkout is an
      // internal route name that resolves to /pago in Spanish.
      router.push({
        pathname: "/signup",
        query: {
          next: getPathname({
            href: {
              pathname: "/checkout",
              query: { plan: target.tier, cycle: target.interval },
            },
            locale,
          }),
        },
      });
      return;
    }

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.clientSecret) {
      setError(
        data?.error === "already_subscribed" ? t("already") : t("failed"),
      );
      setBusy(false);
      return;
    }

    const confirm =
      data.mode === "setup" ? stripe.confirmSetup : stripe.confirmPayment;
    // `if_required` keeps a 3-D Secure challenge inside this page, in
    // Stripe's own modal. A hard redirect here would drop the customer out
    // of the editor mid-payment, which is the thing this phase removes.
    const result = await confirm({
      elements,
      clientSecret: data.clientSecret,
      redirect: "if_required",
      confirmParams: {
        // Only reached by a payment method that leaves the page. It used to
        // point at /app, so the one flow that most needs the confirmation
        // screen was the one flow that never saw it.
        return_url: `${window.location.origin}${pathFor("/checkout/done", locale)}`,
      },
    });

    if (result.error) {
      setError(result.error.message ?? t("declined"));
      setBusy(false);
      return;
    }

    // The sale itself is reported by the webhook (`purchase`): a browser
    // that closes on the redirect would otherwise take the sale with it.
    // This one measures the form, not the money.
    track(posthog, "payment_succeeded", {
      plan: target.tier,
      cycle: target.interval,
      trial: trialDays !== null,
      // What was taken today, which on a trial is nothing. Weighting a
      // trial start above zero is a decision for the Ads account, not a
      // number to invent here.
      value: data.amountTodayCents / 100,
    });
    onPaid(data.amountTodayCents, data.nextChargeAt);
  }

  return (
    <div className="flex flex-col gap-4">
      <PaymentElement
        options={{
          layout: "tabs",
          // Wallets first: on a phone they settle the payment in one
          // gesture, and that is where most of the abandonment is.
          wallets: { applePay: "auto", googlePay: "auto" },
          fields: {
            billingDetails: {
              address: { country: "auto", postalCode: "auto" },
            },
          },
        }}
      />

      <p className="border-brand-line bg-brand-softer text-brand-ink rounded-xl border p-4 text-sm leading-normal">
        {paymentDisclosure(locale, target.tier, target.interval, t, (date) =>
          format.dateTime(date, {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        )}
      </p>

      <label className="flex items-start gap-3 text-sm leading-normal">
        <input
          type="checkbox"
          checked={consented}
          onChange={(e) => setConsented(e.target.checked)}
          disabled={busy}
          className="accent-brand mt-0.5 size-4 shrink-0"
        />
        {t("consent")}
      </label>

      {error && (
        <p className="text-danger-ink text-sm" role="alert">
          {error} {t("nothingCharged")}
        </p>
      )}

      <Button
        onClick={pay}
        disabled={!consented || busy || !stripe}
        size="lg"
        className="w-full"
      >
        {busy
          ? t("processing")
          : trialDays !== null
            ? t("startTrialCta", { amount: formatUsd(dueToday, locale) })
            : t("payCta", { amount: formatUsd(dueToday, locale) })}
      </Button>

      <p className="text-muted-foreground text-xs leading-normal">
        {t("securityNote")}
      </p>
    </div>
  );
}
