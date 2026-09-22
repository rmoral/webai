import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { PRICES, TOPUP, TRIAL_REMINDER, formatUsd } from "@/lib/billing/plans";
import en from "@/messages/en.json";
import es from "@/messages/es.json";

// The acceptance checklist of 08-QA, as assertions.
//
// Most of that list is a list of things a person is supposed to remember to
// look at. The ones that can be computed are computed here instead, because
// a checklist is only run when somebody remembers it exists and these are
// exactly the promises that matter after everyone has stopped looking.

const ROOT = process.cwd();

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

/** Every string in a catalogue, with the path that would find it again. */
function strings(value: Json, prefix = ""): [string, string][] {
  if (typeof value === "string") return [[prefix, value]];
  if (value === null || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) =>
    strings(child as Json, prefix ? `${prefix}.${key}` : key),
  );
}

const CATALOGUES: [string, Json][] = [
  ["es", es as Json],
  ["en", en as Json],
];

describe("voice", () => {
  it("has no emoji, in any state", () => {
    // Not a style preference: the product's credibility rests on not
    // overselling, and an emoji in an error or a success undoes that in one
    // character.
    //
    // (c), (R) and (TM) are Extended_Pictographic but are legal marks in
    // text presentation, not emoji; the copyright line needs one.
    const legalMarks = /[\u00A9\u00AE\u2122](?!\uFE0F)/g;
    for (const [name, catalogue] of CATALOGUES) {
      const offenders = strings(catalogue).filter(([, text]) =>
        /\p{Extended_Pictographic}/u.test(text.replace(legalMarks, "")),
      );
      expect(
        offenders,
        `${name}: ${offenders.map(([k]) => k).join(", ")}`,
      ).toEqual([]);
    }
  });

  it("never promises that a text gets past a detector", () => {
    // A product rule, not a wording preference. The site's own position is
    // "we do not promise it, and be wary of anyone who does".
    const claims = [
      /evad\w*\s+(los\s+)?detector/i,
      /(salta|burla|engaña)\w*\s+(los\s+)?detector/i,
      /indetectable/i,
      /pasa\w*\s+cualquier\s+detector/i,
      /bypass\w*\s+\w*\s*detect/i,
      /undetectable/i,
      /beat\s+(any\s+)?\w*\s*detector/i,
      /fool\s+(any\s+)?\w*\s*detector/i,
      /100\s*%\s*(human|humano)/i,
    ];
    for (const [name, catalogue] of CATALOGUES) {
      for (const [key, text] of strings(catalogue)) {
        for (const claim of claims) {
          expect(claim.test(text), `${name}.${key}: ${text}`).toBe(false);
        }
      }
    }
  });

  it("keeps the privacy nuance instead of the absolute", () => {
    // The free plans store no text; the paid ones store it encrypted for the
    // history. "We never store your text" would be false the moment
    // somebody pays, and it is the kind of false that ends in a complaint.
    const all = strings(es as Json).map(([, text]) => text);
    const nuanced = all.filter((text) => /cifrad/i.test(text));
    expect(nuanced.length).toBeGreaterThan(0);
    for (const text of all) {
      // An unqualified "we never store your texts" anywhere.
      expect(/nunca\s+guardamos\s+tus\s+textos/i.test(text)).toBe(false);
    }
  });
});

describe("no figure is written by hand", () => {
  // Every price lives in lib/billing/plans.ts. A price typed into a
  // component or into copy is one that changes in Stripe and stays wrong on
  // screen, which is the drift this redesign started by fixing.
  const amounts = [
    PRICES.pro.monthly.amount,
    PRICES.pro.yearly.amount,
    PRICES.unlimited.monthly.amount,
    PRICES.unlimited.yearly.amount,
    TOPUP.amount,
  ];

  it("keeps prices out of the message catalogues", () => {
    for (const [name, catalogue] of CATALOGUES) {
      for (const [key, text] of strings(catalogue)) {
        for (const amount of amounts) {
          for (const written of [
            formatUsd(amount, "es"),
            formatUsd(amount, "en"),
            amount.toFixed(2).replace(".", ","),
          ]) {
            expect(
              text.includes(written),
              `${name}.${key} contains the literal ${written}`,
            ).toBe(false);
          }
        }
      }
    }
  });
});

