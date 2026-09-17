import type { Locale } from "@/lib/i18n/routing";

import { forensicSignals } from "./forensic";
import { rhythmSignals } from "./rhythm";
import { aggregate, bandFor, scoreOf } from "./scoring";
import { asRaw, normalize, splitSentences, words } from "./segment";
import { BANDS, CORROBORATION, RELIABILITY, WINDOW } from "./weights";
import type {
  AnalysisWindow,
  DetectorAnalysis,
  RawText,
  SignalEvidence,
} from "./types";

// Phase 1 of the architecture doc: level A complete plus the rhythm variables
// of level B, weights fixed by hand, no corpus and no model.
//
//   raw text
//      |-- [0] forensic capture          <- ON THE UNNORMALISED TEXT
//      |-- [1] normalise and segment
//      |-- [2] rhythm features
//      |-- [3] score per sliding window
//      |-- [4] aggregate
//      `-- [5] band plus evidence
//
// Step 0 comes first and cannot be reordered by accident: forensicSignals
// takes RawText, normalize is the only producer of NormalizedText, and the
// rhythm functions take nothing else. Swapping the two lines is a type error.
//
// The locale is a parameter, not a detected property of the text: it is the
// language the visitor is reading, and it selects a whole set of anchors.
// Measuring English prose against Spanish anchors would flag it, which is
// the failure this tool exists not to commit.

export const DETECTOR_VERSION = "2.0.0";

/**
 * Sentences are cut from the raw text, so both levels index the same array.
 * Cutting them twice -- once raw, once normalised -- would risk the two
 * drifting apart on a text where normalisation moves a boundary.
 */
function windowsOf(sentences: string[]): [number, number][] {
  if (sentences.length < WINDOW.minSentences) {
    return [[0, sentences.length - 1]];
  }
  const ranges: [number, number][] = [];
  for (
    let start = 0;
    start + WINDOW.size <= sentences.length;
    start += WINDOW.step
  ) {
    ranges.push([start, start + WINDOW.size - 1]);
  }
  return ranges;
}

function measure(
  raw: RawText,
  locale: Locale,
  withParagraphs: boolean,
): SignalEvidence[] {
  const normalized = normalize(raw);
  const wordCount = words(normalized).length;
  return [
    ...forensicSignals(raw, wordCount, locale),
    ...rhythmSignals(normalized, locale, { withParagraphs }),
  ];
}

export function analyze(text: string, locale: Locale = "es"): DetectorAnalysis {
  const raw = asRaw(text);
  const normalized = normalize(raw);
  const sentences = splitSentences(raw, locale);
  const wordCount = words(normalized).length;
  const paragraphCount = normalized
    .split(/\n\s*\n+/)
    .filter((p) => p.trim()).length;

  const base = {
    version: DETECTOR_VERSION,
    phase: 1 as const,
    locale,
    words: wordCount,
    sentenceCount: sentences.length,
    paragraphCount,
  };

  if (
    wordCount < RELIABILITY.minWords ||
    sentences.length < RELIABILITY.minSentences
  ) {
    // Grey is mandatory here (architecture doc section 8): below roughly 200
    // words no statistical measure has the power to say anything, and putting
    // a number on it would be inventing one. The forensic evidence still
    // stands -- an invisible character is an invisible character at any
    // length -- so it is returned; the rhythm statistics are not.
    return {
      ...base,
      band: "gris",
      score: 0,
      reliable: false,
      reason:
        wordCount < RELIABILITY.minWords
          ? "texto_corto"
          : "frases_insuficientes",
      signals: forensicSignals(raw, wordCount, locale).sort(
        (a, b) => b.contribution - a.contribution,
      ),
      windows: [],
    };
  }

  const documentSignals = measure(raw, locale, true).sort(
    (a, b) => b.contribution - a.contribution,
  );

  const windows: AnalysisWindow[] = windowsOf(sentences).map(
    ([from, to], index) => {
      const slice = asRaw(sentences.slice(from, to + 1).join(" "));
      const signals = measure(slice, locale, false);
      const score = scoreOf(signals, locale);
      return {
        index,
        sentenceRange: [from, to] as [number, number],
        score,
        band: bandFor(score, locale),
        signals: signals.sort((a, b) => b.contribution - a.contribution),
      };
    },
  );

  // The document reading is the floor; a run of four sentences that reads far
  // more machine-like raises it. Averaging alone would hide the mixed text
  // that is the normal case -- three paragraphs written, the fourth generated.
  const measured = Math.max(
    scoreOf(documentSignals, locale),
    aggregate(windows.map((w) => w.score)),
  );

  // Rhythm alone may not accuse anybody: careful second-language writing
  // measures the same as generated text on every rhythm signal, in both
  // languages. Leaving green needs a second, independent kind of evidence
  // -- the physical traces of a paste, which are facts about the bytes.
  // See CORROBORATION in weights.ts for the numbers behind this.
  const forensic = documentSignals
    .filter((s) => s.level === "A")
    .reduce((total, s) => total + s.contribution, 0);
  const corroborated = forensic >= CORROBORATION;
  const score = corroborated
    ? measured
    : Math.min(measured, BANDS[locale].amarillo - 1);

  return {
    ...base,
    band: bandFor(score, locale),
    score,
    reliable: true,
    corroborated,
    signals: documentSignals,
    windows,
  };
}
