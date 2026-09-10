import { describe, expect, it } from "vitest";

import { estimateCostCents, pickModel } from "@/lib/ai/provider";

describe("pickModel", () => {
  it("routes short texts to Haiku and the rest to Sonnet", () => {
    expect(pickModel(50)).toBe("claude-haiku-4-5");
    expect(pickModel(149)).toBe("claude-haiku-4-5");
    expect(pickModel(150)).toBe("claude-sonnet-5");
    expect(pickModel(5000)).toBe("claude-sonnet-5");
  });
});

describe("estimateCostCents", () => {
  it("prices Sonnet usage ($2/$10 per MTok)", () => {
    const cents = estimateCostCents("claude-sonnet-5", {
      input_tokens: 1_000_000,
      output_tokens: 1_000_000,
    });
    expect(cents).toBeCloseTo(1200);
  });

  it("returns 0 for unknown models", () => {
    expect(
      estimateCostCents("gpt-x", { input_tokens: 10, output_tokens: 10 }),
    ).toBe(0);
  });
});
