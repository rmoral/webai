import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import * as Sentry from "@sentry/nextjs";
import { and, eq, gte, sql } from "drizzle-orm";

import type { Subscriber } from "@/lib/billing/entitlements";
import type { Plan } from "@/lib/billing/plans";
import { getDb } from "@/lib/db/client";
import { subscriptions } from "@/lib/db/schema";

// Quota and anti-abuse layer. Subjects are `user:<id>` or `ip:<hashIp(ip)>`.
// Fails closed in production if Redis is not configured; in dev without
// Redis, limits are disabled so the app still runs.
//
// Free tiers are metered per day. Paid tiers are metered per billing
// period: the Redis key embeds the period start, so a new period yields a
// new key and the quota resets on its own — `invoice.paid` only has to
// refresh the stored dates. Top-up words live in Postgres because they
// never expire.

let redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Upstash Redis is not configured");
    }
    redis = null;
    return redis;
  }
  redis = new Redis({ url, token });
  return redis;
}

let burstLimiter: Ratelimit | undefined;

/** Per-subject burst limit (requests/minute), independent of plan quotas. */
export async function checkBurstLimit(
  subject: string,
): Promise<{ allowed: boolean; retryAt?: number }> {
  const client = getRedis();
  if (!client) return { allowed: true };
  burstLimiter ??= new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    prefix: "rl:burst",
  });
  const { success, reset } = await burstLimiter.limit(subject);
  return { allowed: success, retryAt: reset };
}

export interface QuotaResult {
  allowed: boolean;
  /** Words left in the plan allowance. `null` when the plan is unmetered. */
  remaining: number | null;
  /**
   * The allowance the two figures above are measured against. `null` when
   * the plan is unmetered. Wall B shows "280 / 500 words today", and
   * deriving the denominator in the UI would mean hardcoding a limit there.
   */
  limit: number | null;
  /** Words taken from the top-up balance, if any. */
  fromTopup?: number;
}

/** Keys the monthly quota to the billing period, so renewal resets it. */
function monthlyKey(subject: string, periodStart: Date | null): string {
  const anchor = (periodStart ?? new Date()).toISOString().slice(0, 10);
  return `quota:words:period:${subject}:${anchor}`;
}

function dailyKey(subject: string): string {
  return `quota:words:day:${subject}:${new Date().toISOString().slice(0, 10)}`;
}

async function consume(
  client: Redis,
  key: string,
  limit: number,
  words: number,
  ttlSeconds: number,
): Promise<{ used: number; allowed: boolean }> {
  const used = await client.incrby(key, words);
  if (used === words) await client.expire(key, ttlSeconds);
  if (used > limit) {
    await client.decrby(key, words);
    return { used: used - words, allowed: false };
  }
  return { used, allowed: true };
}

/**
 * Reserves `words` against the subscriber's allowance. Free tiers spend the
 * daily limit; paid tiers spend the billing-period limit and then any
 * top-up balance. A soft cap (Ilimitado) alerts instead of blocking.
 */
export async function consumeWords(
  subject: string,
  subscriber: Subscriber,
  words: number,
): Promise<QuotaResult> {
  const { limits } = subscriber.plan;
  const client = getRedis();

  if (limits.wordsPerDay !== null) {
    if (!client)
      return {
        allowed: true,
        remaining: limits.wordsPerDay,
        limit: limits.wordsPerDay,
      };
    const { used, allowed } = await consume(
      client,
      dailyKey(subject),
      limits.wordsPerDay,
      words,
      25 * 60 * 60,
    );
    return {
      allowed,
      remaining: Math.max(0, limits.wordsPerDay - used),
      limit: limits.wordsPerDay,
    };
  }

  if (limits.wordsPerMonth === null)
    return { allowed: true, remaining: null, limit: null };
  if (!client)
    return {
      allowed: true,
      remaining: limits.wordsPerMonth,
      limit: limits.wordsPerMonth,
    };

  const { used, allowed } = await consume(
    client,
    monthlyKey(subject, subscriber.periodStart),
    limits.wordsPerMonth,
    words,
    40 * 24 * 60 * 60,
  );
  const remaining = Math.max(0, limits.wordsPerMonth - used);

  const limit = limits.wordsPerMonth;
  if (allowed) return { allowed: true, remaining, limit };

  // Ilimitado is sold as unlimited: warn the owner, keep serving.
  if (limits.softCap) {
    Sentry.captureMessage("quota.soft_cap_exceeded", {
      level: "warning",
      extra: { subject, words, limit: limits.wordsPerMonth },
    });
    return { allowed: true, remaining: 0, limit };
  }

  const fromTopup = await consumeTopupWords(subject, words);
  if (fromTopup)
    return { allowed: true, remaining: 0, limit, fromTopup: words };

  return { allowed: false, remaining, limit };
}

