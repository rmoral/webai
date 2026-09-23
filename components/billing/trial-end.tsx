"use client";

import { useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { usePostHog } from "posthog-js/react";

import { PaywallDialog } from "@/components/billing/paywall";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/events";
import { PLANS, PRICES, TRIAL, formatUsd } from "@/lib/billing/plans";
import { useRouter } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";

// Wall E — the last day of the trial, before the charge.
//
// The only wall in the system with no way out, and the only one with two
// primary actions of equal weight. Both are deliberate and both are legal
// rather than aesthetic: somebody is about to be charged $29.99 and the
// screen that tells them has to make continuing, stepping down and
// stopping equally reachable. A design that nudges towards the expensive
// one is the thing that produces disputes.
//
// Everything it offers narrows: stay, pay less, or stop. Nothing here can
// increase what anyone owes.

type Action = "switch_to_pro" | "cancel";

export function TrialEndWall({ onSettled }: { onSettled: () => void }) {
  const t = useTranslations("trialEnd");
  const plans = useTranslations("plans");
  const locale = useLocale() as Locale;
  const format = useFormatter();
  const posthog = usePostHog();
  const router = useRouter();

  const [busy, setBusy] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);

  const context = {
    variant: "modal" as const,
    reason: "trial_end" as const,
    plan: "unlimited" as const,
  };

  async function act(action: Action) {
    setBusy(action);
    setError(null);
    // Cancelling starts here and finishes in Stripe, so `cancel_done` is
    // emitted by the webhook rather than by this button: what matters is
    // whether the subscription actually ended, not whether the click
    // reached us. Stepping down to Pro is not a cancellation and is
    // counted apart, or the churn number reads every rescue as a loss.
    if (action === "cancel") {
      track(posthog, "cancel_start", { plan: "unlimited" });
    } else {
      track(posthog, "plan_downgraded", { plan: "unlimited" });
    }

    const res = await fetch("/api/billing/manage", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });

    if (!res.ok) {
      setError(t("failed"));
      setBusy(null);
      return;
    }

    // The webhook rewrites the row; refreshing is what makes the header,
    // the quota bar and this wall agree again.
    onSettled();
    router.refresh();
  }

  const unlimited = PLANS.unlimited.limits;
  const pro = PLANS.pro.limits;

  return (
    <PaywallDialog
      context={context}
      labelledBy="trial-end-title"
      width="44rem"
      // No onDismiss: no cross, no Escape, no click-away. The alternative
      // is charging somebody who never chose.
    >
      <Badge variant="warning">{t("badge")}</Badge>

      <h2 id="trial-end-title" className="mt-3 text-xl font-semibold">
        {t("title")}
      </h2>
      <p className="text-muted-foreground mt-2 text-sm leading-normal">
        {t("body", { days: TRIAL.days })}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {/* Same width, same button size, same prominence. Neither card is
            "the good one" and the markup must not imply otherwise. */}
        <div className="flex flex-col gap-3 rounded-xl border p-4">
          <div>
            <p className="font-semibold">{plans("unlimited")}</p>
            <p className="text-sm">
              {formatUsd(PRICES.unlimited.monthly.amount, locale)}
              {t("perMonth")}
            </p>
            <p className="text-muted-foreground mt-2 text-sm leading-normal">
              {t("unlimitedBody", {
                month: format.number(unlimited.wordsPerMonth ?? 0),
                request: format.number(unlimited.maxWordsPerRequest),
              })}
            </p>
          </div>
          <Button
            className="mt-auto w-full"
            disabled={busy !== null}
            onClick={() => {
              posthog?.capture("trial_continued", context);
              onSettled();
            }}
          >
            {t("continueUnlimited")}
          </Button>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border p-4">
          <div>
            <p className="font-semibold">{plans("pro")}</p>
            <p className="text-sm">
              {formatUsd(PRICES.pro.monthly.amount, locale)}
              {t("perMonth")}
            </p>
            <p className="text-muted-foreground mt-2 text-sm leading-normal">
              {t("proBody", {
                month: format.number(pro.wordsPerMonth ?? 0),
                request: format.number(pro.maxWordsPerRequest),
              })}
            </p>
          </div>
          <Button
            variant="ink"
            className="mt-auto w-full"
            disabled={busy !== null}
            onClick={() => act("switch_to_pro")}
          >
            {busy === "switch_to_pro" ? t("working") : t("switchToPro")}
          </Button>
        </div>
      </div>

      <p className="border-brand-line bg-brand-softer text-brand-ink mt-5 rounded-xl border p-4 text-sm leading-normal">
        {t("disclosure", {
          unlimited: formatUsd(PRICES.unlimited.monthly.amount, locale),
        })}
      </p>

      {error && (
        <p className="text-danger-ink mt-3 text-sm" role="alert">
          {error}
        </p>
      )}

      {/* The thing the industry hides. It is on the same screen, in the
          same flow, and it is what keeps this out of a chargeback. */}
      <div className="mt-3 flex justify-center">
        <Button
          variant="ghost"
          disabled={busy !== null}
          onClick={() => act("cancel")}
        >
          {busy === "cancel" ? t("working") : t("cancel")}
        </Button>
      </div>
    </PaywallDialog>
  );
}
