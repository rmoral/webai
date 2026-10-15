import { diffWords } from "diff";
import { describe, expect, it } from "vitest";

import { applyDecisions, toSegments } from "@/components/tools/correct-review";

// F2-09. The review is built from a word diff in the browser; what has to
// hold is that each change is one row, and that copying gives back the
// reader's text with exactly the changes they kept.

const BEFORE =
  "En el mundo actual las redes sociales, plataformas como Instagram, son sobretodo una parte de la vida.";
const AFTER =
  "En el mundo actual, las redes sociales. Plataformas como Instagram, son sobre todo una parte de la vida.";

describe("toSegments", () => {
  it("pairs a removal with the insertion after it, and keeps lone ones", () => {
    const changes = toSegments(diffWords(BEFORE, AFTER)).filter(
      (s) => s.kind === "change",
    );
    // As the design lists them: «∅ → ,», «, plataformas → . Plataformas».
    expect(changes.map((c) => [c.before, c.after])).toEqual([
      ["", ", "],
      [", plataformas", ". Plataformas"],
      ["sobretodo", "sobre todo"],
    ]);
  });

  it("gives every change its own id", () => {
    const ids = toSegments(diffWords(BEFORE, AFTER))
      .filter((s) => s.kind === "change")
      .map((s) => (s.kind === "change" ? s.id : -1));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("applyDecisions", () => {
  const segments = toSegments(diffWords(BEFORE, AFTER));

  it("applies pending and accepted changes", () => {
    expect(applyDecisions(segments, {})).toBe(AFTER);
    expect(applyDecisions(segments, { 0: "accepted" })).toBe(AFTER);
  });

  it("puts back what the reader ignored, and only that", () => {
    expect(applyDecisions(segments, { 2: "ignored" })).toBe(
      "En el mundo actual, las redes sociales. Plataformas como Instagram, son sobretodo una parte de la vida.",
    );
  });

  it("keeps what the run did not reach as it was written", () => {
    expect(applyDecisions(segments, {}, " Y un final sin tocar")).toBe(
      `${AFTER} Y un final sin tocar`,
    );
  });
});
