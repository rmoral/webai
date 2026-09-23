import { beforeEach, describe, expect, it, vi } from "vitest";

// An in-memory stand-in for Upstash. The operations under test are
// INCRBY/DECRBY against one key, which is the whole mechanism: the
// reservation is atomic because the counter moves first and the overshoot
// is handed back afterwards.
const store = new Map<string, number>();

vi.mock("@upstash/redis", () => ({
  Redis: class {
    async incrby(key: string, by: number) {
      const next = (store.get(key) ?? 0) + by;
      store.set(key, next);
      return next;
    }
    async decrby(key: string, by: number) {
      const next = (store.get(key) ?? 0) - by;
      store.set(key, next);
      return next;
    }
    async expire() {
      return 1;
    }
    async get(key: string) {
      return store.get(key) ?? null;
    }
  },
}));

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow() {
      return {};
    }
    async limit() {
      return { success: true, reset: 0 };
    }
  },
}));

process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "token";

const { peekWords, reserveWords } = await import("@/lib/usage/quotas");
const { PLANS } = await import("@/lib/billing/plans");

const free = {
  plan: PLANS.free,
  topupWords: 0,
  periodStart: null,
  periodEnd: null,
  interval: null,
  subscriptionId: null,
  trialEnd: null,
};

const DAY = PLANS.free.limits.wordsPerDay ?? 0;

beforeEach(() => store.clear());

describe("reserveWords", () => {
  it("grants what the allowance covers and no more", async () => {
    const first = await reserveWords("user:a", free, DAY - 200);
    expect(first.granted).toBe(DAY - 200);
    expect(first.remaining).toBe(200);

    // 923 asked for with 200 left: 200 granted, and that is what the
    // reader is charged. The old rule refused the request outright and
    // then generated all 923 words for free anyway.
    const second = await reserveWords("user:a", free, 923);
    expect(second.granted).toBe(200);
    expect(second.remaining).toBe(0);
    expect(second.used).toBe(DAY);
  });

  it("never lets the counter pass the limit", async () => {
    // "Hoy: 600" against a limit of 500 was on the account page, because a
    // refused request used to leave its words counted.
    await reserveWords("user:b", free, DAY);
    await reserveWords("user:b", free, 400);
    const peeked = await peekWords("user:b", free);
    expect(peeked.used).toBe(DAY);
    expect(peeked.used).toBeLessThanOrEqual(peeked.limit ?? 0);
  });

  it("grants nothing once the allowance is spent", async () => {
    await reserveWords("user:c", free, DAY);
    const spent = await reserveWords("user:c", free, 50);
    expect(spent.granted).toBe(0);
    expect(spent.remaining).toBe(0);
    // Nothing may be generated, and nothing was charged.
    expect(spent.used).toBe(DAY);
  });

  it("gives a partial reservation back when the caller cannot use it", async () => {
    // The detector measures a text: a score over the first 200 words of a
    // 900-word text is a wrong answer about that text, not half of one. So
    // it asks for all or nothing, and the words it did not use stay.
    await reserveWords("user:d", free, DAY - 100);
    const denied = await reserveWords("user:d", free, 300, false);
    expect(denied.granted).toBe(0);

    const peeked = await peekWords("user:d", free);
    expect(peeked.used).toBe(DAY - 100);

    // And the 100 are still there for a tool that can use them.
    const partial = await reserveWords("user:d", free, 300);
    expect(partial.granted).toBe(100);
  });

  it("does not let two racing requests spend the same words twice", async () => {
    await reserveWords("user:e", free, DAY - 60);
    const [one, two] = await Promise.all([
      reserveWords("user:e", free, 60),
      reserveWords("user:e", free, 60),
    ]);
    expect(one.granted + two.granted).toBe(60);
    expect((await peekWords("user:e", free)).used).toBe(DAY);
  });

  it("meters a paid plan against its period, not the day", async () => {
    const pro = {
      ...free,
      plan: PLANS.pro,
      periodStart: new Date("2026-09-01"),
    };
    const month = PLANS.pro.limits.wordsPerMonth ?? 0;
    const grant = await reserveWords("user:f", pro, 1_000);
    expect(grant.granted).toBe(1_000);
    expect(grant.limit).toBe(month);
    expect(grant.remaining).toBe(month - 1_000);
  });

  it("keeps serving the plan sold as unlimited, and says so", async () => {
    const unlimited = {
      ...free,
      plan: PLANS.unlimited,
      periodStart: new Date("2026-09-01"),
    };
    const cap = PLANS.unlimited.limits.wordsPerMonth ?? 0;
    await reserveWords("user:g", unlimited, cap);
    const over = await reserveWords("user:g", unlimited, 500);
    // A soft cap alerts instead of blocking: the plan is sold as unlimited.
    expect(over.granted).toBe(500);
  });
});
