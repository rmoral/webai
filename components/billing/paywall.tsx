"use client";

import { useEffect, useRef } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { usePostHog } from "posthog-js/react";

import { CheckoutButton } from "@/components/marketing/checkout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trialDisclosure } from "@/lib/billing/disclosure";
import {
  PLANS,
  PRICES,
  TRIAL,
  formatUsd,
  type PlanId,
} from "@/lib/billing/plans";
import type { Locale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

// The paywall. One shell, five triggers, and the rule that holds them all
// together: it never opens cold. Every variant answers something the user
// just did, at the moment the limit costs them something -- not earlier,
// when it is noise, nor later, when they have gone.
//
// This file carries the shell and trigger `quota` (wall B). The other four
// compose the same shell.

export type PaywallTrigger =
  "overflow" | "quota" | "tool" | "feature" | "trialEnd";

/** Who is looking, which decides the cheapest next step we can offer. */
export type AccountState = "anonymous" | "free" | "paid";

export function accountStateOf(plan: PlanId): AccountState {
  if (plan === "anonymous") return "anonymous";
  return plan === "free" ? "free" : "paid";
}

interface PaywallContext {
  trigger: PaywallTrigger;
  plan: PlanId;
  accountState: AccountState;
  toolId?: string;
}

const dismissalKey = (trigger: PaywallTrigger) =>
  `paywall_dismissed_${trigger}`;

/**
 * Dismissed once means gone for the session, per trigger. A wall that comes
 * back after the user closed it stops being an offer and becomes an
 * obstacle. `trialEnd` is exempt: it is the one wall with no way out,
 * because the alternative is charging someone who never chose.
 */
export function paywallDismissed(trigger: PaywallTrigger): boolean {
  try {
    return sessionStorage.getItem(dismissalKey(trigger)) === "1";
  } catch {
    return false;
  }
}

export function rememberPaywallDismissal(trigger: PaywallTrigger): void {
  try {
    sessionStorage.setItem(dismissalKey(trigger), "1");
  } catch {
    // Private mode, or storage denied. Losing the memory shows the wall
    // once more; failing the render would show nothing at all.
  }
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

/**
 * Modal shell. Below 520 px it becomes a bottom sheet: a centred dialog on
 * a phone leaves the primary action under the thumb of nobody.
 *
 * `onDismiss` undefined means the wall cannot be closed -- no Escape, no
 * backdrop click, no cross. Only `trialEnd` is built that way.
 */
export function PaywallDialog({
  context,
  onDismiss,
  labelledBy,
  width = "33rem",
  children,
}: {
  context: PaywallContext;
  onDismiss?: () => void;
  labelledBy: string;
  width?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const posthog = usePostHog();

  useEffect(() => {
    posthog?.capture("paywall_shown", { ...context });
    // The context object is rebuilt on every render; its fields are what
    // identify the wall, and they do not change while it is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const opener = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
    (focusables()[0] ?? node).focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && onDismiss) {
        event.preventDefault();
        onDismiss();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    node.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      node.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      opener?.focus?.();
    };
  }, [onDismiss]);

  return (
    <div
      // A light veil, not a dark scrim: the editor stays visible behind it.
      // The wall is an offer about the work in view, so hiding the work
      // makes it read as an eviction.
      className="bg-background/62 fixed inset-0 z-50 flex items-end justify-center backdrop-blur-[2px] min-[520px]:items-center min-[520px]:p-6"
      onMouseDown={(event) => {
        if (onDismiss && event.target === event.currentTarget) onDismiss();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        style={{ maxWidth: width }}
        className="bg-card max-h-[94dvh] w-full overflow-y-auto rounded-t-2xl border p-6 shadow-lg outline-none min-[520px]:rounded-2xl"
      >
        {children}
      </div>
    </div>
  );
}

/** The disclosure block. 14 px, in the flow, on a tinted panel — never fine print. */
export function TrialDisclosure({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const checkout = useTranslations("checkout");
  const format = useFormatter();

  return (
    <p
      className={cn(
        "border-brand-line bg-brand-softer text-brand-ink rounded-xl border p-4 text-sm leading-normal",
        className,
      )}
    >
      {trialDisclosure(locale, checkout, (date) =>
        format.dateTime(date, {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      )}
    </p>
  );
}

export interface WithheldResult {
  partialResult: string;
  visibleChars: number;
  usedToday: number;
  limitToday: number;
}

/**
 * Wall B — the daily allowance is spent and the result is already made.
 *
 * The beginning of it is legible and the rest is blurred. That is the whole
 * variant: the user is looking at their own text, so the offer is about
 * something they can see rather than something we describe. The withheld
 * half is `aria-hidden` and unselectable, or a screen reader simply reads
 * the answer aloud and the wall does not exist.
 */
export function QuotaPaywall({
  tool,
  plan,
  result,
  onDismiss,
}: {
  tool: string;
  plan: PlanId;
  result: WithheldResult;
  onDismiss: () => void;
}) {
  const t = useTranslations("paywall");
  const locale = useLocale() as Locale;
  const format = useFormatter();
  const posthog = usePostHog();
  const accountState = accountStateOf(plan);
  const context = {
    trigger: "quota" as const,
    plan,
    accountState,
    toolId: tool,
  };

  const visible = result.partialResult.slice(0, result.visibleChars);
  const withheld = result.partialResult.slice(result.visibleChars);

  return (
    <PaywallDialog
      context={context}
      labelledBy="paywall-quota-title"
      onDismiss={() => {
        posthog?.capture("paywall_dismissed", context);
        onDismiss();
      }}
    >
      <Badge variant="warning">
        {t("quotaBadge", {
          used: format.number(result.usedToday),
          limit: format.number(result.limitToday),
        })}
      </Badge>

      <h2 id="paywall-quota-title" className="mt-3 text-xl font-semibold">
        {t("quotaTitle")}
      </h2>
      <p className="text-muted-foreground mt-2 text-sm leading-normal">
        {accountState === "anonymous"
          ? t("quotaLeadAnon", {
              words: format.number(PLANS.free.limits.wordsPerDay ?? 0),
            })
          : t("quotaLeadUser")}
      </p>

      <div className="bg-muted/40 mt-4 max-h-56 overflow-hidden rounded-xl border p-4 text-sm leading-relaxed whitespace-pre-wrap">
        {visible}
        <span
          aria-hidden
          className="blur-[4.5px] select-none"
          // The fade is the one place a gradient earns its keep: it says
          // "there is more" without a word of copy. It masks the text
          // itself rather than painting a panel over it, so it works on
          // either theme.
          style={{
            maskImage: "linear-gradient(to bottom, #000 0%, transparent 85%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, #000 0%, transparent 85%)",
          }}
        >
          {withheld}
        </span>
      </div>

      <ul className="mt-4 space-y-1.5 text-sm">
        <li>
          <b className="font-semibold">{t("benefitNoLimitLead")}</b>{" "}
          {t("benefitNoLimit", {
            words: format.number(PLANS.unlimited.limits.maxWordsPerRequest),
          })}
        </li>
        <li>
          <b className="font-semibold">{t("benefitToolsLead")}</b>{" "}
          {t("benefitTools")}
        </li>
      </ul>

      <div className="mt-5 flex flex-col gap-2">
        <CheckoutButton
          plan="unlimited"
          interval="monthly"
          label={t("tryUnlimited", { days: TRIAL.days })}
          onStart={() => posthog?.capture("paywall_primary_clicked", context)}
        />
        <Button variant="outline" asChild>
          <Link
            href={accountState === "anonymous" ? "/login" : "/pricing"}
            onClick={() =>
              posthog?.capture("paywall_secondary_clicked", context)
            }
          >
            {accountState === "anonymous"
              ? t("createAccount", {
                  words: format.number(PLANS.free.limits.wordsPerDay ?? 0),
                })
              : t("seePro", {
                  price: formatUsd(PRICES.pro.monthly.amount, locale),
                })}
          </Link>
        </Button>
      </div>

      <TrialDisclosure className="mt-4" />
      <p className="text-muted-foreground mt-3 text-xs">{t("trustLine")}</p>
    </PaywallDialog>
  );
}
