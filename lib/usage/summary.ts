import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";

import { PRICES, type PaidTier } from "@/lib/billing/plans";
import { getDb } from "@/lib/db/client";
import { quotaDay } from "@/lib/usage/day";
import { subscriptions, usageDaily, users } from "@/lib/db/schema";

// Read models for the account area and the admin backoffice.

const ACTIVE_STATUSES = ["trialing", "active", "past_due"] as const;

function today(): string {
  return quotaDay();
}

function monthStart(): string {
  return `${quotaDay().slice(0, 8)}01`;
}

export interface UserUsage {
  wordsToday: number;
  wordsMonth: number;
  requestsMonth: number;
}

export async function getUserUsage(userId: string): Promise<UserUsage> {
  const [row] = await getDb()
    .select({
      wordsToday: sql<number>`coalesce(sum(case when ${usageDaily.date} = ${today()} then ${usageDaily.wordsIn} else 0 end), 0)::int`,
      wordsMonth: sql<number>`coalesce(sum(${usageDaily.wordsIn}), 0)::int`,
      requestsMonth: sql<number>`coalesce(sum(${usageDaily.requests}), 0)::int`,
    })
    .from(usageDaily)
    .where(
      and(eq(usageDaily.userId, userId), gte(usageDaily.date, monthStart())),
    );
  return row ?? { wordsToday: 0, wordsMonth: 0, requestsMonth: 0 };
}

export interface AdminUserRow {
  id: string;
  email: string;
  createdAt: Date;
  plan: "free" | "pro" | "unlimited" | null;
  status: string | null;
  interval: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  wordsMonth: number;
  costCentsMonth: number;
}

export async function listUsers(limit = 200): Promise<AdminUserRow[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
      plan: subscriptions.plan,
      status: subscriptions.status,
      interval: subscriptions.interval,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
    })
    .from(users)
    .leftJoin(subscriptions, eq(subscriptions.userId, users.id))
    .orderBy(desc(users.createdAt))
    .limit(limit);

  // One grouped query instead of a per-user lookup.
  const usage = await db
    .select({
      userId: usageDaily.userId,
      words: sql<number>`coalesce(sum(${usageDaily.wordsIn}), 0)::int`,
      cost: sql<number>`coalesce(sum(${usageDaily.costCents}), 0)::float8`,
    })
    .from(usageDaily)
    .where(gte(usageDaily.date, monthStart()))
    .groupBy(usageDaily.userId);

  const byUser = new Map(usage.map((row) => [row.userId, row]));

  return rows.map((row) => ({
    ...row,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd === 1,
    wordsMonth: byUser.get(row.id)?.words ?? 0,
    costCentsMonth: byUser.get(row.id)?.cost ?? 0,
  }));
}

export interface AdminTotals {
  users: number;
  pro: number;
  trialing: number;
  /** Monthly recurring revenue in euros. */
  mrr: number;
  aiCostMonth: number;
}

export async function getAdminTotals(): Promise<AdminTotals> {
  const db = getDb();

  const [[userCount], byInterval, [cost]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(users),
    db
      .select({
        plan: subscriptions.plan,
        interval: subscriptions.interval,
        status: subscriptions.status,
        count: sql<number>`count(*)::int`,
      })
      .from(subscriptions)
      .where(
        and(
          inArray(subscriptions.plan, ["pro", "unlimited"]),
          inArray(subscriptions.status, [...ACTIVE_STATUSES]),
        ),
      )
      .groupBy(
        subscriptions.plan,
        subscriptions.interval,
        subscriptions.status,
      ),
    db
      .select({
        cents: sql<number>`coalesce(sum(${usageDaily.costCents}), 0)::float8`,
      })
      .from(usageDaily)
      .where(gte(usageDaily.date, monthStart())),
  ]);

  // Prices come from lib/billing/plans.ts — never hardcoded here.
  const monthlyValue = (plan: string | null, interval: string | null) => {
    const tier = (plan === "unlimited" ? "unlimited" : "pro") as PaidTier;
    return PRICES[tier][interval === "year" ? "yearly" : "monthly"]
      .monthlyEquivalent;
  };

  return {
    users: userCount?.count ?? 0,
    pro: byInterval.reduce((total, row) => total + row.count, 0),
    trialing: byInterval
      .filter((row) => row.status === "trialing")
      .reduce((total, row) => total + row.count, 0),
    mrr: byInterval.reduce(
      (total, row) => total + row.count * monthlyValue(row.plan, row.interval),
      0,
    ),
    aiCostMonth: (cost?.cents ?? 0) / 100,
  };
}
