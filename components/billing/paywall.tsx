"use client";

import { useEffect, useRef, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { usePostHog } from "posthog-js/react";

import { CheckoutPanel } from "@/components/billing/checkout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ToolId } from "@/lib/ai/tools";
import { trialDisclosure } from "@/lib/billing/disclosure";
import {
  PLANS,
  PRICES,
  TRIAL,
  formatUsd,
  type PlanId,
} from "@/lib/billing/plans";
import type { Locale } from "@/lib/i18n/routing";
import { Link, useRouter } from "@/lib/i18n/navigation";
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
  // The offer and the card field are the same dialog. Going to a payment
  // page from here would mean leaving the text this wall is about.
  const [paying, setPaying] = useState(false);
  const t = useTranslations("paywall");
  const checkout = useTranslations("checkout");
  const locale = useLocale() as Locale;
  const format = useFormatter();
  const posthog = usePostHog();
  const router = useRouter();
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
      {paying ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPaying(false)}
              aria-label={checkout("back")}
            >
              ←
            </Button>
            <h2 id="paywall-quota-title" className="font-semibold">
              {checkout("modalTitle")}
            </h2>
          </div>
          <CheckoutPanel
            target={{ tier: "unlimited", interval: "monthly" }}
            onBack={onDismiss}
          />
        </div>
      ) : (
        <>
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
                maskImage:
                  "linear-gradient(to bottom, #000 0%, transparent 85%)",
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
            <Button
              size="lg"
              onClick={() => {
                posthog?.capture("paywall_primary_clicked", context);
                // Nobody can be billed without an account to bill. A signed-out
                // reader goes through the door first and comes back; the editor
                // still holds their text either way.
                if (accountState === "anonymous") {
                  router.push({
                    pathname: "/login",
                    query: { next: "/pricing" },
                  });
                  return;
                }
                setPaying(true);
              }}
            >
              {t("tryUnlimited", { days: TRIAL.days })}
            </Button>
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
        </>
      )}
    </PaywallDialog>
  );
}

/**
 * Wall C — a paid tool, opened by somebody on a free plan.
 *
 * Narrow, over a light veil, and it opens by saying what is still free.
 * A wall that only lists what is locked reads as a shut door; naming the
 * two tools that stay free, with or without an account, is what keeps it
 * an offer.
 */
export function ToolPaywall({
  tool,
  plan,
  onDismiss,
}: {
  tool: ToolId;
  plan: PlanId;
  onDismiss: () => void;
}) {
  const t = useTranslations("paywall");
  const names = useTranslations("tools");
  const locale = useLocale() as Locale;
  const posthog = usePostHog();
  const router = useRouter();
  const accountState = accountStateOf(plan);
  const context = {
    trigger: "tool" as const,
    plan,
    accountState,
    toolId: tool,
  };

  return (
    <PaywallDialog
      context={context}
      labelledBy="paywall-tool-title"
      width="27rem"
      onDismiss={() => {
        posthog?.capture("paywall_dismissed", context);
        onDismiss();
      }}
    >
      <Badge variant="brand">{t("paidPlanBadge")}</Badge>

      <h2 id="paywall-tool-title" className="mt-3 text-lg font-semibold">
        {t("toolTitle", {
          tool: names(`${tool}.name`).toLocaleLowerCase(locale),
        })}
      </h2>
      <p className="text-muted-foreground mt-2 text-sm leading-normal">
        {t("toolBody")}
      </p>

      <div className="mt-5 flex flex-col gap-2">
        <Button
          size="lg"
          onClick={() => {
            posthog?.capture("paywall_primary_clicked", context);
            router.push({
              pathname: accountState === "anonymous" ? "/login" : "/checkout",
              query:
                accountState === "anonymous"
                  ? { next: "/pricing" }
                  : { plan: "unlimited", cycle: "monthly" },
            });
          }}
        >
          {t("tryUnlimited", { days: TRIAL.days })}
        </Button>
        <Button variant="outline" asChild>
          <Link
            href="/pricing"
            onClick={() =>
              posthog?.capture("paywall_secondary_clicked", context)
            }
          >
            {t("seePlans")}
          </Link>
        </Button>
      </div>

      <TrialDisclosure className="mt-4" />
    </PaywallDialog>
  );
}

/**
 * Wall D — a locked feature, in place.
 *
 * A popover anchored to the lock rather than a modal: this is the lightest
 * wall in the set and the reader should not have to leave the result they
 * are looking at to read it. No disclosure, because the only action here
 * goes to the pricing page and starts no charge. No trial either: the
 * natural step up from one locked feature is Pro, not the top plan.
 */
export function FeatureLock({
  feature,
  plan,
  label,
}: {
  feature: "history" | "breakdown";
  plan: PlanId;
  /** What the lock itself says, inline where the feature would be. */
  label: string;
}) {
  const t = useTranslations("paywall");
  const detector = useTranslations("detector");
  const posthog = usePostHog();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const title =
    feature === "history" ? t("historyLockTitle") : detector("gated");
  const context = {
    trigger: "feature" as const,
    plan,
    accountState: accountStateOf(plan),
    toolId: feature,
  };

  useEffect(() => {
    if (!open) return;
    posthog?.capture("paywall_shown", context);
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((was) => !was)}
        aria-expanded={open}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-brand/30 rounded text-xs underline underline-offset-2 focus-visible:ring-[3px] focus-visible:outline-none"
      >
        {label}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={title}
          // Anchored to the lock on a wide screen; pinned to the margins on
          // a narrow one, where 19rem of fixed width overflows the viewport.
          className="bg-card absolute z-40 mt-2 w-[19rem] max-w-[calc(100vw-2rem)] rounded-xl border p-4 shadow-lg max-[420px]:fixed max-[420px]:inset-x-4 max-[420px]:w-auto"
        >
          <p className="text-sm font-semibold">{title}</p>
          {/* The history gate has a second line because the privacy nuance
              matters there: free plans keep the count, not the text. The
              breakdown says everything it needs in one. */}
          {feature === "history" && (
            <p className="text-muted-foreground mt-2 text-sm leading-normal">
              {t("historyLockBody")}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <Link
                href="/pricing"
                onClick={() =>
                  posthog?.capture("paywall_primary_clicked", context)
                }
              >
                {t("unlockWithPro")}
              </Link>
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              {t("close")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
