import {
  CURRENCY,
  type BillingInterval,
  type PaidTier,
  type PlanId,
} from "@/lib/billing/plans";

// The funnel, as one list.
//
// Every surface between the first paste and the first charge emits from
// here, so that "where do people fall out" has one answer instead of five
// spellings of the same moment. The names used to be invented at each call
// site -- `tool_used`, `quota_hit`, `paywall_shown` -- which is why nothing
// could be joined into a ratio.
//
// Two rules hold for every property in this file:
//
//   Nothing a user wrote and nothing that identifies them. No text, no
//   email, no IP. Counts, durations and enumerations only -- CLAUDE.md
//   forbids the rest, and an analytics payload is the easiest place to
//   break that rule by accident. tests/analytics.test.ts holds the line.
//
//   `purchase` is the one event a browser must never send. It is emitted
//   server-side from the Stripe webhook (lib/analytics/server.ts), because
//   money moving is a fact about Stripe, not about a page that happened to
//   stay open.

/** Which shape the wall took, which is what A/B decisions are made on. */
export type WallVariant = "modal" | "inline" | "popover";

/** Why the wall appeared. Mirrors the paywall triggers. */
export type WallReason =
  | "quota"
  | "paid_tool"
  | "overflow"
  | "feature"
  | "trial_end"
  /** The only one that answers a result rather than a refusal. */
  | "invite";

export type SignupMethod = "google" | "magic_link";

/** How a wall was closed. `cta` means they took the offer. */
export type DismissMethod = "esc" | "x" | "cta";

/** Common to every wall event, so the funnel can be sliced the same way. */
interface WallProps {
  variant: WallVariant;
  reason: WallReason;
  plan: PlanId;
  /** Tool or feature the wall was about. Absent when it was neither. */
  tool?: string;
}

export interface FunnelEvents {
  /** A request left the editor. `quota_left` is null when unmetered. */
  tool_run: {
    tool: string;
    logged_in: boolean;
    words_in: number;
    quota_left: number | null;
  };
  /** The result landed. `ms` is measured from the click, not the response. */
  tool_result: { tool: string; ms: number; truncated: boolean };
  /** Turnstile refused. `retry_ok` says whether the silent retry saved it. */
  antibot_error: { tool: string; retry_ok: boolean };

  wall_shown: WallProps;
  wall_dismissed: WallProps & {
    method: DismissMethod;
    /** Which button, when the method was `cta`. */
    action?: "primary" | "secondary";
  };

  signup_start: { method: SignupMethod; next: string };
  signup_done: { method: SignupMethod; next: string };
  signin_start: { method: SignupMethod; next: string };

  pricing_view: {
    cycle: BillingInterval;
    logged_in: boolean;
    /** Where the reader came from, when the link said so. */
    from?: "header";
  };
  /** The embedded checkout page opened. */
  checkout_view: { plan: PaidTier; cycle: BillingInterval; logged_in: boolean };
  /** The hosted Stripe session for a top-up was requested. */
  checkout_start: { plan: PaidTier | "topup"; cycle: BillingInterval };

  payment_submitted: { plan: PaidTier; cycle: BillingInterval };
  payment_succeeded: {
    plan: PaidTier;
    cycle: BillingInterval;
    trial: boolean;
    /**
     * What was actually taken today, in dollars, and 0 on a trial.
     *
     * It is here for Google Ads to bid on, not for accounting: a figure a
     * browser sends is a figure a browser can be made to send. Stripe
     * remains the only source of what was charged, and `purchase` -- the
     * webhook's event -- remains the only revenue number.
     */
    value: number;
  };

  /**
   * Money moved, or a trial that will charge was opened. Webhook only.
   * `amount` is in dollars, and is 0 for a trial.
   */
  purchase: {
    plan: PaidTier | "topup";
    cycle: BillingInterval | null;
    amount: number;
    trial: boolean;
  };

  cancel_start: { plan: PlanId | "unknown" };
  cancel_done: { plan: PlanId | "unknown" };
  /** Stepped down instead of leaving. Not a cancellation. */
  plan_downgraded: { plan: PlanId };
}

export type FunnelEvent = keyof FunnelEvents;

/** What `usePostHog()` gives us, minus everything this module never calls. */
interface Capturer {
  capture(event: string, properties?: Record<string, unknown>): unknown;
}

/**
 * Emits a funnel event from the browser.
 *
 * Takes the client rather than reaching for a singleton: PostHog is not
 * initialised when the key is missing, and a call site that cannot tell
 * the difference ends up with `posthog?.capture` scattered through it --
 * which is how three of these events came to be spelled two ways.
 */
export function track<K extends FunnelEvent>(
  client: Capturer | null | undefined,
  event: K,
  props: FunnelEvents[K],
): void {
  // The cast is the price of typing each event's properties precisely:
  // an interface has no index signature, so it never satisfies the SDK's
  // open-ended bag. Everything above this line is checked.
  client?.capture(event, props as Record<string, unknown>);
  toGoogle(event, props);
}

/**
 * The events Google Analytics is sent, and no others.
 *
 * A list rather than "everything", for two reasons. GA4 is here to measure
 * advertising, and a property carrying every run of every tool measures
 * the product badly and the advertising no better -- that is what PostHog
 * is for. And a declared list is a boundary: a future event cannot reach
 * Google by being added to the taxonomy, only by being named here.
 *
 * `purchase` is deliberately absent. It is emitted by the Stripe webhook,
 * where there is no browser and so no `client_id` to attach it to; putting
 * it in GA4 would mean the Measurement Protocol. `payment_succeeded` fires
 * in the browser at the same moment, which is the one Ads can attribute.
 */
export const GOOGLE_EVENTS = [
  "signup_start",
  "signup_done",
  "pricing_view",
  "checkout_view",
  "checkout_start",
  "payment_succeeded",
] as const satisfies readonly FunnelEvent[];

export type GoogleEvent = (typeof GOOGLE_EVENTS)[number];

function toGoogle<K extends FunnelEvent>(
  event: K,
  props: FunnelEvents[K],
): void {
  // Absent on the server, and absent in a browser where the tag never
  // loaded -- no measurement id, or a visitor Consent Mode is holding.
  // The tag itself decides what it may store; this only hands it the
  // event.
  if (typeof window === "undefined") return;
  if (!(GOOGLE_EVENTS as readonly string[]).includes(event)) return;

  const payload: Record<string, unknown> = { ...props };
  // Ads will not bid on a value with no currency beside it.
  if (typeof payload.value === "number") payload.currency = CURRENCY;
  window.gtag?.("event", event, payload);
}
