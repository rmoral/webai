import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { track } from "@/lib/analytics/events";

// The funnel, held together from outside the type system.
//
// Two things break silently here and neither shows up in a review. An
// event emitted under a name nobody declared simply never appears in the
// dashboard, and a property carrying user text leaks it to a third party
// in a payload nobody reads. Both are cheap to check by reading the source
// that emits them.

const ROOT = process.cwd();
const SOURCE_DIRS = ["app", "components", "lib"];

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.tsx?$/.test(entry) ? [path] : [];
  });
}

const FILES = SOURCE_DIRS.flatMap((dir) => sources(join(ROOT, dir))).map(
  (path) => ({
    path: path.slice(ROOT.length + 1),
    text: readFileSync(path, "utf8"),
  }),
);

/** The event names declared in the FunnelEvents interface. */
const DECLARED = (() => {
  const source = readFileSync(join(ROOT, "lib/analytics/events.ts"), "utf8");
  const body = source.slice(
    source.indexOf("export interface FunnelEvents {"),
    source.indexOf("export type FunnelEvent"),
  );
  return new Set(Array.from(body.matchAll(/^ {2}(\w+):/gm), (m) => m[1]));
})();

/**
 * Every `track(client, "name", { … })` in the codebase, with its payload.
 *
 * The object is read by matching braces rather than by regex: a payload
 * spans lines and contains nested objects, and a lazy pattern stops at the
 * first `}` while a greedy one swallows the rest of the function -- which
 * is how the first version of this test reported the body of a fetch call
 * as an analytics property.
 */
function payloadsIn(text: string): string[] {
  const payloads: string[] = [];
  const call = /track\(\s*\w+\s*,\s*"[\w]+"\s*,\s*/g;
  for (let match = call.exec(text); match; match = call.exec(text)) {
    const start = match.index + match[0].length;
    if (text[start] !== "{") continue;
    let depth = 0;
    for (let i = start; i < text.length; i++) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}" && --depth === 0) {
        payloads.push(text.slice(start, i + 1));
        break;
      }
    }
  }
  return payloads;
}

const CALLS = FILES.flatMap(({ path, text }) =>
  payloadsIn(text).map((payload) => ({ path, payload })),
);

const NAMES = FILES.flatMap(({ path, text }) =>
  Array.from(text.matchAll(/track\(\s*\w+\s*,\s*"(\w+)"/g), (match) => ({
    path,
    name: match[1],
  })),
);

describe("the funnel events", () => {
  it("covers every event the plan measures", () => {
    // C0: without these names there is no ratio to judge anything else by.
    for (const required of [
      "tool_run",
      "tool_result",
      "antibot_error",
      "wall_shown",
      "wall_dismissed",
      "signup_start",
      "signup_done",
      "pricing_view",
      "checkout_view",
      "purchase",
      "cancel_start",
      "cancel_done",
    ]) {
      expect(DECLARED).toContain(required);
    }
  });

  it("is emitted only under declared names", () => {
    expect(NAMES.length).toBeGreaterThan(0);
    for (const { path, name } of NAMES) {
      expect(DECLARED, `${name} in ${path}`).toContain(name);
    }
  });

  it("never carries what the user wrote or who they are", () => {
    // CLAUDE.md forbids sending user text or an email to Sentry or
    // PostHog. An analytics payload is the easiest place to break that by
    // accident: one spread of a form's state and it is gone.
    const forbidden =
      /\b(text|input|output|email|prompt|content|body|ip|token|password)\s*[:,}]/;
    expect(CALLS.length).toBeGreaterThan(0);
    for (const { path, payload } of CALLS) {
      expect(payload, `${path}: ${payload}`).not.toMatch(forbidden);
    }
  });

  it("does nothing when analytics is not initialised", () => {
    // The key is absent in development and in every test run, and a funnel
    // that throws in that case takes the page with it.
    expect(() =>
      track(undefined, "pricing_view", { cycle: "yearly", logged_in: false }),
    ).not.toThrow();
  });

  it("passes the properties straight through", () => {
    const captured: [string, unknown][] = [];
    track(
      { capture: (event, props) => captured.push([event, props]) },
      "tool_result",
      { tool: "humanize", ms: 1200, truncated: false },
    );
    expect(captured).toEqual([
      ["tool_result", { tool: "humanize", ms: 1200, truncated: false }],
    ]);
  });
});

describe("what reaches Google", () => {
  /** Stands in for the tag, which only exists in a browser. */
  function withGtag(run: () => void): [string, Record<string, unknown>][] {
    const seen: [string, Record<string, unknown>][] = [];
    const gtag = (kind: string, name: string, props: Record<string, unknown>) =>
      kind === "event" && seen.push([name, props]);
    Object.defineProperty(globalThis, "window", {
      value: { gtag },
      configurable: true,
      writable: true,
    });
    try {
      run();
    } finally {
      Reflect.deleteProperty(globalThis, "window");
    }
    return seen;
  }

  it("sends the events advertising is optimised on", () => {
    const seen = withGtag(() => {
      track(undefined, "signup_done", { method: "google", next: "/app" });
      track(undefined, "checkout_view", {
        plan: "pro",
        cycle: "yearly",
        logged_in: true,
      });
    });
    expect(seen.map(([name]) => name)).toEqual([
      "signup_done",
      "checkout_view",
    ]);
  });

  it("leaves the rest of the funnel to PostHog", () => {
    // GA4 is here to measure advertising. A property carrying every run of
    // every tool measures the product badly and the advertising no better.
    const seen = withGtag(() => {
      track(undefined, "tool_run", {
        tool: "humanize",
        logged_in: false,
        words_in: 120,
        quota_left: 380,
      });
      track(undefined, "wall_shown", {
        variant: "inline",
        reason: "quota",
        plan: "free",
      });
    });
    expect(seen).toEqual([]);
  });

  it("puts a currency beside the amount, because Ads will not bid without one", () => {
    const seen = withGtag(() =>
      track(undefined, "payment_succeeded", {
        plan: "unlimited",
        cycle: "monthly",
        trial: false,
        value: 29.99,
      }),
    );
    expect(seen[0][1]).toMatchObject({ value: 29.99, currency: "USD" });
  });

  it("sends nothing at all when the tag never loaded", () => {
    // No measurement id, or a visitor Consent Mode is holding: `gtag` is
    // simply not there, and a funnel that throws over it takes the page.
    Object.defineProperty(globalThis, "window", {
      value: {},
      configurable: true,
      writable: true,
    });
    expect(() =>
      track(undefined, "signup_done", { method: "google", next: "/app" }),
    ).not.toThrow();
    Reflect.deleteProperty(globalThis, "window");
  });

  it("keeps `purchase` out: the webhook has no browser to attach it to", () => {
    const seen = withGtag(() =>
      track(undefined, "purchase", {
        plan: "pro",
        cycle: "yearly",
        amount: 89.88,
        trial: false,
      }),
    );
    expect(seen).toEqual([]);
  });
});
