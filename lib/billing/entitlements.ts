import { eq } from "drizzle-orm";

import { getTool } from "@/lib/ai/tools";
import { PLANS, type Plan, type PlanId } from "@/lib/billing/plans";
import { getDb } from "@/lib/db/client";
import { subscriptions } from "@/lib/db/schema";

// All feature gating goes through this module.

const ACTIVE_STATUSES = new Set(["trialing", "active", "past_due"]);

export async function getPlan(userId: string | null): Promise<Plan> {
  if (!userId) return PLANS.anonymous;

  const db = getDb();
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (
    subscription?.plan === "pro" &&
    subscription.status &&
    ACTIVE_STATUSES.has(subscription.status)
  ) {
    return PLANS.pro;
  }
  return PLANS.free;
}

export interface EntitlementCheck {
  allowed: boolean;
  reason?: "unknown_tool" | "plan_too_low" | "request_too_long";
  plan: PlanId;
}

/**
 * Static checks (plan + per-request word limit). Daily quota checks live in
 * `lib/usage/quotas.ts` (Upstash) and are applied in the API middleware.
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
  if (wordCount > plan.limits.wordsPerRequest) {
    return { allowed: false, reason: "request_too_long", plan: plan.id };
  }
  return { allowed: true, plan: plan.id };
}
