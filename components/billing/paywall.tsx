"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { usePostHog } from "posthog-js/react";

// Loaded only when somebody actually opens the payment view. Imported at
// module scope it pulls @stripe/stripe-js into the bundle of every page
// that shows a lock -- including the detector landing, which never pays for
// anything.
const CheckoutPanel = dynamic(() =>
  import("@/components/billing/checkout").then((m) => m.CheckoutPanel),
);
import { DetectorProof } from "@/components/marketing/detector-proof";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  track,
  type DismissMethod,
  type WallReason,
  type WallVariant,
} from "@/lib/analytics/events";
import type { ToolId } from "@/lib/ai/tools";
import { trialDisclosure } from "@/lib/billing/disclosure";
import { PLANS, PRICES, TRIAL, type PlanId } from "@/lib/billing/plans";
import { formatUSD } from "@/lib/format";
import { DETECTOR_PROOF } from "@/lib/proof/detectors";
import type { Locale } from "@/lib/i18n/routing";
import {
  Link,
  getPathname,
  usePathname,
  useRouter,
} from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

// The paywall. One shell, five triggers, and the rule that holds them all
// together: it never opens cold. Every variant answers something the user
// just did, at the moment the limit costs them something -- not earlier,
// when it is noise, nor later, when they have gone.
//
// This file carries the shell and trigger `quota` (wall B). The other four
// compose the same shell.

export type PaywallTrigger = "overflow" | "quota" | "feature" | "trialEnd";

/** Who is looking, which decides the cheapest next step we can offer. */
export type AccountState = "anonymous" | "free" | "paid";

export function accountStateOf(plan: PlanId): AccountState {
  if (plan === "anonymous") return "anonymous";
  return plan === "free" ? "free" : "paid";
}

/**
 * What every wall reports about itself.
 *
 * Shaped as the analytics event rather than as the component's own idea of
 * itself, so that the five walls are one row in the funnel: `variant` is
 * the shape, `reason` is what the reader ran into. See lib/analytics.
 */
interface PaywallContext {
  variant: WallVariant;
  reason: WallReason;
  plan: PlanId;
  tool?: string;
  /** Whether the "Probado con" row was on it. Wall B only. */
  proof?: boolean;
}

const dismissalKey = (trigger: PaywallTrigger, tool?: string) =>
  `paywall_dismissed_${trigger}${tool ? `_${tool}` : ""}`;

/**
 * Dismissed once means gone for the session, per trigger AND per tool.
 *
 * A wall that comes back after the user closed it stops being an offer and
 * becomes an obstacle. But the key used to be the trigger alone, so
 * closing the paraphraser's wall silenced the corrector's too -- and the
 * corrector's button, whose only job was to open that wall, became a
 * button that did nothing at all. Two tools are two offers.
 *
 * `trialEnd` is exempt: it is the one wall with no way out, because the
 * alternative is charging someone who never chose.
 */
export function paywallDismissed(
  trigger: PaywallTrigger,
  tool?: string,
): boolean {
  try {
    return sessionStorage.getItem(dismissalKey(trigger, tool)) === "1";
  } catch {
    return false;
  }
}

export function rememberPaywallDismissal(
  trigger: PaywallTrigger,
  tool?: string,
): void {
  try {
    sessionStorage.setItem(dismissalKey(trigger, tool), "1");
  } catch {
    // Private mode, or storage denied. Losing the memory shows the wall
    // once more; failing the render would show nothing at all.
  }
}

/**
 * Where "try it free" has to end up: the card field, with the trial plan
 * already chosen, in the language being read.
 *
 * `/checkout` is an internal route name -- the URL is /pago in Spanish --
 * so a `next` built from the name alone 404s the reader it was meant to
 * bring back. The plan comes from TRIAL, which is the one place that
 * decides which plan has a trial at all.
 */
