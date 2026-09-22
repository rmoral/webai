import { eq } from "drizzle-orm";

import { getTool, type ToolId } from "@/lib/ai/tools";
import {
  PLANS,
  type Plan,
  type PlanId,
  type PlanLimits,
} from "@/lib/billing/plans";
import { getDb } from "@/lib/db/client";
import { subscriptions } from "@/lib/db/schema";

// All feature gating goes through this module.

/** Statuses that keep paid access. Shared with the Stripe webhook. */
export const ACTIVE_STATUSES = ["trialing", "active", "past_due"] as const;

export interface Subscriber {
  plan: Plan;
  /** Words bought through top-ups that have not been consumed yet. */
  topupWords: number;
  /** Start of the current billing period; anchors the monthly quota. */
  periodStart: Date | null;
  /** End of the current period: when the next charge falls, absent a trial. */
  periodEnd: Date | null;
  /** The cycle being billed, as Stripe reports it. */
  interval: "month" | "year" | null;
  subscriptionId: string | null;
  /**
   * End of the free trial, or null when there is no trial running. Read by
   * the end-of-trial wall, which has to appear before the charge; mirrored
   * from Stripe by the webhook so no page has to call the API to know.
   */
  trialEnd: Date | null;
}

const FREE_SUBSCRIBER: Subscriber = {
  plan: PLANS.free,
  topupWords: 0,
  periodStart: null,
  periodEnd: null,
  interval: null,
  subscriptionId: null,
  trialEnd: null,
};

/**
 * Builds a Plan from the entitlements snapshot the webhook stored, falling
 * back to the shipped defaults for anything missing. Never calls Stripe.
 */
function planFromRow(tier: PlanId, snapshot: unknown): Plan {
  const defaults = PLANS[tier];
  if (!snapshot || typeof snapshot !== "object") return defaults;
  return {
    ...defaults,
    limits: { ...defaults.limits, ...(snapshot as Partial<PlanLimits>) },
  };
}

export async function getSubscriber(
  userId: string | null,
): Promise<Subscriber> {
  if (!userId) {
    return { ...FREE_SUBSCRIBER, plan: PLANS.anonymous };
  }

  const [row] = await getDb()
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (!row) return FREE_SUBSCRIBER;

  // A chargeback drops the account to free until an operator clears it,
  // whatever Stripe says afterwards.
  const active =
    !row.suspendedAt &&
    row.plan !== "free" &&
    row.status !== null &&
    (ACTIVE_STATUSES as readonly string[]).includes(row.status);

  return {
    plan: active ? planFromRow(row.plan, row.entitlements) : PLANS.free,
    topupWords: active ? row.topupWords : 0,
    periodStart: row.currentPeriodStart,
    periodEnd: row.currentPeriodEnd,
    interval:
      row.interval === "year"
        ? "year"
        : row.interval === "month"
          ? "month"
          : null,
    subscriptionId: row.stripeSubscriptionId,
    // Only while the trial is actually running: a stale date on an active
    // subscription would put the end-of-trial wall in front of somebody
    // who already resolved it.
    trialEnd: row.status === "trialing" ? row.trialEnd : null,
  };
}

/** Convenience wrapper for callers that only need the plan. */
export async function getPlan(userId: string | null): Promise<Plan> {
  return (await getSubscriber(userId)).plan;
}

export type EntitlementReason =
  "unknown_tool" | "tool_not_in_plan" | "request_too_long";

export interface EntitlementCheck {
  allowed: boolean;
  reason?: EntitlementReason;
  plan: PlanId;
}

/**
 * Static checks: tool availability and per-request size. Word quotas live
 * in `lib/usage/quotas.ts` and are applied after this.
 */
export function checkEntitlement(
  plan: Plan,
  toolId: string,
  wordCount: number,
): EntitlementCheck {
  const tool = getTool(toolId);
  if (!tool) {
    return { allowed: false, reason: "unknown_tool", plan: plan.id };
  }
  if (!plan.limits.tools.includes(tool.id as ToolId)) {
    return { allowed: false, reason: "tool_not_in_plan", plan: plan.id };
  }
  if (wordCount > plan.limits.maxWordsPerRequest) {
    return { allowed: false, reason: "request_too_long", plan: plan.id };
  }
  return { allowed: true, plan: plan.id };
}
