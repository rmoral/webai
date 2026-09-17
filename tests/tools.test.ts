import { describe, expect, it } from "vitest";

import { promptFor } from "@/lib/ai/prompts";
import { TOOLS, resolveMode, type ToolId } from "@/lib/ai/tools";
import { PLANS } from "@/lib/billing/plans";
import { routing } from "@/lib/i18n/routing";

const tools = Object.values(TOOLS);
const locales = routing.locales;

describe("tool registry", () => {
  it("every live tool can actually be served", () => {
    // `detect` is measured rather than generated, so it is the one live tool
    // that legitimately has no prompt. Anything else live without a prompt
    // would answer 501 to a user the UI told to go ahead.
    // In every language: a tool live in English with only a Spanish prompt
    // would answer Spanish to an English visitor, which is worse than 501.
    for (const tool of tools) {
      if (!tool.live || tool.id === "detect") continue;
      for (const locale of locales) {
        expect(
          promptFor(tool.id, locale),
          `prompt for ${tool.id} in ${locale}`,
        ).toBeDefined();
      }
    }
  });

  it("never links a landing that has no page behind it", () => {
    // `landing` drives the nav and the footer; a live tool must have one, or
    // the tab strip would offer a tool with nowhere to send the visitor.
    for (const tool of tools) {
      if (tool.live) expect(tool.landing, `landing for ${tool.id}`).toBe(true);
    }
  });

  it("gives every tool a unique landing path", () => {
    const paths = tools.map((t) => t.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("offers at least one tool on the free tiers", () => {
    // The acquisition funnel depends on this: a visitor with no account must
    // be able to use something.
    for (const plan of [PLANS.anonymous, PLANS.free]) {
      const usable = plan.limits.tools.filter((id) => TOOLS[id as ToolId].live);
      expect(usable.length, `usable tools on ${plan.id}`).toBeGreaterThan(0);
    }
  });

  it("only lists tools that exist in the registry", () => {
    for (const plan of Object.values(PLANS)) {
      for (const id of plan.limits.tools) {
        expect(TOOLS[id], `${plan.id} lists ${id}`).toBeDefined();
      }
    }
  });
});

describe("prompt builders", () => {
  it("put the mode on the first line and the text after it", () => {
    for (const tool of tools) {
      for (const locale of locales) {
        const builder = promptFor(tool.id, locale);
        if (!builder || tool.modes.length === 0) continue;
        const mode = tool.modes[0];
        const built = builder.user("TEXTO DE PRUEBA", mode);
        expect(
          built.split("\n")[0],
          `${tool.id}/${locale} first line`,
        ).toContain(mode);
        expect(built).toContain("TEXTO DE PRUEBA");
      }
    }
  });

  it("use the same mode identifiers in every language", () => {
    // The identifiers are Spanish words and stay that way everywhere: they
    // travel into stored usage rows, so translating them would split one
    // mode into two in the data.
    for (const tool of tools) {
      for (const mode of tool.modes) {
        for (const locale of locales) {
          const builder = promptFor(tool.id, locale);
          if (!builder) continue;
          expect(
            builder.user("x", mode).split("\n")[0],
            `${tool.id}/${locale}/${mode}`,
          ).toContain(mode);
        }
      }
    }
  });

  it("fall back to the mode the UI preselects", () => {
    // The server default and the mode the editor shows selected must agree,
    // or a user who never touches the chips gets a different mode than the
    // one highlighted.
    for (const tool of tools) {
      for (const locale of locales) {
        const builder = promptFor(tool.id, locale);
        if (!builder || tool.modes.length === 0) continue;
        const first = builder.user("x").split("\n")[0];
        const fallback = first.split(":")[1]?.trim();
        expect(
          tool.modes,
          `${tool.id}/${locale} fallback is a real mode`,
        ).toContain(fallback);
        expect(
          fallback,
          `${tool.id}/${locale} fallback matches defaultMode`,
        ).toBe(tool.defaultMode ?? tool.modes[0]);
      }
    }
  });

  it("keep the system prompt free of per-request data so caching works", () => {
    // CLAUDE.md: prompt caching always on the system prompt. A system prompt
    // that varied per request would never hit the cache.
    for (const tool of tools) {
      for (const locale of locales) {
        const builder = promptFor(tool.id, locale);
        if (!builder) continue;
        expect(builder.system).toBe(promptFor(tool.id, locale)!.system);
        expect(builder.system.length).toBeGreaterThan(200);
      }
    }
  });

  it("do not ship the Spanish prompt under the English key", () => {
    // The cheapest way this breaks is a copy-paste that leaves one language
    // pointing at the other's text, which nothing else here would catch.
    for (const tool of tools) {
      const es = promptFor(tool.id, "es");
      const en = promptFor(tool.id, "en");
      if (!es || !en) continue;
      expect(en.system, `${tool.id} en`).not.toBe(es.system);
      expect(en.system, `${tool.id} en`).toMatch(/\bEnglish\b/);
      expect(es.system, `${tool.id} es`).toMatch(/\bespañol\b/);
    }
  });
});

describe("resolveMode", () => {
  it("drops a mode left over from another tool", () => {
    // The editor is reused across tools inside /app, so the previous
    // tool's mode survives the switch. Sending it made the server reject
    // the request as malformed: "Petición no válida" on a tool the user
    // had not configured at all.
    expect(resolveMode("detect", "neutro")).toBeUndefined();
    expect(resolveMode("paraphrase", "neutro")).toBe("estandar");
    expect(resolveMode("correct", "neutro")).toBe("general");
  });

  it("keeps a mode the tool actually offers", () => {
    expect(resolveMode("humanize", "informal")).toBe("informal");
    // Shared across two tools, so switching keeps the user's choice.
    expect(resolveMode("correct", "academico")).toBe("academico");
  });

  it("falls back to the tool's own default when nothing is picked", () => {
    for (const tool of tools) {
      const resolved = resolveMode(tool.id);
      expect(resolved, `${tool.id} default`).toBe(
        tool.defaultMode ?? tool.modes[0],
      );
    }
  });

  it("only ever resolves to something the request schema accepts", () => {
    // The guarantee that matters: whatever the state history, the mode
    // sent is one this tool declares, or none at all.
    for (const tool of tools) {
      for (const chosen of [undefined, "neutro", "estandar", "inventado"]) {
        const resolved = resolveMode(tool.id, chosen);
        if (resolved !== undefined) {
          expect(tool.modes, `${tool.id} ← ${chosen}`).toContain(resolved);
        } else {
          expect(tool.modes, `${tool.id} has no modes`).toHaveLength(0);
        }
      }
    }
  });
});
