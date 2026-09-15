import { describe, expect, it } from "vitest";

import { checkEntitlement } from "@/lib/billing/entitlements";
import { resolveEntitlements } from "@/lib/billing/metadata";
import { PLANS, PRICES, TOPUP, TRIAL, yearlySaving } from "@/lib/billing/plans";
import { trialDisclosure } from "@/lib/billing/disclosure";

describe("plan catalogue", () => {
  it("matches the prices of the pricing study", () => {
    expect(PRICES.pro.monthly.amount).toBe(14.99);
    expect(PRICES.pro.yearly.amount).toBe(89.88);
    expect(PRICES.unlimited.monthly.amount).toBe(29.99);
    expect(PRICES.unlimited.yearly.amount).toBe(179.88);
    expect(TOPUP.amount).toBe(9.99);
    expect(TOPUP.words).toBe(25_000);
  });

  it("discounts the yearly plans by about half", () => {
    const proDiscount = 1 - PRICES.pro.yearly.amount / (14.99 * 12);
    expect(proDiscount).toBeGreaterThan(0.49);
    expect(yearlySaving("pro")).toBeCloseTo(89.99, 1);
  });

  it("runs the trial on Ilimitado, not on Pro", () => {
    expect(TRIAL.tier).toBe("unlimited");
    expect(TRIAL.days).toBe(3);
  });

  it("keeps paid tools out of the free tiers", () => {
    expect(PLANS.free.limits.tools).not.toContain("paraphrase");
    expect(PLANS.pro.limits.tools).toContain("paraphrase");
    expect(PLANS.free.limits.sentenceHighlight).toBe(false);
    expect(PLANS.pro.limits.sentenceHighlight).toBe(true);
  });
});

describe("resolveEntitlements", () => {
  it("reads the Stripe product metadata", () => {
    const resolved = resolveEntitlements(
      {
        tier: "pro",
        words_per_month: "80000",
        max_words_per_request: "4000",
        tools: "humanize,detect",
        history: "true",
        priority_queue: "false",
      },
      "pro",
    );
    expect(resolved.tier).toBe("pro");
    expect(resolved.limits.wordsPerMonth).toBe(80_000);
    expect(resolved.limits.maxWordsPerRequest).toBe(4_000);
    expect(resolved.limits.tools).toEqual(["humanize", "detect"]);
  });

  it("falls back to plans.ts when metadata is missing or malformed", () => {
    const resolved = resolveEntitlements(
      { tier: "unlimited", words_per_month: "not-a-number" },
      "pro",
    );
    expect(resolved.tier).toBe("unlimited");
    expect(resolved.limits.wordsPerMonth).toBe(
      PLANS.unlimited.limits.wordsPerMonth,
    );
  });

  it("ignores unknown tool names instead of trusting them", () => {
    const resolved = resolveEntitlements(
      { tier: "pro", tools: "humanize,teleport" },
      "pro",
    );
    expect(resolved.limits.tools).toEqual(["humanize"]);
  });

  it("uses the fallback tier when metadata has none", () => {
    expect(resolveEntitlements(null, "unlimited").tier).toBe("unlimited");
  });
});

describe("checkEntitlement", () => {
  it("blocks paid-only tools on the free plan", () => {
    expect(checkEntitlement(PLANS.free, "paraphrase", 10)).toMatchObject({
      allowed: false,
      reason: "tool_not_in_plan",
    });
    expect(checkEntitlement(PLANS.pro, "paraphrase", 10).allowed).toBe(true);
  });

  it("enforces the per-request word ceiling of each tier", () => {
    expect(checkEntitlement(PLANS.free, "humanize", 301).allowed).toBe(false);
    expect(checkEntitlement(PLANS.pro, "humanize", 3_000).allowed).toBe(true);
    expect(checkEntitlement(PLANS.pro, "humanize", 3_001)).toMatchObject({
      reason: "request_too_long",
    });
    expect(checkEntitlement(PLANS.unlimited, "humanize", 8_000).allowed).toBe(
      true,
    );
  });

  it("rejects unknown tools", () => {
    expect(checkEntitlement(PLANS.pro, "summarize", 10)).toMatchObject({
      reason: "unknown_tool",
    });
  });
});

describe("trialDisclosure", () => {
  it("states the charge date and both prices before payment (§6.1)", () => {
    const text = trialDisclosure(new Date("2026-09-10T12:00:00Z"));
    expect(text).toContain("Hoy no se te cobra nada");
    expect(text).toContain("13/09/2026");
    expect(text).toContain("29,99");
    expect(text).toContain("14,99");
    expect(text).toContain("cancelar");
  });
});
