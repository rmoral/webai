import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import type { Plan } from "@/lib/billing/plans";

// Quota and anti-abuse layer (Upstash Redis). Subjects are `user:<id>` or
// `ip:<hashIp(ip)>`. Fails closed in production if Redis is not configured;
// in dev without Redis, limits are disabled so the app still runs.

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

/**
 * Atomically reserves `words` against the plan's daily quota (UTC day).
 * Rolls back the reservation when over the limit.
 */
export async function consumeDailyWords(
  subject: string,
  plan: Plan,
  words: number,
): Promise<{ allowed: boolean; remaining: number | null }> {
  const limit = plan.limits.wordsPerDay;
  if (limit === null) return { allowed: true, remaining: null };

  const client = getRedis();
  if (!client) return { allowed: true, remaining: limit };

  const key = `quota:words:${subject}:${new Date().toISOString().slice(0, 10)}`;
  const used = await client.incrby(key, words);
  if (used === words) await client.expire(key, 25 * 60 * 60);

  if (used > limit) {
    await client.decrby(key, words);
    return { allowed: false, remaining: Math.max(0, limit - (used - words)) };
  }
  return { allowed: true, remaining: limit - used };
}
