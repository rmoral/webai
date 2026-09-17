import type { Locale } from "@/lib/i18n/routing";

import { countEvidence, absenceEvidence } from "./scoring";
import type { RawText, SignalEvidence } from "./types";

// Level A. Physical traces, not inference: when one of these fires it fires
// for a reason, which is why the evidence list can quote it back.
//
// Every function here takes RawText and only RawText. Normalising first
// destroys most of what this file looks for -- a non-breaking space becomes a
// space, a curly quote becomes a straight one -- so the ordering is enforced
// by the type, not by a comment someone can skip past. See types.ts.
//
// What is measured is the same in both languages; what it is worth is not,
// and that lives in the anchors in weights.ts. A curly apostrophe is a trace
// in Spanish and the default output of every English word processor.

const EMOJI_BULLETS = /^[\s]*(?:✅|❌|🚀|📌|💡|🔹|🔸|⭐|✨|👉|📊|🎯|⚡)/gmu;

function countMatches(raw: string, pattern: RegExp): string[] {
  return [...raw.matchAll(pattern)].map((m) => m[0]);
}

/** Words mixing Latin with Cyrillic or Greek: the signature of an evasion tool. */
function homoglyphWords(raw: string): string[] {
  const found: string[] = [];
  for (const [word] of raw.matchAll(/\p{L}+/gu)) {
    if (
      /\p{Script=Latin}/u.test(word) &&
      /[\p{Script=Cyrillic}\p{Script=Greek}]/u.test(word)
    ) {
      found.push(word);
    }
  }
  return found;
}

/** Runs of consecutive lines numbered 1., 2., 3. with no gap or restart. */
function perfectNumberedItems(raw: string): number {
  const numbers = raw
    .split("\n")
    .map((line) => /^\s*(\d+)[.)]\s+\S/.exec(line)?.[1])
    .map((n) => (n === undefined ? null : Number(n)));

  let total = 0;
  let run = 0;
  for (let i = 0; i < numbers.length; i++) {
    const n = numbers[i];
    const previous = i > 0 ? numbers[i - 1] : null;
    if (n !== null && previous !== null && n === previous + 1) {
      run = run === 0 ? 2 : run + 1;
    } else {
      if (run >= 3) total += run;
      run = 0;
    }
  }
  if (run >= 3) total += run;
  return total;
}

/**
 * Every ? and ! carries its opening ¿ or ¡. A person in a hurry drops them.
 * Spanish only -- there is nothing to drop in English.
 */
function openersAlwaysPresent(raw: string): boolean {
  const closers = countMatches(raw, /[?!]/g).length;
  const openers = countMatches(raw, /[¿¡]/g).length;
  return closers >= 3 && openers >= closers;
}

/** Not one double space, not one space before a comma, in a long text. */
function spacingFlawless(raw: string): boolean {
  return !/ {2}/.test(raw) && !/\s+[,;.]/.test(raw);
}

/** No duplicated adjacent word, no sentence abandoned without punctuation. */
function noFossilCorrections(raw: string): boolean {
  const duplicated = /\b(\p{L}{3,})\s+\1\b/iu.test(raw);
  const abandoned = raw
    .split("\n")
    .some(
      (line) => line.trim().length > 40 && !/[.!?…:;»"]$/.test(line.trim()),
    );
  return !duplicated && !abandoned;
}

/**
 * All of level A, measured over one slice of raw text. `wordCount` is the
 * slice's own length, so density is local and a short window is not punished
 * for being short.
 */
export function forensicSignals(
  raw: RawText,
  wordCount: number,
  locale: Locale,
): SignalEvidence[] {
  const count = (
    id: Parameters<typeof countEvidence>[0],
    found: string[] | number,
    samples?: string[],
  ) =>
    countEvidence(
      id,
      locale,
      typeof found === "number" ? found : found.length,
      wordCount,
      {},
      samples,
    );

  const dashes = countMatches(raw, /\s—\s/g);
  const enDashes = countMatches(raw, /\s–\s|\p{L}–\p{L}/gu);
  const invisible = countMatches(raw, /[​⁠‌﻿]/g);
  const homoglyphs = homoglyphWords(raw);
  const curly = countMatches(raw, /[“”‘]|’(?!\p{L})/gu);
  const apostrophes = countMatches(raw, /\p{L}’\p{L}/gu);
  const spaces = countMatches(raw, /[   ]/g);
  const ellipsis = countMatches(raw, /…/g);
  const markdown = countMatches(raw, /\*\*[^*\n]+\*\*|^#{1,6}\s|^-{3,}$/gm);
  const emojis = countMatches(raw, EMOJI_BULLETS);
  const bullets = countMatches(raw, /^\s*[•‣▪–-]\s+\S/gm);
  const numbered = perfectNumberedItems(raw);
  const boldHeadings = countMatches(raw, /^\s*\*\*[^*\n]+:\*\*/gm);

  const signals: (SignalEvidence | null)[] = [
    count("raya_espaciada", dashes, dashes),
    count("caracteres_invisibles", invisible),
    count("homoglifos", homoglyphs, homoglyphs),
    count("comillas_curvas", curly),
    count("espacios_especiales", spaces),
    count("semirraya_como_raya", enDashes),
    count("puntos_suspensivos_unicode", ellipsis),
    count("apostrofo_tipografico", apostrophes),
    count("markdown_superviviente", markdown, markdown),
    count("emojis_estructurales", emojis),
    count("vinetas_uniformes", bullets),
    count("listas_numeradas_perfectas", numbered),
    count("encabezado_negrita_dos_puntos", boldHeadings, boldHeadings),
    absenceEvidence(
      "apertura_interrogacion_perfecta",
      locale,
      openersAlwaysPresent(raw),
      wordCount,
    ),
    absenceEvidence(
      "espaciado_impecable",
      locale,
      spacingFlawless(raw),
      wordCount,
    ),
    absenceEvidence(
      "ausencia_correcciones_fosiles",
      locale,
      noFossilCorrections(raw),
      wordCount,
    ),
  ];

  return signals.filter((s): s is SignalEvidence => s !== null);
}
