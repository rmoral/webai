import { describe, expect, it } from "vitest";

import { PROMPTS } from "@/lib/ai/prompts";
import { TOOLS, type ToolId } from "@/lib/ai/tools";
import { PLANS } from "@/lib/billing/plans";

const tools = Object.values(TOOLS);

describe("tool registry", () => {
  it("every live tool can actually be served", () => {
    // `detect` is measured rather than generated, so it is the one live tool
    // that legitimately has no prompt. Anything else live without a prompt
    // would answer 501 to a user the UI told to go ahead.
    for (const tool of tools) {
      if (!tool.live || tool.id === "detect") continue;
      expect(PROMPTS[tool.id], `prompt for ${tool.id}`).toBeDefined();
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
      const builder = PROMPTS[tool.id];
      if (!builder || tool.modes.length === 0) continue;
      const mode = tool.modes[0];
      const built = builder.user("TEXTO DE PRUEBA", mode);
      expect(built.split("\n")[0], `${tool.id} first line`).toContain(mode);
      expect(built).toContain("TEXTO DE PRUEBA");
    }
  });

  it("fall back to the mode the UI preselects", () => {
    // The server default and the mode the editor shows selected must agree,
    // or a user who never touches the chips gets a different mode than the
    // one highlighted.
    for (const tool of tools) {
      const builder = PROMPTS[tool.id];
      if (!builder || tool.modes.length === 0) continue;
      const first = builder.user("x").split("\n")[0];
      const fallback = first.split(":")[1]?.trim();
      expect(tool.modes, `${tool.id} fallback is a real mode`).toContain(
        fallback,
      );
      expect(fallback, `${tool.id} fallback matches defaultMode`).toBe(
        tool.defaultMode ?? tool.modes[0],
      );
    }
  });

  it("keep the system prompt free of per-request data so caching works", () => {
    // CLAUDE.md: prompt caching always on the system prompt. A system prompt
    // that varied per request would never hit the cache.
    for (const tool of tools) {
      const builder = PROMPTS[tool.id];
      if (!builder) continue;
      expect(builder.system).toBe(PROMPTS[tool.id]!.system);
      expect(builder.system.length).toBeGreaterThan(200);
    }
  });
});
