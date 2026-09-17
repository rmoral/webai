"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePostHog } from "posthog-js/react";

import { Button } from "@/components/ui/button";
import type { BillingInterval } from "@/lib/billing/plans";
import { useRouter } from "@/lib/i18n/navigation";

// Stripe refusing us is our problem, not the customer's, and there is
// nothing for them to retry. Four settings fail the same way from the
// outside, so they share one message and the reference tells us which.
const CONFIG_PROBLEM = [
  "tax_not_configured",
  "terms_url_missing",
  "stripe_key_invalid",
  "customer_update_invalid",
] as const;

const KNOWN = [
  "stripe_unavailable",
  "database_unavailable",
  "price_not_configured",
  "checkout_failed",
  "server_error",
  "invalid_request",
] as const;

export function CheckoutButton({
  plan,
  interval,
  label,
  variant = "default",
}: {
  plan: "pro" | "unlimited" | "topup";
  interval: BillingInterval;
  label: string;
  variant?: "default" | "outline";
}) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const posthog = usePostHog();

  function messageFor(code: string) {
    if ((CONFIG_PROBLEM as readonly string[]).includes(code))
      return t("configProblem");
    if ((KNOWN as readonly string[]).includes(code))
      return t(code as (typeof KNOWN)[number]);
    return t("default");
  }

  async function checkout() {
    setLoading(true);
    setError(null);
    posthog?.capture("checkout_started", { plan, interval });

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      // Stripe Checkout renders in this language, and the URLs it sends
      // people back to have to land in it too.
      body: JSON.stringify({ plan, interval, locale }),
    });

    if (res.status === 401) {
      router.push({ pathname: "/login", query: { next: "/pricing" } });
      return;
    }
    if (res.status === 403) {
      setError(t("needSubscription"));
      setLoading(false);
      return;
    }

    const data = await res.json().catch(() => null);
    if (data?.url) {
      window.location.href = data.url;
      return;
    }

    // Every failure used to read the same, so the four causes were
    // indistinguishable from the outside. The reference is what turns a
    // support message into a diagnosis.
    const code = typeof data?.error === "string" ? data.error : "no_response";
    setError(t("reference", { message: messageFor(code), code }));
    setLoading(false);
  }

  return (
    <>
      <Button variant={variant} onClick={checkout} disabled={loading}>
        {loading ? t("opening") : label}
      </Button>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </>
  );
}
