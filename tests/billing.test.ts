import { describe, expect, it } from "vitest";
import { createFormatter, createTranslator } from "next-intl";

import en from "@/messages/en.json";
import es from "@/messages/es.json";

import { checkEntitlement } from "@/lib/billing/entitlements";
import { resolveEntitlements } from "@/lib/billing/metadata";
import {
  PAYMENT_METHOD_TYPES,
  PLANS,
  PRICES,
  TOPUP,
  TRIAL,
  formatUsd,
  trialDaysFor,
  yearlySaving,
} from "@/lib/billing/plans";
import {
  paymentDisclosure,
  renewalDate,
  trialDisclosure,
} from "@/lib/billing/disclosure";
import { subscribeRequestSchema } from "@/lib/security/validation";
import { subscriptionParams } from "@/lib/billing/subscribe";
import { auditStripe, describeCheckoutRejection } from "@/lib/billing/stripe";

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
  // The disclosure is a legal obligation before payment details are taken,
  // so it is checked against the real message catalogue in both languages
  // rather than against a fixture that could drift from what ships.
  const when = new Date("2026-09-10T12:00:00Z");

  function render(locale: "es" | "en") {
    const messages = locale === "es" ? es : en;
    const t = createTranslator({ locale, messages, namespace: "checkout" });
    const format = createFormatter({ locale });
    return trialDisclosure(
      locale,
      t,
      (date) =>
        format.dateTime(date, {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      when,
    );
  }

  it("states the charge date and both prices before payment (§6.1)", () => {
    const text = render("es");
    expect(text).toContain("Hoy no se te cobra nada");
    expect(text).toContain("septiembre");
    expect(text).toContain("2026");
    expect(text).toContain("29,99");
    expect(text).toContain("14,99");
    expect(text).toContain("cancelar");
  });

  it("says the same thing in English, with the month in words", () => {
    // 13/09 and 09/13 are the same date to nobody. Spelling the month is
    // what stops a US reader taking the charge date for three months away.
    const text = render("en");
    expect(text).toContain("not charged today");
    expect(text).toContain("September");
    expect(text).toContain("2026");
    expect(text).toContain("29.99");
    expect(text).toContain("14.99");
    expect(text).toContain("cancel");
    expect(text).not.toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

describe("describeCheckoutRejection", () => {
  it("names Stripe Tax when that is what Stripe objected to", () => {
    const e = {
      type: "StripeInvalidRequestError",
      param: "automatic_tax[enabled]",
      message: "You cannot use automatic tax without a registered address.",
    };
    const { code, fix } = describeCheckoutRejection(e);
    expect(code).toBe("tax_not_configured");
    expect(fix).toMatch(/Stripe Tax/);
  });

  it("names the terms URL when consent collection is refused", () => {
    const e = {
      type: "StripeInvalidRequestError",
      param: "consent_collection[terms_of_service]",
      message: "You must provide a terms of service URL.",
    };
    expect(describeCheckoutRejection(e).code).toBe("terms_url_missing");
  });

  it("classifies from the message when param is absent", () => {
    // Stripe does not always set param.
    const e = {
      type: "StripeInvalidRequestError",
      message: "automatic_tax requires an origin address",
    };
    expect(describeCheckoutRejection(e).code).toBe("tax_not_configured");
  });

  it("recognises the terms refusal Stripe actually sends", () => {
    // Verbatim from production. It names neither the parameter nor the
    // field, so matching on `consent_collection` alone let the very error
    // this was written for fall through to the generic code.
    const e = {
      type: "StripeInvalidRequestError",
      message:
        "You cannot collect consent to your terms of service unless a URL is set in the Stripe Dashboard. Update your public business details in the Dashboard https://dashboard.stripe.com/settings/public with a Terms of service URL to collect terms of service consent.",
    };
    const { code, fix } = describeCheckoutRejection(e);
    expect(code).toBe("terms_url_missing");
    expect(fix).toMatch(/Public details/);
  });

  it("recognises Stripe Tax refusals phrased without the parameter", () => {
    const e = {
      type: "StripeInvalidRequestError",
      message:
        "You cannot use automatic tax calculation until you activate Stripe Tax in the Dashboard.",
    };
    expect(describeCheckoutRejection(e).code).toBe("tax_not_configured");
  });

  it("separates a bad key from a bad request", () => {
    const { code, fix } = describeCheckoutRejection({
      type: "StripeAuthenticationError",
      message: "Invalid API Key provided",
    });
    expect(code).toBe("stripe_key_invalid");
    expect(fix).toMatch(/STRIPE_SECRET_KEY/);
  });

  it("falls back without inventing a fix it cannot know", () => {
    for (const e of [
      { type: "StripeAPIError", message: "An unexpected error occurred" },
      new Error("socket hang up"),
      null,
    ]) {
      const { code, fix } = describeCheckoutRejection(e);
      expect(code).toBe("checkout_failed");
      expect(fix).toBeNull();
    }
  });
});

describe("trialDaysFor", () => {
  // The rule the whole redesign turns on. A trial hanging off a yearly
  // cycle is what made the headline price and the disclosure disagree:
  // "3 days free" printed over a charge of $179.88.
  it("gives the trial to Ilimitado monthly and to nothing else", () => {
    expect(trialDaysFor("unlimited", "monthly")).toBe(TRIAL.days);
    expect(trialDaysFor("unlimited", "yearly")).toBeNull();
    expect(trialDaysFor("pro", "monthly")).toBeNull();
    expect(trialDaysFor("pro", "yearly")).toBeNull();
  });

  it("reads the trial from PLANS rather than from a literal", () => {
    // If the trial ever moves tier or length, this follows it; a hardcoded
    // 3 here would keep passing while the product said something else.
    expect(trialDaysFor(TRIAL.tier, TRIAL.interval)).toBe(TRIAL.days);
  });
});

describe("paymentDisclosure", () => {
  const when = new Date("2026-09-10T12:00:00Z");

  function render(
    locale: "es" | "en",
    tier: "pro" | "unlimited",
    interval: "monthly" | "yearly",
  ) {
    const messages = locale === "es" ? es : en;
    const t = createTranslator({ locale, messages, namespace: "payment" });
    const format = createFormatter({ locale });
    return paymentDisclosure(
      locale,
      tier,
      interval,
      t,
      (date) =>
        format.dateTime(date, {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      when,
    );
  }

  it("promises no charge today only when there is actually a trial", () => {
    expect(render("es", "unlimited", "monthly")).toContain(
      "Hoy no se te cobra nada",
    );
    // The yearly cycle is charged in full today and has to say so. This is
    // the sentence whose absence was the original bug.
    expect(render("es", "unlimited", "yearly")).toContain("Hoy se te cobran");
    expect(render("es", "unlimited", "yearly")).not.toContain(
      "no se te cobra nada",
    );
  });

  it("names the amount that will actually be charged, in each cycle", () => {
    expect(render("es", "unlimited", "monthly")).toContain("29,99");
    expect(render("es", "unlimited", "yearly")).toContain("179,88");
    expect(render("es", "pro", "monthly")).toContain("14,99");
    expect(render("es", "pro", "yearly")).toContain("89,88");
  });

  it("says the card is kept, but only where a card is being kept", () => {
    expect(render("es", "unlimited", "monthly")).toContain(
      "Guardamos tu tarjeta",
    );
    expect(render("es", "unlimited", "yearly")).not.toContain(
      "Guardamos tu tarjeta",
    );
  });

  it("puts the month in words in English too", () => {
    const text = render("en", "unlimited", "monthly");
    expect(text).toContain("September");
    expect(text).toContain("$29.99");
    // 09/13/2026 to one reader is 13 September and to another is nothing at
    // all; the date of a first charge cannot be ambiguous.
    expect(text).not.toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("agrees with the figure the button will show", () => {
    // The acceptance criterion from 08-QA: the number on the button and the
    // number in the disclosure match, in both cycles. The button renders
    // formatUsd of the same PRICES entry, so this pins them together.
    for (const interval of ["monthly", "yearly"] as const) {
      const shown = formatUsd(PRICES.unlimited[interval].amount, "es");
      expect(render("es", "unlimited", interval)).toContain(shown);
    }
  });
});

describe("renewalDate", () => {
  it("moves a month or a year, per cycle", () => {
    const now = new Date("2026-09-10T12:00:00Z");
    expect(renewalDate("monthly", now).toISOString()).toContain("2026-10-10");
    expect(renewalDate("yearly", now).toISOString()).toContain("2027-09-10");
  });
});

describe("subscribeRequestSchema", () => {
  const valid = {
    plan: "unlimited",
    cycle: "monthly",
    locale: "es",
    consent: true,
  };

  it("accepts a well-formed request", () => {
    expect(subscribeRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("refuses to be told the price", () => {
    // The classic hole: a browser that can state the amount can state zero.
    // Extra keys are dropped rather than honoured, so the parsed body never
    // carries one.
    const parsed = subscribeRequestSchema.safeParse({
      ...valid,
      amount: 1,
      price: "price_free",
      trial_period_days: 365,
    });
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data).toEqual(valid);
  });

  it("will not proceed without the consent tick", () => {
    expect(
      subscribeRequestSchema.safeParse({ ...valid, consent: false }).success,
    ).toBe(false);
    expect(
      subscribeRequestSchema.safeParse({
        plan: valid.plan,
        cycle: valid.cycle,
        locale: valid.locale,
      }).success,
    ).toBe(false);
  });

  it("rejects a plan that is not for sale", () => {
    expect(
      subscribeRequestSchema.safeParse({ ...valid, plan: "free" }).success,
    ).toBe(false);
  });
});

describe("subscriptionParams", () => {
  const base = {
    customerId: "cus_123",
    priceId: "price_123",
    userId: "user-123",
    locale: "es" as const,
  };

  it("always calculates tax", () => {
    // Prices are tax-inclusive, so this changes nobody's total -- it splits
    // the amount into net and tax. Without it the whole 29,99 is booked as
    // revenue and the VAT on an EU sale leaves the margin unrecorded, while
    // the page goes on saying tax is calculated at payment.
    for (const tier of ["pro", "unlimited"] as const) {
      for (const interval of ["monthly", "yearly"] as const) {
        const params = subscriptionParams({ ...base, tier, interval });
        expect(params.automatic_tax, `${tier} ${interval}`).toEqual({
          enabled: true,
        });
      }
    }
  });

  it("names the payment methods instead of leaving them automatic", () => {
    // The Element is built from the same constant. An Element without it
    // collects through automatic payment methods, and Stripe.js then
    // refuses to confirm against an intent that names its types -- in the
    // browser, so the server logs stay empty and the customer is just told
    // the payment did not go through.
    for (const tier of ["pro", "unlimited"] as const) {
      for (const interval of ["monthly", "yearly"] as const) {
        const params = subscriptionParams({ ...base, tier, interval });
        expect(
          params.payment_settings?.payment_method_types,
          `${tier} ${interval}`,
        ).toEqual([...PAYMENT_METHOD_TYPES]);
      }
    }
  });

  it("asks for a trial on Ilimitado monthly and nowhere else", () => {
    expect(
      subscriptionParams({ ...base, tier: "unlimited", interval: "monthly" })
        .trial_period_days,
    ).toBe(TRIAL.days);

    for (const [tier, interval] of [
      ["unlimited", "yearly"],
      ["pro", "monthly"],
      ["pro", "yearly"],
    ] as const) {
      expect(
        subscriptionParams({ ...base, tier, interval }).trial_period_days,
        `${tier} ${interval}`,
      ).toBeUndefined();
    }
  });

  it("expands the field each charging mechanism actually uses", () => {
    // A trial owes nothing today, so there is no invoice and the browser
    // confirms a SetupIntent. Everything else has an invoice from the first
    // minute, and its secret lives on confirmation_secret -- payment_intent
    // was removed from the API version this SDK pins and reads as undefined.
    expect(
      subscriptionParams({ ...base, tier: "unlimited", interval: "monthly" })
        .expand,
    ).toEqual(["pending_setup_intent"]);
    expect(
      subscriptionParams({ ...base, tier: "pro", interval: "yearly" }).expand,
    ).toEqual(["latest_invoice.confirmation_secret"]);
  });

  it("cancels a trial that never got a card, rather than leaving it unbillable", () => {
    const params = subscriptionParams({
      ...base,
      tier: "unlimited",
      interval: "monthly",
    });
    expect(params.trial_settings?.end_behavior?.missing_payment_method).toBe(
      "cancel",
    );
  });

  it("carries the user, the plan and the language into the metadata", () => {
    // The webhook has no request to read: everything it needs to attribute
    // a payment and answer in the right language travels here.
    const params = subscriptionParams({
      ...base,
      tier: "pro",
      interval: "monthly",
      locale: "en",
    });
    expect(params.metadata).toEqual({
      user_id: "user-123",
      plan: "pro",
      cycle: "monthly",
      locale: "en",
    });
  });

  it("never lets the browser name the price", () => {
    // The amount comes from the resolved Stripe price, never from anything
    // the client sent.
    const params = subscriptionParams({
      ...base,
      tier: "pro",
      interval: "monthly",
    });
    expect(params.items).toEqual([{ price: "price_123" }]);
  });
});

describe("auditStripe", () => {
  // What the account can do, as opposed to which variables are set. Going
  // live is four changes and three of them are silent.
  const PRICE_KEYS = [
    "pro_monthly_usd",
    "pro_yearly_usd",
    "unlimited_monthly_usd",
    "unlimited_yearly_usd",
    "topup_25k_usd",
  ];

  const ENDPOINT = {
    url: "https://www.verbalyx.ai/api/stripe/webhook",
    status: "enabled",
    livemode: true,
    enabled_events: [
      "invoice.paid",
      "setup_intent.succeeded",
      "customer.subscription.updated",
      "customer.subscription.deleted",
    ],
  };

  function fakeStripe(options: {
    prices?: { lookup_key: string; livemode: boolean }[];
    endpoints?: (typeof ENDPOINT)[];
    tax?: { status: string; head_office?: { address?: { country?: string } } };
  }) {
    return {
      prices: {
        list: async () => ({
          data:
            options.prices ??
            PRICE_KEYS.map((lookup_key) => ({ lookup_key, livemode: true })),
        }),
      },
      tax: {
        settings: {
          retrieve: async () =>
            options.tax ?? {
              status: "active",
              head_office: { address: { country: "US" } },
            },
        },
      },
      webhookEndpoints: {
        list: async () => ({ data: options.endpoints ?? [ENDPOINT] }),
      },
      // The audit only reads these three.
    } as unknown as Parameters<typeof auditStripe>[0];
  }

  it("says nothing when the account can take a payment", async () => {
    const audit = await auditStripe(fakeStripe({}));
    expect(audit.problem).toBeNull();
    expect(audit.prices.every((p) => p.found && p.live)).toBe(true);
  });

  it("names the prices that do not exist in this account", async () => {
    // Prices are per mode: an account with live keys and sandbox prices
    // answers every checkout with price_not_configured.
    const audit = await auditStripe(
      fakeStripe({
        prices: [{ lookup_key: "pro_monthly_usd", livemode: true }],
      }),
    );
    expect(audit.problem).toMatch(/Faltan 4 de 5 precios/);
    expect(audit.problem).toContain("unlimited_yearly_usd");
    expect(audit.prices.filter((p) => !p.found)).toHaveLength(4);
  });

  it("reports a price that belongs to the other mode", async () => {
    const audit = await auditStripe(
      fakeStripe({
        prices: PRICE_KEYS.map((lookup_key) => ({
          lookup_key,
          livemode: false,
        })),
      }),
    );
    // Found, so nothing is missing -- but the panel can show which mode
    // each one lives in, which is the tell when the keys were swapped and
    // the prices were not.
    expect(audit.problem).toBeNull();
    expect(audit.prices.every((p) => p.live === false)).toBe(true);
  });

  it("catches a mode where Stripe Tax cannot price anything", async () => {
    // Every subscription carries automatic_tax, so an inactive setting
    // refuses them one by one -- and the setting is per mode, so a
    // configured sandbox says nothing about live.
    const audit = await auditStripe(fakeStripe({ tax: { status: "pending" } }));
    expect(audit.problem).toMatch(/Stripe Tax no está activo/);
    expect(audit.problem).toMatch(/sin dirección de origen|no tiene dirección/);
    expect(audit.tax).toEqual({ active: false, headOffice: false });
  });

  it("survives an account whose tax settings cannot be read", async () => {
    const stripe = fakeStripe({});
    (
      stripe as unknown as { tax: { settings: { retrieve: () => unknown } } }
    ).tax.settings.retrieve = async () => {
      throw new Error("permission denied");
    };
    const audit = await auditStripe(stripe);
    expect(audit.tax).toBeNull();
    // A reading we could not take is not a problem we can name.
    expect(audit.problem).toBeNull();
  });

  it("catches an account with no webhook that would activate a plan", async () => {
    // The most expensive silence there is: the customer pays, Stripe is
    // happy, and the account stays free.
    const audit = await auditStripe(fakeStripe({ endpoints: [] }));
    expect(audit.problem).toMatch(/webhook activo/);
  });

  it("catches an endpoint that is missing the events a sale needs", async () => {
    const audit = await auditStripe(
      fakeStripe({
        endpoints: [
          { ...ENDPOINT, enabled_events: ["checkout.session.completed"] },
        ],
      }),
    );
    expect(audit.problem).toMatch(/webhook activo/);
    expect(audit.webhooks[0].covers).toBe(false);
  });

  it("accepts an endpoint subscribed to everything", async () => {
    const audit = await auditStripe(
      fakeStripe({ endpoints: [{ ...ENDPOINT, enabled_events: ["*"] }] }),
    );
    expect(audit.problem).toBeNull();
  });
});
