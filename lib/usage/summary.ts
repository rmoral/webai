import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";

import { PRICES, type PaidTier } from "@/lib/billing/plans";
import { getDb } from "@/lib/db/client";
import { quotaDay } from "@/lib/usage/day";
import { events, subscriptions, usageDaily, users } from "@/lib/db/schema";

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

/**
 * Every word Verbalyx has ever processed, and the day it started counting.
 *
 * For the social-proof band on /pricing. Two rules make it safe to show:
 * the figure is rounded down where it is rendered, so it never claims more
 * than happened, and it is not shown at all below a hundred thousand
 * words -- a number smaller than that is an argument against us.
 *
 * `usage_daily` is aggregate, not text: it counts words, never stores any.
 * A failure returns null, because a marketing band is never worth a 500 on
 * the page that sells.
 */
export async function getWordsProcessed(): Promise<{
  words: number;
  since: string;
} | null> {
  const FLOOR = 100_000;
  try {
    const [row] = await getDb()
      .select({
        words: sql<number>`coalesce(sum(${usageDaily.wordsIn}), 0)::bigint`,
        since: sql<string | null>`min(${usageDaily.date})::text`,
      })
      .from(usageDaily);
    const words = Number(row?.words ?? 0);
    if (!row?.since || !Number.isFinite(words) || words < FLOOR) return null;
    return { words, since: row.since };
  } catch {
    return null;
  }
}

/** One line of the campaign table: a source, a campaign and what it sold. */
export interface CampaignRow {
  /** `utm_source`, or null for a visit that carried no campaign at all. */
  source: string | null;
  campaign: string | null;
  purchases: number;
  /** Dollars, summed from the same field the purchase row carries. */
  revenue: number;
  /**
   * How many of those sales carry a Google click id.
   *
   * Lower than `purchases` is normal and not a bug: a customer who refused
   * advertising cookies is counted here as a sale with no click. The gap is
   * the part of the spend Google can only model, so it is worth seeing.
   */
  withClickId: number;
}

/**
 * What each campaign actually sold, from our own rows.
 *
 * Read from `events` rather than from PostHog or from Ads: this is the
 * table the schema keeps for attribution, it is written by the Stripe
 * webhook, and it therefore counts the sales Stripe confirmed rather than
 * the ones a browser stayed open long enough to report.
 *
 * Amounts are what was charged that day, so a trial appears as a sale of
 * zero -- which is what it was -- and the renewal appears later at its
 * price. Reading it any other way would credit a campaign with money that
 * has not moved.
 */
export async function listCampaigns(days = 30): Promise<CampaignRow[]> {
  const since = new Date(Date.now() - days * 86_400_000);
  const source = sql<string | null>`${events.props}->>'utm_source'`;
  const campaign = sql<string | null>`${events.props}->>'utm_campaign'`;

  const rows = await getDb()
    .select({
      source,
      campaign,
      purchases: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum((${events.props}->>'amount')::float8), 0)::float8`,
      // gbraid and wbraid are what Google sends when it cannot set a
      // cookie, and they identify a click just as well, so all three count.
      withClickId: sql<number>`count(coalesce(${events.props}->>'gclid', ${events.props}->>'gbraid', ${events.props}->>'wbraid'))::int`,
    })
    .from(events)
    .where(and(eq(events.name, "purchase"), gte(events.createdAt, since)))
    .groupBy(source, campaign)
    .orderBy(desc(sql`count(*)`));

  return rows.map((row) => ({
    source: row.source,
    campaign: row.campaign,
    purchases: row.purchases,
    revenue: row.revenue,
    withClickId: row.withClickId,
  }));
}
