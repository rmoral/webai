import { beforeEach, describe, expect, it, vi } from "vitest";

// The database is mocked so the two things worth asserting can be: that a
// free plan's text never reaches an INSERT at all, and that what a paid
// plan stores is not readable.
const { insert, values } = vi.hoisted(() => {
  const values = vi.fn().mockResolvedValue(undefined);
  return { values, insert: vi.fn(() => ({ values })) };
});

vi.mock("@/lib/db/client", () => ({ getDb: () => ({ insert }) }));

import { PLANS } from "@/lib/billing/plans";
import { saveDocument } from "@/lib/documents/store";

process.env.DATA_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");

const INPUT = "Un texto que el usuario considera privado.";
const OUTPUT = "El mismo texto, reescrito por el modelo.";

function save(plan: (typeof PLANS)[keyof typeof PLANS]) {
  return saveDocument({
    userId: "11111111-1111-1111-1111-111111111111",
    plan,
    tool: "humanize",
    mode: "neutro",
    inputText: INPUT,
    outputText: OUTPUT,
  });
}

beforeEach(() => {
  insert.mockClear();
  values.mockClear();
});

describe("saveDocument", () => {
  it("never writes the text of a plan without history", async () => {
    // CLAUDE.md: no guardar texto de usuarios no-Pro. The gate lives here,
    // so no call site can forget it.
    for (const plan of [PLANS.anonymous, PLANS.free]) {
      await save(plan);
    }
    expect(insert).not.toHaveBeenCalled();
  });

  it("stores a paid plan's text encrypted, never in the clear", async () => {
    await save(PLANS.pro);
    expect(insert).toHaveBeenCalledOnce();

    const row = values.mock.calls[0][0];
    for (const field of ["title", "inputText", "outputText"] as const) {
      expect(row[field], `${field} is encrypted`).toMatch(/^v1\./);
    }
    const stored = JSON.stringify(row);
    expect(stored).not.toContain(INPUT);
    expect(stored).not.toContain(OUTPUT);
    expect(stored).not.toContain("privado");
  });

  it("keeps the plan's own fields out of the guesswork", async () => {
    await save(PLANS.unlimited);
    const row = values.mock.calls[0][0];
    expect(row.tool).toBe("humanize");
    expect(row.mode).toBe("neutro");
    expect(row.userId).toBe("11111111-1111-1111-1111-111111111111");
  });

  it("swallows a database failure instead of costing the user the answer", async () => {
    // It runs after the response has already streamed: throwing here would
    // report an error for work that succeeded.
    values.mockRejectedValueOnce(new Error("connection terminated"));
    await expect(save(PLANS.pro)).resolves.toBeUndefined();
  });
});