/**
 * Claims the one over-quota preview a subject gets per day.
 *
 * Wall B works by showing people the result they cannot read yet, which
 * means the model runs for a request the allowance already refused. Without
 * a cap that turns the daily limit into a suggestion: spend it, then keep
 * asking and keep being served. The claim is atomic (`SET NX`), so a
 * client that fires ten requests at once still gets one generation.
 *
 * Returns false when the preview is already spent, and the caller falls
 * back to the plain refusal.
 */
export async function claimOverQuotaPreview(subject: string): Promise<boolean> {
  const client = getRedis();
  // Dev without Redis: quotas are off there, so this is never reached with
  // a refusal behind it.
  if (!client) return true;
  const day = new Date().toISOString().slice(0, 10);
  const claimed = await client.set(`paywall:preview:${subject}:${day}`, 1, {
    nx: true,
    ex: 25 * 60 * 60,
  });
  return claimed === "OK";
}

/**
 * Spends purchased words. Conditional update: the row is only touched when
 * the balance still covers the request, so concurrent requests cannot take
 * the balance negative.
 */
async function consumeTopupWords(
  subject: string,
  words: number,
): Promise<boolean> {
  const userId = subject.startsWith("user:") ? subject.slice(5) : null;
  if (!userId || !process.env.DATABASE_URL) return false;

  try {
    const updated = await getDb()
      .update(subscriptions)
      .set({ topupWords: sql`${subscriptions.topupWords} - ${words}` })
      .where(
        and(
          eq(subscriptions.userId, userId),
          gte(subscriptions.topupWords, words),
        ),
      )
      .returning({ left: subscriptions.topupWords });
    return updated.length > 0;
  } catch (error) {
    Sentry.captureException(error);
    return false;
  }
}

/** Adds purchased words to the balance. Called from the Stripe webhook. */
export async function addTopupWords(
  userId: string,
  words: number,
): Promise<void> {
  await getDb()
    .update(subscriptions)
    .set({ topupWords: sql`${subscriptions.topupWords} + ${words}` })
    .where(eq(subscriptions.userId, userId));
}

/**
 * Read-only view of the allowance, for rendering the quota bar. Never
 * consumes. Unlike the consuming path this fails soft: a missing Redis must
 * degrade to "no bar", not to a blank page.
 */
export async function peekWords(
  subject: string,
  subscriber: Subscriber,
): Promise<{ used: number; limit: number | null }> {
  const { limits } = subscriber.plan;
  const limit = limits.wordsPerDay ?? limits.wordsPerMonth;
  if (limit === null) return { used: 0, limit: null };
  try {
    const client = getRedis();
    if (!client) return { used: 0, limit };
    const key =
      limits.wordsPerDay !== null
        ? dailyKey(subject)
        : monthlyKey(subject, subscriber.periodStart);
    return { used: Number((await client.get<number>(key)) ?? 0), limit };
  } catch (error) {
    Sentry.captureException(error);
    return { used: 0, limit };
  }
}

/** Kept for callers that only know the plan (anonymous requests). */
export async function consumeDailyWords(
  subject: string,
  plan: Plan,
  words: number,
): Promise<QuotaResult> {
  return consumeWords(
    subject,
    { plan, topupWords: 0, periodStart: null, subscriptionId: null },
    words,
  );
}