describe("colour carries meaning and stays legible", () => {
  const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");

  /** The hex value of a token, from the `:root` block. */
  function token(name: string): string {
    const match = new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i").exec(css);
    expect(match, `--${name} is not a hex literal in :root`).not.toBeNull();
    return match![1];
  }

  function luminance(hex: string): number {
    const channels = [1, 3, 5].map(
      (i) => parseInt(hex.slice(i, i + 2), 16) / 255,
    );
    const linear = channels.map((c) =>
      c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
    );
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  }

  function contrast(a: string, b: string): number {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  }

  // The three pairs 08-QA names. Tinted surfaces are where contrast quietly
  // fails, because the designer sees them against white.
  it.each([
    ["brand-ink", "brand-soft"],
    ["warning-ink", "warning-soft"],
    ["success-ink", "success-soft"],
    ["danger-ink", "danger-soft"],
  ])("reaches AA for %s on %s", (ink, soft) => {
    expect(contrast(token(ink), token(soft))).toBeGreaterThanOrEqual(4.5);
  });

  it("uses no gradient as decoration", () => {
    // There is exactly one gradient in the product and it carries
    // information: the fade over the withheld half of a result in wall B,
    // which says "there is more" without a word of copy. Anything else is
    // decoration the system does not have.
    const paywall = readFileSync(
      join(ROOT, "components/billing/paywall.tsx"),
      "utf8",
    );
    const gradients = paywall.match(/linear-gradient/g) ?? [];
    // Two: the mask, and its -webkit- twin.
    expect(gradients).toHaveLength(2);
    expect(paywall).toContain("maskImage");
  });
});

describe("the reminder schedule and its window agree", () => {
  const crons = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8"))
    .crons as { path: string; schedule: string }[];

  const reminder = crons.find((c) => c.path.includes("trial-reminder"));

  /** Hours between two runs of a 5-field schedule, for the shapes we use. */
  function intervalHours(schedule: string): number {
    const [minute, hour] = schedule.split(" ");
    // A concrete minute is required either way: without it the job runs
    // every minute and no window is small enough.
    expect(minute).toMatch(/^\d+$/);
    if (hour === "*") return 1;
    const everyN = /^\*\/(\d+)$/.exec(hour);
    if (everyN) return Number(everyN[1]);
    expect(hour, "unsupported hour field").toMatch(/^\d+$/);
    return 24;
  }

  it("points at a route that exists", () => {
    expect(crons.length).toBeGreaterThan(0);
    for (const { path } of crons) {
      expect(
        existsSync(join(ROOT, "app", path, "route.ts")),
        `${path} has no handler`,
      ).toBe(true);
    }
  });

  it("never lets a trial slip between two runs", () => {
    // A window narrower than the gap between runs means a trial can pass
    // through it unseen and never be warned before the charge.
    expect(reminder).toBeDefined();
    expect(TRIAL_REMINDER.windowHours).toBeGreaterThanOrEqual(
      intervalHours(reminder!.schedule),
    );
  });

  it("never lets the warning go out early", () => {
    // The first matching run sends, and trialReminderSentAt stops the rest,
    // so the far edge of the window is when the email actually lands. A
    // [24,48] window under an hourly cron mails everyone two days ahead
    // while reading like a 24-hour warning; that is the shape this catches.
    expect(TRIAL_REMINDER.windowHours).toBeLessThanOrEqual(
      2 * intervalHours(reminder!.schedule),
    );
  });
});

describe("the CSP lets the payment finish", () => {
  const config = readFileSync(join(ROOT, "next.config.ts"), "utf8");

  /** The value of one directive, as the header will carry it. */
  function directive(name: string): string {
    const line = config
      .split("\n")
      .find((l) => l.includes(`"${name} `) || l.includes(`\`${name} `));
    expect(line, `${name} is not in the CSP`).toBeDefined();
    return line!;
  }

  it("frames the 3-D Secure challenge", () => {
    // The challenge is an iframe on hooks.stripe.com. Drop it and the form
    // works all the way to the last click, then dies silently on every card
    // whose bank asks for authentication -- which in the EU is nearly all
    // of them, and which no test card in the happy path will ever show.
    expect(directive("frame-src")).toContain("https://hooks.stripe.com");
  });

  it("allows the origins Stripe.js spreads its frames over", () => {
    expect(directive("frame-src")).toContain("https://*.js.stripe.com");
    expect(directive("script-src")).toContain("https://*.js.stripe.com");
  });

  it("lets the Element talk to the API", () => {
    expect(directive("connect-src")).toContain("https://api.stripe.com");
  });
});

describe("the Element and the subscription offer the same payment methods", () => {
  it("builds the Element from the shared list", () => {
    // Two literals that must match are a bug waiting for whoever edits one
    // of them. The failure is silent on the server: Stripe.js refuses in
    // the browser, so nothing is logged and the customer only sees that
    // the payment did not go through.
    const form = readFileSync(
      join(ROOT, "components/billing/payment-form.tsx"),
      "utf8",
    );
    const uses = form.match(
      /paymentMethodTypes: \[\.\.\.PAYMENT_METHOD_TYPES\]/g,
    );
    // One for the trial's setup mode, one for the immediate charge.
    expect(uses?.length).toBe(2);
  });
});
