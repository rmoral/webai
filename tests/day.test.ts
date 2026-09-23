import { describe, expect, it } from "vitest";

import {
  QUOTA_TIMEZONE,
  minutesUntilQuotaReset,
  nextQuotaReset,
  quotaDay,
} from "@/lib/usage/day";

// The clock the daily allowance runs on. It used to be UTC by accident,
// so "500 words a day" meant a day ending at 01:00 or 02:00 for the
// market this is sold to, and no screen could say when it refills.

/** The wall clock in the quota's timezone, for readable assertions. */
function local(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: QUOTA_TIMEZONE,
    dateStyle: "short",
    timeStyle: "medium",
    hour12: false,
  }).format(date);
}

describe("quotaDay", () => {
  it("rolls over at midnight in the quota's timezone, not at UTC", () => {
    // 23:30 UTC in summer is already the next day in Madrid (+2).
    expect(quotaDay(new Date("2026-07-15T23:30:00Z"))).toBe("2026-07-16");
    // And in winter (+1) the same holds from 23:00.
    expect(quotaDay(new Date("2026-01-15T23:30:00Z"))).toBe("2026-01-16");
    // Before the local midnight it is still the day before.
    expect(quotaDay(new Date("2026-07-15T21:30:00Z"))).toBe("2026-07-15");
  });
});

describe("nextQuotaReset", () => {
  it("lands exactly on the next local midnight", () => {
    for (const iso of [
      "2026-09-23T14:00:00Z",
      "2026-01-15T23:30:00Z",
      "2026-07-01T00:00:00Z",
    ]) {
      const reset = nextQuotaReset(new Date(iso));
      expect(local(reset), iso).toMatch(/, 00:00:00$/);
      expect(reset.getTime()).toBeGreaterThan(new Date(iso).getTime());
    }
  });

  it("stays on midnight across both daylight-saving changes", () => {
    // The offset is read at `now` and applied to an instant up to a day
    // later, which is wrong by an hour on the two nights the clocks move.
    // These are the two nights.
    const backward = nextQuotaReset(new Date("2026-10-24T22:30:00Z"));
    expect(local(backward)).toBe("2026-10-26, 00:00:00");

    const forward = nextQuotaReset(new Date("2027-03-27T23:30:00Z"));
    expect(local(forward)).toBe("2027-03-29, 00:00:00");
  });

  it("measures the long day and the short day correctly", () => {
    // The night the clocks go back, the local day is 25 hours long.
    const longDay = new Date("2026-10-24T22:30:00Z"); // 00:30 local
    expect(
      (nextQuotaReset(longDay).getTime() - longDay.getTime()) / 3_600_000,
    ).toBeCloseTo(24.5, 5);

    // The night they go forward, it is 23.
    const shortDay = new Date("2027-03-27T23:30:00Z"); // 00:30 local
    expect(
      (nextQuotaReset(shortDay).getTime() - shortDay.getTime()) / 3_600_000,
    ).toBeCloseTo(22.5, 5);
  });
});

describe("minutesUntilQuotaReset", () => {
  it("rounds up, because '0 min' reads as a bug", () => {
    // 23:59:30 local, half a minute to go.
    const almost = new Date("2026-07-15T21:59:30Z");
    expect(minutesUntilQuotaReset(almost)).toBe(1);
  });

  it("counts a whole day from just after the reset", () => {
    const justAfter = new Date("2026-07-15T22:00:30Z"); // 00:00:30 local
    expect(minutesUntilQuotaReset(justAfter)).toBe(24 * 60);
  });
});
