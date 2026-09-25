import { describe, expect, it } from "vitest";

import {
  CONSENT_BOOTSTRAP,
  CONSENT_KEY,
  CONSENT_VERSION,
  DENIED,
  GRANTED,
  consentSignals,
  readConsent,
  writeConsent,
} from "@/lib/analytics/consent";

// What Google is told, and when. The failure this guards against is not a
// crash: it is a banner that looks right, stores the answer, and quietly
// implements the 2023 version of a contract Google has been enforcing
// since 2024 -- at which point the ads spend buys traffic nobody can
// measure.

describe("consentSignals", () => {
  it("moves all four signals, not the two of v1", () => {
    const granted = consentSignals(GRANTED);
    expect(Object.keys(granted).sort()).toEqual([
      "ad_personalization",
      "ad_storage",
      "ad_user_data",
      "analytics_storage",
    ]);
    expect(Object.values(granted)).toEqual([
      "granted",
      "granted",
      "granted",
      "granted",
    ]);
  });

  it("keeps the two purposes apart", () => {
    // Somebody who wants the product measured but not the ads is saying
    // something specific, and the cookie policy promises it is heard.
    const analyticsOnly = consentSignals({ analytics: true, ads: false });
    expect(analyticsOnly.analytics_storage).toBe("granted");
    expect(analyticsOnly.ad_storage).toBe("denied");
    expect(analyticsOnly.ad_user_data).toBe("denied");
    expect(analyticsOnly.ad_personalization).toBe("denied");
  });

  it("denies everything when nothing was allowed", () => {
    expect(new Set(Object.values(consentSignals(DENIED)))).toEqual(
      new Set(["denied"]),
    );
  });
});

describe("the bootstrap script", () => {
  it("declares every signal denied before the tag can load", () => {
    for (const signal of Object.keys(consentSignals(GRANTED))) {
      expect(CONSENT_BOOTSTRAP).toContain(signal);
    }
    expect(CONSENT_BOOTSTRAP).toContain("'consent','default'");
    expect(CONSENT_BOOTSTRAP).toContain("denied");
  });

  it("leaves what the service needs to work alone", () => {
    // The session cookie is not a question with two answers.
    expect(CONSENT_BOOTSTRAP).toContain("functionality_storage:'granted'");
    expect(CONSENT_BOOTSTRAP).toContain("security_storage:'granted'");
  });

  it("reads the stored answer itself", () => {
    // Waiting for React would spend the first render of every page
    // counting a returning visitor who consented as a refusal.
    expect(CONSENT_BOOTSTRAP).toContain(CONSENT_KEY);
  });
});

describe("the stored answer", () => {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
    },
    configurable: true,
  });

  it("survives a round trip", () => {
    writeConsent({ analytics: true, ads: false });
    expect(readConsent()).toEqual({ analytics: true, ads: false });
  });

  it("is not an answer once the question changes", () => {
    // An answer given about two purposes says nothing about a third.
    store.set(
      CONSENT_KEY,
      JSON.stringify({ v: CONSENT_VERSION + 1, analytics: true, ads: true }),
    );
    expect(readConsent()).toBeNull();
  });

  it("asks again rather than assuming, when there is nothing to read", () => {
    store.clear();
    expect(readConsent()).toBeNull();
    store.set(CONSENT_KEY, "not json");
    expect(readConsent()).toBeNull();
  });
});
