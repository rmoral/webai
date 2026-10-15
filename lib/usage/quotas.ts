import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import * as Sentry from "@sentry/nextjs";
import { and, eq, gte, sql } from "drizzle-orm";

import type { ToolId } from "@/lib/ai/tools";
import type { Subscriber } from "@/lib/billing/entitlements";
import { getDb } from "@/lib/db/client";
import { subscriptions } from "@/lib/db/schema";
import { quotaDay } from "@/lib/usage/day";

// Quota and anti-abuse layer. Subjects are `user:<id>` or `anonymousSubject(ip)`
// (the hashed network: an IPv6 /64, an IPv4 address).
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

/** What is left, and what it is measured against. */
export interface Allowance {
  used: number;
  /** `null` on an unmetered plan, where a bar would mean nothing. */
  limit: number | null;
  remaining: number | null;
  /** Whether the allowance is a daily one. Monthly otherwise. */
  metered: boolean;
  /** Runs spent today on the tools the plan meters by uses (F2-01). */
  uses?: Partial<Record<ToolId, UsesAllowance>>;
}

export interface QuotaGrant {
  /**
   * Words actually reserved, which is exactly what the model is allowed to
   * see. Zero means the allowance is spent and nothing may be generated.
   *
   * It can be less than what was asked for, and that is the point: with 200
   * words left and 923 pasted, the reader gets the first 200 rewritten and
   * pays for 200. The old all-or-nothing rule answered the same request by
   * generating the whole thing for free and then hiding it behind a wall.
   */
  granted: number;
  /** Words spent against the allowance, after this reservation. */
  used: number | null;
  /**
   * Words the subscriber can still spend: the plan allowance, plus any
   * top-up balance on a paid plan -- which is what "te quedan" has to
   * promise, or the editor cuts a run the top-up would have covered.
   * `null` when the plan is unmetered.
   */
  remaining: number | null;
  /**
   * The allowance the figures above are measured against. `null` when the
   * plan is unmetered. Wall B shows "280 / 500 words today", and deriving
   * the denominator in the UI would mean hardcoding a limit there.
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
  return `quota:words:day:${subject}:${quotaDay()}`;
}

/**
 * Takes what it can from `key` and gives back the rest.
 *
 * The counter is incremented first and the overshoot returned, which is
 * what makes the reservation atomic under concurrent requests: two clients
 * racing for the last 50 words cannot both be told they have them.
 *
 * Only the overshoot is given back, never the whole request, so the
 * counter saturates exactly at the limit. It used to return the full
 * amount on refusal, which is how "600 / 500" ended up on the account
 * page: the counter and the allowance disagreed about what had happened.
 */
async function consume(
  client: Redis,
  key: string,
  limit: number,
  words: number,
  ttlSeconds: number,
): Promise<{ used: number; granted: number }> {
  const used = await client.incrby(key, words);
  if (used === words) await client.expire(key, ttlSeconds);
  if (used <= limit) return { used, granted: words };

  // Never hand back more than this request took: another request may have
  // overshot first, and it corrects its own share.
  const overshoot = Math.min(used - limit, words);
  const after = await client.decrby(key, overshoot);
  return { used: after, granted: words - overshoot };
}

/**
 * Reserves up to `words` against the subscriber's allowance, and answers
 * with how many it actually got.
 *
 * Free tiers spend the daily limit; paid tiers spend the billing-period
 * limit and then any top-up balance. A soft cap (Ilimitado) alerts instead
 * of blocking.
 *
 * `allowPartial` is what separates the two kinds of tool. A rewrite can
 * usefully do the first 200 words of a 923-word paste -- that is a real
 * result the reader keeps, paid for with the words they had. A detector
 * cannot: a score measured over part of a text is a wrong score about the
 * whole one, so it asks for all or nothing.
 */
export async function reserveWords(
  subject: string,
  subscriber: Subscriber,
  words: number,
  allowPartial = true,
): Promise<QuotaGrant> {
  const grant = await reserve(subject, subscriber, words);
  if (allowPartial || grant.granted === 0 || grant.granted === words) {
    return grant;
  }
  // All or nothing, and nothing: give the partial reservation back rather
  // than charging for a result that will not be produced.
  await release(subject, subscriber, grant.granted);
  return {
    ...grant,
    granted: 0,
    used: Math.max(0, (grant.used ?? 0) - grant.granted),
    remaining:
      grant.remaining === null ? null : grant.remaining + grant.granted,
  };
}

async function reserve(
  subject: string,
  subscriber: Subscriber,
  words: number,
): Promise<QuotaGrant> {
  const { limits } = subscriber.plan;
  const client = getRedis();

  if (limits.wordsPerDay !== null) {
    // Dev without Redis: limits are off, so everything is granted.
    if (!client)
      return {
        granted: words,
        used: 0,
        remaining: limits.wordsPerDay,
        limit: limits.wordsPerDay,
      };
    const { used, granted } = await consume(
      client,
      dailyKey(subject),
      limits.wordsPerDay,
      words,
      25 * 60 * 60,
    );
    return {
      granted,
      used,
      remaining: Math.max(0, limits.wordsPerDay - used),
      limit: limits.wordsPerDay,
    };
  }

  if (limits.wordsPerMonth === null)
    return { granted: words, used: null, remaining: null, limit: null };
  if (!client)
    return {
      granted: words,
      used: 0,
      remaining: limits.wordsPerMonth + subscriber.topupWords,
      limit: limits.wordsPerMonth,
    };

  const limit = limits.wordsPerMonth;
  const { used, granted } = await consume(
    client,
    monthlyKey(subject, subscriber.periodStart),
    limit,
    words,
    40 * 24 * 60 * 60,
  );
  const remaining = Math.max(0, limit - used) + subscriber.topupWords;
  if (granted === words) return { granted, used, remaining, limit };

  // Ilimitado is sold as unlimited: warn the owner, keep serving.
  if (limits.softCap) {
    Sentry.captureMessage("quota.soft_cap_exceeded", {
      level: "warning",
      extra: { subject, words, limit },
    });
    return { granted: words, used, remaining: 0, limit };
  }

  // Purchased words cover what the plan could not. They are all-or-nothing
  // on the shortfall: a balance that cannot cover it is left untouched
  // rather than half spent.
  const shortfall = words - granted;
  if (await consumeTopupWords(subject, shortfall)) {
    return {
      granted: words,
      used,
      remaining: remaining - shortfall,
      limit,
      fromTopup: shortfall,
    };
  }

  return { granted, used, remaining, limit };
}

/** Runs of a tool metered by uses, out of how many a day. */
export interface UsesAllowance {
  used: number;
  limit: number;
}

/**
 * Per tool and per day, and apart from the word allowance: a paraphrase
 * spends one of its two runs, never words the humanizer could use. The day
 * is the quota day the word allowance rolls over on, so the two refill at
 * the same moment and "se recargan en 8 h" is true of both.
 */
function usesKey(tool: ToolId, subject: string): string {
  return `uses:${tool}:${subject}:${quotaDay()}`;
}

/**
 * Takes one run, before the model is called. `granted: false` means the
 * day's runs are spent and nothing may be generated.
 */
export async function reserveUse(
  subject: string,
  tool: ToolId,
  limit: number,
): Promise<UsesAllowance & { granted: boolean }> {
  const client = getRedis();
  // Dev without Redis: limits are off, as for words.
  if (!client) return { granted: true, used: 0, limit };
  const { used, granted } = await consume(
    client,
    usesKey(tool, subject),
    limit,
    1,
    25 * 60 * 60,
  );
  return { granted: granted === 1, used, limit };
}

/** The runs left today, without spending one. Fails soft, like peekWords. */
export async function peekUses(
  subject: string,
  tool: ToolId,
  limit: number,
): Promise<UsesAllowance> {
  try {
    const client = getRedis();
    if (!client) return { used: 0, limit };
    const used = Number(
      (await client.get<number>(usesKey(tool, subject))) ?? 0,
    );
    return { used: Math.min(limit, used), limit };
  } catch (error) {
    Sentry.captureException(error);
    return { used: 0, limit };
  }
}

/** Gives words back to the allowance they were taken from. */
async function release(
  subject: string,
  subscriber: Subscriber,
  words: number,
): Promise<void> {
  const client = getRedis();
  if (!client || words <= 0) return;
  const { limits } = subscriber.plan;
  const key =
    limits.wordsPerDay !== null
      ? dailyKey(subject)
      : monthlyKey(subject, subscriber.periodStart);
  await client.decrby(key, words);
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
 * The allowance as every surface reads it: the header bar, the editor, the
 * wall and the account page.
 *
 * One read model, because there were three. The header counted from a
 * server render that never refreshed, the wall counted from the last
 * response, and the account page summed usage_daily in Postgres -- which
 * is a different number entirely, since it counts words processed rather
 * than allowance spent. The three disagreed in public: "0 / 500" in the
 * header until a reload, "300 / 500 agotado" in the wall and "Hoy: 600"
 * in the account, all at the same moment.
 *
 * Never consumes. Unlike the reserving path this fails soft: a missing
 * Redis must degrade to "no bar", not to a blank page.
 */
export async function peekWords(
  subject: string,
  subscriber: Subscriber,
): Promise<Allowance> {
  const { limits } = subscriber.plan;
  const limit = limits.wordsPerDay ?? limits.wordsPerMonth;
  const metered = limits.wordsPerDay !== null;
  if (limit === null) {
    return { used: 0, limit: null, remaining: null, metered };
  }
  // Purchased words count as left on a paid plan (see QuotaGrant.remaining);
  // `used` and `limit` stay the plan's, which is what the bar draws.
  const topup = metered ? 0 : subscriber.topupWords;
  try {
    const client = getRedis();
    if (!client) return { used: 0, limit, remaining: limit + topup, metered };
    const key = metered
      ? dailyKey(subject)
      : monthlyKey(subject, subscriber.periodStart);
    const used = Math.min(limit, Number((await client.get<number>(key)) ?? 0));
    return {
      used,
      limit,
      remaining: Math.max(0, limit - used) + topup,
      metered,
    };
  } catch (error) {
    Sentry.captureException(error);
    return { used: 0, limit, remaining: limit + topup, metered };
  }
}
