import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ATTRIBUTION_KEY,
  ATTRIBUTION_MAX_AGE_DAYS,
  ATTRIBUTION_MAX_LENGTH,
  ATTRIBUTION_VERSION,
  captureAttribution,
  clearAttribution,
  parseAttribution,
  pickAttribution,
  readAttribution,
} from "@/lib/analytics/attribution";
import { subscriptionParams } from "@/lib/billing/subscribe";
import { subscribeRequestSchema } from "@/lib/security/validation";

// Which ad paid for a customer. The failure this guards against is silent
// and expensive: the campaign runs, the sales happen, and every one of them
// is reported as "direct" -- so the bidding optimises against nothing and
// the money goes to whichever keyword was cheapest rather than whichever
// one sold.

const store = new Map<string, string>();

Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
  },
  configurable: true,
});

beforeEach(() => {
  store.clear();
  vi.useRealTimers();
});

describe("what a URL is read for", () => {
  it("takes the click ids and the campaign, and nothing else", () => {
    expect(
      parseAttribution(
        "?gclid=abc123&utm_source=google&utm_medium=cpc&utm_campaign=humanizador&ref=spam&text=hola",
      ),
    ).toEqual({
      gclid: "abc123",
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "humanizador",
    });
  });

  it("reads the ids Google sends when it cannot set a cookie", () => {
    // Without these an iPhone campaign reports no conversions at all,
    // which in Spain is most of the traffic.
    expect(parseAttribution("?gbraid=GB1")).toEqual({ gbraid: "GB1" });
    expect(parseAttribution("?wbraid=WB1")).toEqual({ wbraid: "WB1" });
  });

  it("says nothing about an untagged visit", () => {
    expect(parseAttribution("")).toBeNull();
    expect(parseAttribution("?checkout=success")).toBeNull();
    // Present but empty is not a campaign.
    expect(parseAttribution("?gclid=&utm_source=%20")).toBeNull();
  });

  it("caps a value, because the URL is written by whoever clicks it", () => {
    const long = "x".repeat(ATTRIBUTION_MAX_LENGTH + 50);
    const parsed = parseAttribution(`?gclid=${long}`);
    expect(parsed?.gclid).toHaveLength(ATTRIBUTION_MAX_LENGTH);
  });
});

describe("what is kept, and when", () => {
  it("keeps nothing at all until advertising is consented to", () => {
    expect(captureAttribution("?gclid=abc123", false)).toBeNull();
    expect(store.size).toBe(0);
  });

  it("survives a round trip once it is allowed", () => {
    captureAttribution("?gclid=abc123&utm_campaign=verano", true);
    expect(readAttribution()).toEqual({
      gclid: "abc123",
      utm_campaign: "verano",
    });
  });

  it("credits the most recent ad, which is the one Ads attributes", () => {
    captureAttribution("?gclid=first", true);
    captureAttribution("?gclid=second", true);
    expect(readAttribution()).toEqual({ gclid: "second" });
  });

  it("leaves the record alone on an untagged visit", () => {
    // Coming back from Stripe, reloading, or arriving from the newsletter
    // must not erase the campaign that paid for the visit.
    captureAttribution("?gclid=abc123", true);
    expect(captureAttribution("?checkout=success", true)).toEqual({
      gclid: "abc123",
    });
    expect(readAttribution()).toEqual({ gclid: "abc123" });
  });

  it("forgets a click too old for Ads to accept", () => {
    captureAttribution("?gclid=abc123", true);
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + (ATTRIBUTION_MAX_AGE_DAYS + 1) * 86_400_000);
    expect(readAttribution()).toBeNull();
  });

  it("is not a record once the fields change", () => {
    store.set(
      ATTRIBUTION_KEY,
      JSON.stringify({
        v: ATTRIBUTION_VERSION + 1,
        at: Date.now(),
        gclid: "abc123",
      }),
    );
    expect(readAttribution()).toBeNull();
  });

  it("is deleted when the consent is withdrawn", () => {
    captureAttribution("?gclid=abc123", true);
    clearAttribution();
    expect(readAttribution()).toBeNull();
  });

  it("does not throw where storage is unreadable", () => {
    // Private mode. A banner or a payment must not fail over this.
    const original = globalThis.localStorage;
    Object.defineProperty(globalThis, "localStorage", {
      get() {
        throw new Error("denied");
      },
      configurable: true,
    });
    expect(() => readAttribution()).not.toThrow();
    expect(() => captureAttribution("?gclid=abc", true)).not.toThrow();
    expect(() => clearAttribution()).not.toThrow();
    Object.defineProperty(globalThis, "localStorage", {
      value: original,
      configurable: true,
    });
  });
});

describe("the journey from the browser to the purchase row", () => {
  it("is accepted by the endpoint that opens a subscription", () => {
    const parsed = subscribeRequestSchema.safeParse({
      plan: "pro",
      cycle: "monthly",
      locale: "es",
      consent: true,
      attribution: { gclid: "abc123", utm_source: "google" },
    });
    expect(parsed.success).toBe(true);
  });

  it("is optional, because a sale must not depend on attributing it", () => {
    const parsed = subscribeRequestSchema.safeParse({
      plan: "pro",
      cycle: "monthly",
      locale: "es",
      consent: true,
    });
    expect(parsed.success).toBe(true);
  });

  it("refuses anything that is not one of the fields", () => {
    // The body reaches Stripe metadata, which refuses a long value by
    // failing the subscription rather than the field.
    for (const attribution of [
      { email: "someone@example.com" },
      { gclid: "x".repeat(ATTRIBUTION_MAX_LENGTH + 1) },
    ]) {
      const parsed = subscribeRequestSchema.safeParse({
        plan: "pro",
        cycle: "monthly",
        locale: "es",
        consent: true,
        attribution,
      });
      expect(parsed.success).toBe(false);
    }
  });

  it("rides on the subscription, which is what outlives the browser", () => {
    // Three days of trial separate the click from the charge, and the
    // webhook that reports the charge has nothing else to read.
    const params = subscriptionParams({
      customerId: "cus_1",
      priceId: "price_1",
      userId: "user-1",
      tier: "pro",
      interval: "monthly",
      locale: "es",
      attribution: { gclid: "abc123", utm_campaign: "verano" },
    });
    expect(params.metadata).toMatchObject({
      user_id: "user-1",
      gclid: "abc123",
      utm_campaign: "verano",
    });
  });

  it("leaves the metadata as it was when there is nothing to add", () => {
    const params = subscriptionParams({
      customerId: "cus_1",
      priceId: "price_1",
      userId: "user-1",
      tier: "pro",
      interval: "monthly",
      locale: "es",
    });
    expect(Object.keys(params.metadata ?? {}).sort()).toEqual([
      "cycle",
      "locale",
      "plan",
      "user_id",
    ]);
  });

  it("is read back out of the metadata, ignoring the rest of it", () => {
    expect(
      pickAttribution({
        user_id: "user-1",
        plan: "pro",
        locale: "es",
        gclid: "abc123",
        utm_source: "google",
      }),
    ).toEqual({ gclid: "abc123", utm_source: "google" });
    expect(pickAttribution({ user_id: "user-1" })).toBeNull();
    expect(pickAttribution(null)).toBeNull();
  });
});
