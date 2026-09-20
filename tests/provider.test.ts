import { describe, expect, it } from "vitest";

import { estimateCostCents, maxTokensFor } from "@/lib/ai/provider";
import { PLANS } from "@/lib/billing/plans";

describe("maxTokensFor", () => {
  it("scales the ceiling to the request", () => {
    // A rewrite returns about what it was given, so the input length
    // predicts the output length. The ceiling is a blast-radius guard: it
    // saves nothing in normal use, but it stops a runaway generation on a
    // short paste from billing a long one.
    expect(maxTokensFor(1_000)).toBeLessThan(maxTokensFor(4_000));
  });

  it("never falls below room for a complete short answer", () => {
    // 10 words times the per-word allowance is 24 tokens, which would
    // truncate the first sentence.
    expect(maxTokensFor(10)).toBeGreaterThanOrEqual(1_024);
    expect(maxTokensFor(0)).toBeGreaterThanOrEqual(1_024);
  });

  it("leaves headroom above the largest request any plan allows", () => {
    // The paid ceiling is what this has to cover: a request the plan accepts
    // and the model then truncates is a bug the user pays for.
    const largest = Math.max(
      ...Object.values(PLANS).map((p) => p.limits.maxWordsPerRequest),
    );
    // Spanish runs about 1.5 tokens per word, so the output of the largest
    // allowed request is around 1.5x its word count.
    expect(maxTokensFor(largest)).toBeGreaterThan(largest * 1.5);
  });

  it("stays inside a value the API accepts without streaming tricks", () => {
    expect(maxTokensFor(1_000_000)).toBeLessThanOrEqual(16_000);
  });
});

describe("estimateCostCents", () => {
  it("prices Haiku usage ($1/$5 per MTok)", () => {
    const cents = estimateCostCents("claude-haiku-4-5", {
      input_tokens: 1_000_000,
      output_tokens: 1_000_000,
    });
    expect(cents).toBeCloseTo(600);
  });

  it("still prices Sonnet, because stored usage rows name it", () => {
    // usage_daily rows written before the switch carry "claude-sonnet-5".
    // Dropping it from the table would silently value that history at zero.
    const cents = estimateCostCents("claude-sonnet-5", {
      input_tokens: 1_000_000,
      output_tokens: 1_000_000,
    });
    expect(cents).toBeCloseTo(1200);
  });

  it("prices the model we actually run at half of the one we left", () => {
    // The whole point of the change. Output dominates a rewriting bill, and
    // Haiku is half of Sonnet on both sides.
    const usage = { input_tokens: 2_000, output_tokens: 1_500 };
    expect(estimateCostCents("claude-haiku-4-5", usage)).toBeCloseTo(
      estimateCostCents("claude-sonnet-5", usage) / 2,
    );
  });

  it("returns 0 for unknown models", () => {
    expect(
      estimateCostCents("gpt-x", { input_tokens: 10, output_tokens: 10 }),
    ).toBe(0);
  });
});
