import type { BillingInterval, PaidTier, PlanId } from "@/lib/billing/plans";

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
  payment_succeeded: { plan: PaidTier; cycle: BillingInterval; trial: boolean };

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
}