function trialCheckoutPath(locale: Locale): string {
  return getPathname({
    href: {
      pathname: "/checkout",
      query: { plan: TRIAL.tier, cycle: TRIAL.interval },
    },
    locale,
  });
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
  fullSheet = false,
  children,
}: {
  context: PaywallContext;
  /** How it was closed is the measurement: see `wall_dismissed`. */
  onDismiss?: (method: DismissMethod) => void;
  labelledBy: string;
  width?: string;
  /**
   * Below 640, a sheet that takes the screen bar 24px and scrolls inside,
   * over a dark veil (F1-05). For a wall with enough in it that a short
   * sheet would put the primary action below the fold.
   */
  fullSheet?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const posthog = usePostHog();
  const t = useTranslations("paywall");

  useEffect(() => {
    track(posthog, "wall_shown", context);
    // The context object is rebuilt on every render; its fields are what
    // identify the wall, and they do not change while it is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Before paint, not after: the wall can be on screen for a frame before
  // a passive effect runs, and an Escape pressed in that frame -- by a
  // reader quick on the key, or a loaded machine -- went nowhere.
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const opener = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
    (focusables()[0] ?? node).focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && onDismiss) {
        event.preventDefault();
        onDismiss("esc");
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
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center",
        fullSheet
          ? "sm:bg-background/62 bg-[#0a0a0a]/42 sm:items-center sm:p-6 sm:backdrop-blur-[2px]"
          : "bg-background/62 backdrop-blur-[2px] min-[520px]:items-center min-[520px]:p-6",
      )}
      onMouseDown={(event) => {
        if (onDismiss && event.target === event.currentTarget) onDismiss("x");
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        style={{ maxWidth: width }}
        className={cn(
          "bg-card relative w-full overflow-y-auto border shadow-lg outline-none",
          fullSheet
            ? "h-[calc(100dvh-24px)] overscroll-contain rounded-t-2xl px-5 pt-5 pb-4 shadow-[0_-10px_30px_rgb(0_0_0/0.18)] sm:h-auto sm:max-h-[calc(100vh-80px)] sm:rounded-2xl sm:px-6 sm:pt-6 sm:pb-5 sm:shadow-[0_24px_60px_rgb(0_0_0/0.22)]"
            : "max-h-[94dvh] rounded-t-2xl p-6 min-[520px]:rounded-2xl",
        )}
      >
        {/* A cross, because Escape is not a way out that anybody can see.
            The wall was closable only by a key nobody was told about, on a
            phone that has no such key at all. */}
        {onDismiss && (
          <button
            type="button"
            onClick={() => onDismiss("x")}
            aria-label={t("close")}
            className={cn(
              "text-muted-foreground hover:text-foreground focus-visible:ring-brand/30 absolute top-3 right-3 flex items-center justify-center rounded-full text-lg leading-none focus-visible:ring-[3px] focus-visible:outline-none",
              fullSheet
                ? "size-10 max-sm:top-2 max-sm:right-2 sm:size-8"
                : "size-8",
            )}
          >
            ×
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

/** The disclosure block. 14 px, in the flow, on a tinted panel — never fine print. */
export function TrialDisclosure({
  className,
  ...props
}: React.ComponentProps<"p">) {
  const locale = useLocale() as Locale;
  const checkout = useTranslations("checkout");
  const format = useFormatter();

  return (
    <p
      className={cn(
        "border-brand-line bg-brand-softer text-brand-ink rounded-xl border p-4 text-sm leading-normal",
        className,
      )}
      {...props}
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
  /** The result the reader paid for with the words they had left. */
  visibleText: string;
  /**
   * How many words the allowance could not cover. A count, never the
   * words: the server no longer writes them at all.
   */
  withheldWords: number;
  usedToday: number;
  limitToday: number;
}

const FILLER_SYLLABLES = [
  "ne",
  "ra",
  "lo",
  "si",
  "te",
  "ma",
  "co",
  "de",
  "in",
  "tu",
  "pa",
  "ri",
  "so",
  "ca",
  "men",
  "tra",
  "li",
  "do",
  "es",
  "que",
];

/**
 * The blur.
 *
 * Shapes generated here, never text. The withheld half used to be the real
 * result: the server produced the whole answer for a request it had just
 * refused, sent it to the browser and hid it behind `blur` and
 * `user-select: none` -- which is not hiding. Every word was in the DOM,
 * readable from the inspector by anyone who thought to look, and paid for
 * in inference by us.
 *
 * Now there is nothing to hide, because those words were never written.
 * What is left to convey is a quantity, and a quantity is a shape.
 *
 * Deterministic from the count, so the block does not reshuffle itself on
 * every render while the reader is looking at it. Capped, because the
 * panel shows a few lines and a thousand spans help nobody.
 */
function blurFiller(words: number): string {
  let seed = (words * 2654435761) % 2147483647 || 7;
  const next = () =>
    (seed = (seed * 1103515245 + 12345) % 2147483647) / 2147483647;

  const out: string[] = [];
  for (let i = 0; i < Math.min(words, 120); i++) {
    const syllables = 1 + Math.floor(next() * 3);
    let word = "";
    for (let s = 0; s < syllables; s++) {
      word += FILLER_SYLLABLES[Math.floor(next() * FILLER_SYLLABLES.length)];
    }
    // Punctuation now and then, so the block has the texture of prose
    // rather than of a list.
    out.push(next() < 0.08 ? `${word},` : next() < 0.05 ? `${word}.` : word);
  }
  return out.join(" ");
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
  // Where to come back to after signing up. The editor keeps the text, so
  // returning here means returning to their own work rather than to a
  // dashboard -- the most avoidable leak in the funnel.
  const here = usePathname();
  const accountState = accountStateOf(plan);

  // The blurred half is filler, generated from a count. See blurFiller.
  const filler = useMemo(
    () => blurFiller(result.withheldWords),
    [result.withheldWords],
  );
  const words = format.number(PLANS.free.limits.wordsPerDay ?? 0);
  const proof = DETECTOR_PROOF.results.length > 0;
  const context = {
    variant: "modal" as const,
    reason: "quota" as const,
    plan,
    tool,
    proof,
  };
  const secondary = () =>
    track(posthog, "wall_dismissed", {
      ...context,
      method: "cta",
      action: "secondary",
    });
  // The label names the monthly price, and /pricing opens on the yearly
  // cycle: without the query the reader lands on a different number than
  // the one they read.
  const seePro = (
    <Link
      href={{ pathname: "/pricing", query: { cycle: "monthly" } }}
      onClick={secondary}
    >
      {t("seePro", { price: formatUSD(PRICES.pro.monthly.amount, locale) })}
    </Link>
  );
  // Outlined in the brand colour, second to the filled trial button.
  const outline =
    "border-brand text-brand hover:bg-brand-softer hover:text-brand w-full border-[1.5px]";

  return (
    <PaywallDialog
      context={context}
      labelledBy="paywall-quota-title"
      fullSheet
      onDismiss={(method) => {
        track(posthog, "wall_dismissed", { ...context, method });
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
        // One list, two orders. On a phone the trial button comes straight
        // after the lead, above the fragment, so it is in reach without
        // scrolling the sheet; from 640 it keeps its place after the
        // benefits and the detector row (F1-05).
        <div className="flex flex-col">
          <Badge variant="warning" className="order-1 self-start">
            {t("quotaBadge", {
              used: format.number(result.usedToday),
              limit: format.number(result.limitToday),
            })}
          </Badge>

          <h2
            id="paywall-quota-title"
            className="order-2 mt-3 mr-10 text-xl leading-[26px] font-semibold tracking-[-0.01em] sm:text-[22px] sm:leading-7"
          >
            {t("quotaTitle")}
          </h2>
          <p className="order-3 mt-2 text-[15px] leading-[22px] text-neutral-600">
            {accountState === "anonymous"
              ? t("quotaLeadAnon", { words })
              : t("quotaLeadUser")}
          </p>

          <Button
            size="lg"
            className="order-4 mt-4 w-full sm:order-9"
            onClick={() => {
              track(posthog, "wall_dismissed", {
                ...context,
                method: "cta",
                action: "primary",
              });
              // Nobody can be billed without an account to bill. A signed-out
              // reader goes through the door first and comes back; the editor
              // still holds their text either way.
              //
              // They come back to the card field with this plan already
              // chosen -- not to the pricing page, and not to a sign-in
              // screen that drops what they pressed. `/checkout` is an
              // internal route name, so it is resolved to the path this
              // language actually serves before it becomes a `next`.
              if (accountState === "anonymous") {
                router.push({
                  pathname: "/signup",
                  query: { next: trialCheckoutPath(locale) },
                });
                return;
              }
              setPaying(true);
            }}
          >
            {t("tryUnlimited", { days: TRIAL.days })}
          </Button>

          <div className="relative order-5 mt-4">
            <div className="bg-muted/40 h-[150px] overflow-y-auto rounded-xl border px-3.5 py-3 text-[15px] leading-[23px] whitespace-pre-wrap sm:h-56 sm:px-[18px] sm:py-4">
              {result.visibleText}{" "}
              <span
                aria-hidden
                className="blur-[4.5px] select-none"
                // The fade is the one place a gradient earns its keep: it
                // says "there is more" without a word of copy. It masks the
                // text itself rather than painting a panel over it, so it
                // works on either theme.
                style={{
                  maskImage:
                    "linear-gradient(to bottom, #000 0%, transparent 85%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, #000 0%, transparent 85%)",
                }}
              >
                {filler}
              </span>
            </div>
            <div className="from-card pointer-events-none absolute inset-x-px bottom-px h-10 rounded-b-xl bg-gradient-to-t" />
          </div>
          <p className="text-muted-foreground order-6 mt-2 text-sm leading-5">
            {t("quotaWithheld", {
              words: format.number(result.withheldWords),
            })}
          </p>

          <ul className="order-7 mt-4 space-y-1.5 text-sm leading-5">
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

          <DetectorProof variant="row" className="order-8" />

          <div className="order-9 mt-2.5 flex flex-col gap-2.5 sm:order-10">
            {accountState === "anonymous" ? (
              <>
                {/* F1-17: the free account is the likeliest exit for
                    somebody who came from an ad, so it is a button; Pro
                    steps back to a link, so three exits do not compete
                    as three buttons. */}
                <Button variant="outline" size="lg" className={outline} asChild>
                  <Link
                    href={{ pathname: "/signup", query: { next: here } }}
                    onClick={secondary}
                  >
                    {t("createAccountShort", { words })}
                  </Link>
                </Button>
                <span className="text-brand flex h-11 items-center justify-center text-[15px] font-semibold [&_a]:hover:underline">
                  {seePro}
                </span>
              </>
            ) : (
              <Button variant="outline" size="lg" className={outline} asChild>
                {seePro}
              </Button>
            )}
          </div>

          <TrialDisclosure className="order-10 mt-4 rounded-[10px] px-3.5 py-3 leading-5 sm:order-11" />
          <p className="text-muted-foreground order-11 mt-3 text-center text-xs leading-[17px] sm:order-12">
            {t("trustLine")}
          </p>
        </div>
      )}
    </PaywallDialog>
  );
}

/**
 * Wall C — the day's runs of a tool metered by uses are spent (F2-01).
 *
 * Every tool can be tried on the free plans now, so this no longer says a
 * tool is locked: it says the runs are used, when they come back, and what
 * removes the limit. It opens from the button, which keeps its verb.
 */
export function UsesPaywall({
  tool,
  plan,
  onDismiss,
}: {
  tool: ToolId;
  plan: PlanId;
  onDismiss: () => void;
}) {
  const t = useTranslations("paywall");
  const locale = useLocale() as Locale;
  const format = useFormatter();
  const posthog = usePostHog();
  const router = useRouter();
  const accountState = accountStateOf(plan);
  const metered = PLANS[plan].limits.uses[tool];
  const context = {
    variant: "modal" as const,
    reason: "uses" as const,
    plan,
    tool,
  };

  return (
    <PaywallDialog
      context={context}
      labelledBy="paywall-uses-title"
      width="27rem"
      onDismiss={(method) => {
        track(posthog, "wall_dismissed", { ...context, method });
        onDismiss();
      }}
    >
      <h2 id="paywall-uses-title" className="mr-10 text-lg font-semibold">
        {t("usesTitle", { uses: metered?.usesPerDay ?? 0 })}
      </h2>
      <p className="text-muted-foreground mt-2 text-sm leading-normal">
        {t("usesBody", {
          uses: metered?.usesPerDay ?? 0,
          words: format.number(metered?.perUse ?? 0),
        })}
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        <Button
          size="lg"
          onClick={() => {
            track(posthog, "wall_dismissed", {
              ...context,
              method: "cta",
              action: "primary",
            });
            // Signed out, the account comes first and the card field after
            // it -- carrying the plan, so the trial they just pressed is
            // still the one waiting on the other side.
            router.push({
              pathname: accountState === "anonymous" ? "/signup" : "/checkout",
              query:
                accountState === "anonymous"
                  ? { next: trialCheckoutPath(locale) }
                  : { plan: "unlimited", cycle: "monthly" },
            });
          }}
        >
          {t("tryUnlimited", { days: TRIAL.days })}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="border-brand text-brand hover:bg-brand-softer hover:text-brand border-[1.5px]"
          asChild
        >
          <Link
            // This wall opens with the trial, which exists on the monthly
            // cycle and nowhere else.
            href={{ pathname: "/pricing", query: { cycle: "monthly" } }}
            onClick={() =>
              track(posthog, "wall_dismissed", {
                ...context,
                method: "cta",
                action: "secondary",
              })
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
/**
 * The popover shell: the lightest wall in the set.
 *
 * Anchored to whatever opened it rather than taking the screen, because
 * these two answer a lock the reader is looking at -- the history they
 * cannot open, the breakdown they cannot see, the tool they cannot run --
 * and making them leave that to read the offer is what turns an offer into
 * an eviction.
 *
 * It counts itself the way every other wall does: shown once when it
 * opens, dismissed with the method that closed it.
 */
function LockPopover({
  context,
  title,
  body,
  actions,
  onClose,
  align = "left",
}: {
  context: PaywallContext;
  title: string;
  body?: string;
  /** The offer. Rendered before the close button. */
  actions: React.ReactNode;
  onClose: (method: DismissMethod) => void;
  align?: "left" | "right";
}) {
  const t = useTranslations("paywall");
  const posthog = usePostHog();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    track(posthog, "wall_shown", context);
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      track(posthog, "wall_dismissed", { ...context, method: "esc" });
      onClose("esc");
    }
    function onClick(event: MouseEvent) {
      if (ref.current?.contains(event.target as Node)) return;
      track(posthog, "wall_dismissed", { ...context, method: "x" });
      onClose("x");
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
    // The context object is rebuilt on every render; its fields are what
    // identify the wall, and they do not change while it is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={title}
      // Anchored to the lock on a wide screen; pinned to the margins on a
      // narrow one, where 19rem of fixed width overflows the viewport.
      className={cn(
        "bg-card absolute z-40 mt-2 w-[19rem] max-w-[calc(100vw-2rem)] rounded-xl border p-4 shadow-lg max-[420px]:fixed max-[420px]:inset-x-4 max-[420px]:w-auto",
        align === "right" ? "right-0" : "left-0",
      )}
    >
      <p className="text-sm font-semibold">{title}</p>
      {body && (
        <p className="text-muted-foreground mt-2 text-sm leading-normal">
          {body}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {actions}
        <Button size="sm" variant="ghost" onClick={() => onClose("x")}>
          {t("close")}
        </Button>
      </div>
    </div>
  );
}

/**
 * Wall D — a locked feature, answered where it sits.
 *
 * No disclosure and no trial: the natural step up from one locked feature
 * is Pro, not the top plan. What changed is where "unlock" goes. It used
 * to be a link to the pricing page, which takes somebody out of the app to
 * read about a plan they had already decided to buy; now the card field
 * opens over the lock, and only a reader with no account to bill is sent
 * through the sign-up door first -- carrying where they were.
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
  const checkout = useTranslations("checkout");
  const detector = useTranslations("detector");
  const posthog = usePostHog();
  const [open, setOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const here = usePathname();
  const accountState = accountStateOf(plan);
  const title =
    feature === "history" ? t("historyLockTitle") : detector("gated");
  const context = {
    variant: "popover" as const,
    reason: "feature" as const,
    plan,
    tool: feature,
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((was) => !was)}
        aria-expanded={open}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-brand/30 rounded text-xs underline underline-offset-2 focus-visible:ring-[3px] focus-visible:outline-none"
      >
        {label}
      </button>

      {open && (
        <LockPopover
          context={context}
          title={title}
          // The history gate has a second line because the privacy nuance
          // matters there: free plans keep the count, not the text. The
          // breakdown says everything it needs in one.
          body={feature === "history" ? t("historyLockBody") : undefined}
          align="right"
          onClose={() => setOpen(false)}
          actions={
            accountState === "anonymous" ? (
              <Button size="sm" asChild>
                <Link
                  href={{ pathname: "/signup", query: { next: here } }}
                  onClick={() =>
                    track(posthog, "wall_dismissed", {
                      ...context,
                      method: "cta",
                      action: "primary",
                    })
                  }
                >
                  {t("unlockWithPro")}
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  track(posthog, "wall_dismissed", {
                    ...context,
                    method: "cta",
                    action: "primary",
                  });
                  setOpen(false);
                  setPaying(true);
                }}
              >
                {t("unlockWithPro")}
              </Button>
            )
          }
        />
      )}

      {/* The card field, over the lock. Leaving the app to buy the thing
          you just asked for is a step nobody needs to take. */}
      {paying && (
        <PaywallDialog
          context={{ ...context, variant: "modal" }}
          labelledBy="feature-lock-title"
          onDismiss={(method) => {
            track(posthog, "wall_dismissed", { ...context, method });
            setPaying(false);
          }}
        >
          <h2 id="feature-lock-title" className="font-semibold">
            {checkout("modalTitle")}
          </h2>
          <CheckoutPanel
            target={{ tier: "pro", interval: "monthly" }}
            onBack={() => setPaying(false)}
          />
        </PaywallDialog>
      )}
    </div>
  );
}
