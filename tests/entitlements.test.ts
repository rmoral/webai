import { describe, expect, it } from "vitest";

import { checkEntitlement } from "@/lib/billing/entitlements";
import { PLANS } from "@/lib/billing/plans";

describe("checkEntitlement", () => {
  it("allows a free user within the per-request limit", () => {
    const result = checkEntitlement(PLANS.free, "humanize", 400);
    expect(result.allowed).toBe(true);
  });

  it("rejects requests over the plan's per-request word limit", () => {
    const result = checkEntitlement(PLANS.free, "humanize", 501);
    expect(result).toMatchObject({
      allowed: false,
      reason: "request_too_long",
    });
  });

  it("allows Pro up to 10K words per request", () => {
    expect(checkEntitlement(PLANS.pro, "detect", 10_000).allowed).toBe(true);
    expect(checkEntitlement(PLANS.pro, "detect", 10_001).allowed).toBe(false);
  });

  it("rejects unknown tools", () => {
    const result = checkEntitlement(PLANS.pro, "summarize", 10);
    expect(result).toMatchObject({ allowed: false, reason: "unknown_tool" });
  });
});
