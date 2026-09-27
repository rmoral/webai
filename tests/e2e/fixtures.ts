import { test as base, expect } from "@playwright/test";

import { CONSENT_KEY, CONSENT_VERSION } from "@/lib/analytics/consent";
import { TOUR_KEY, TOUR_VERSION } from "@/components/tools/tour";

// Every spec but consent.spec.ts runs as somebody who has already answered
// the cookie banner, because that is what almost every visit is: the
// banner is shown once and the rest of the product is what the suite is
// about. Without this the banner sits over the editor on a phone and the
// failures read as layout bugs in whatever was being tested.
//
// The answer seeded is "no", which is both the conservative state and the
// one the tests want: nothing here should depend on analytics running.
//
// The editor's first-visit hints are seeded as seen for the same reason:
// they are a first visit, every other spec is about the tool rather than
// about arriving at it, and a strip above the box moves what those specs
// are measuring. tests/e2e/tour.spec.ts opts back in.

export const test = base.extend({
  // The second argument is Playwright's `use`, renamed: called `use`, the
  // React hooks lint rule reads it as React's `use()` and refuses the file.
  page: async ({ page }, runTest) => {
    await page.addInitScript(
      ({ key, version, tourKey, tourVersion }) => {
        try {
          localStorage.setItem(
            key,
            JSON.stringify({
              v: version,
              analytics: false,
              ads: false,
              at: Date.now(),
            }),
          );
          localStorage.setItem(
            tourKey,
            JSON.stringify({ v: tourVersion, at: Date.now() }),
          );
        } catch {
          // A browser that refuses storage will show the banner. The
          // specs that care say so themselves.
        }
      },
      {
        key: CONSENT_KEY,
        version: CONSENT_VERSION,
        tourKey: TOUR_KEY,
        tourVersion: TOUR_VERSION,
      },
    );
    await runTest(page);
  },
});

export { expect };
