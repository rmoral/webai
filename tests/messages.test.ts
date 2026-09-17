import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import es from "@/messages/es.json";
import { routing } from "@/lib/i18n/routing";

// Spanish is the reference catalogue (global.d.ts types every key against
// it), so a key added in Spanish and forgotten in English would type-check
// and then render the raw key path to an English visitor at runtime. This
// file is what catches that, and the drift it catches is the normal kind:
// nobody forgets a whole page, everybody forgets one string.

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

/** Every leaf path, so "a.b.0.c" is compared and not just "a". */
function paths(value: Json, prefix = ""): string[] {
  if (value === null || typeof value !== "object") return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    paths(child as Json, prefix ? `${prefix}.${key}` : key),
  );
}

/** The {placeholders} a message expects, ICU plural bodies excluded. */
function placeholders(message: string): Set<string> {
  const found = new Set<string>();
  for (const [, name] of message.matchAll(/\{(\w+)[,}]/g)) found.add(name);
  return found;
}

function leaves(value: Json, prefix = ""): Map<string, string> {
  const out = new Map<string, string>();
  if (typeof value === "string") {
    out.set(prefix, value);
  } else if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      for (const [k, v] of leaves(
        child as Json,
        prefix ? `${prefix}.${key}` : key,
      )) {
        out.set(k, v);
      }
    }
  }
  return out;
}

const spanish = leaves(es as Json);
const english = leaves(en as Json);

describe("message catalogues", () => {
  it("covers every declared locale with a file", () => {
    expect(routing.locales).toEqual(["es", "en"]);
  });

  it("has no key in Spanish that is missing from English", () => {
    const missing = paths(es as Json).filter(
      (key) => !paths(en as Json).includes(key),
    );
    expect(missing, `missing in en.json:\n${missing.join("\n")}`).toEqual([]);
  });

  it("has no key in English that does not exist in Spanish", () => {
    // A leftover key is dead weight and usually the residue of a rename
    // that only landed in one file.
    const extra = paths(en as Json).filter(
      (key) => !paths(es as Json).includes(key),
    );
    expect(extra, `not in es.json:\n${extra.join("\n")}`).toEqual([]);
  });

  it("uses the same placeholders on both sides of every message", () => {
    // A dropped {words} does not throw: next-intl renders the sentence
    // without the number, so the English copy quietly loses the limit it
    // was there to state.
    const wrong: string[] = [];
    for (const [key, value] of spanish) {
      const other = english.get(key);
      if (other === undefined) continue;
      const a = [...placeholders(value)].sort();
      const b = [...placeholders(other)].sort();
      if (a.join(",") !== b.join(",")) {
        wrong.push(`${key}: es{${a}} en{${b}}`);
      }
    }
    expect(wrong, wrong.join("\n")).toEqual([]);
  });

  it("leaves no message empty in either language", () => {
    for (const [locale, catalogue] of [
      ["es", spanish],
      ["en", english],
    ] as const) {
      for (const [key, value] of catalogue) {
        expect(value.trim(), `${locale}: ${key}`).not.toBe("");
      }
    }
  });

  it("does not ship Spanish text under an English key", () => {
    // Cheap heuristic for a copy-paste that was never translated. Proper
    // nouns are the honest exception: the GDPR section names the Spanish
    // data-protection authority, and it keeps its name in English.
    const PROPER_NOUNS = [/Agencia Española de Protección de Datos/g];

    const suspicious = [...english]
      .filter(([, value]) => {
        const stripped = PROPER_NOUNS.reduce(
          (text, name) => text.replace(name, ""),
          value,
        );
        // ¿ and ¡ never appear in English at all; ñ only in a borrowed name.
        return /[¿¡]/.test(stripped) || /ñ/.test(stripped);
      })
      .map(([key]) => key);
    expect(suspicious, suspicious.join("\n")).toEqual([]);
  });
});
