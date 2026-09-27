import { describe, expect, it } from "vitest";

import { tourStep } from "@/components/tools/tour";

// The order of the three hints. What this guards against is two of them on
// screen at once, which does not read as help -- it reads as a broken page.

const state = {
  dismissed: false,
  hasModes: true,
  hasText: false,
  hasResult: false,
};

describe("which hint is on screen", () => {
  it("starts at the empty box", () => {
    expect(tourStep(state)).toBe(1);
  });

  it("moves to the register once there is text", () => {
    expect(tourStep({ ...state, hasText: true })).toBe(2);
  });

  it("moves to the result once there is one", () => {
    expect(tourStep({ ...state, hasText: true, hasResult: true })).toBe(3);
  });

  it("skips the register on a tool that has none", () => {
    // The detector has no registers. A hint telling somebody to choose one
    // would point at a row that is not there.
    expect(tourStep({ ...state, hasModes: false, hasText: true })).toBeNull();
    // And the first hint still applies: the box is the box.
    expect(tourStep({ ...state, hasModes: false })).toBe(1);
    // As does the third, which is about the result and not the register.
    expect(
      tourStep({ ...state, hasModes: false, hasText: true, hasResult: true }),
    ).toBe(3);
  });

  it("shows nothing at all once it has been closed", () => {
    // Closing one closes the lot: that is what pressing the X asks for.
    for (const rest of [
      {},
      { hasText: true },
      { hasText: true, hasResult: true },
    ]) {
      expect(tourStep({ ...state, ...rest, dismissed: true })).toBeNull();
    }
  });

  it("never returns two", () => {
    // Belt and braces on the shape: exactly one step, or none.
    for (const hasModes of [true, false]) {
      for (const hasText of [true, false]) {
        for (const hasResult of [true, false]) {
          const step = tourStep({
            dismissed: false,
            hasModes,
            hasText,
            hasResult,
          });
          expect(step === null || [1, 2, 3].includes(step)).toBe(true);
        }
      }
    }
  });
});
