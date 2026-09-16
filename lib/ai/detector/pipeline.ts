import { forensicSignals } from "./forensic";
import { rhythmSignals } from "./rhythm";
import { aggregate, bandFor, scoreOf } from "./scoring";
import { asRaw, normalize, splitSentences, words } from "./segment";
import { RELIABILITY, WINDOW } from "./weights";
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

export const DETECTOR_VERSION = "1.0.0";

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

function measure(raw: RawText, withParagraphs: boolean): SignalEvidence[] {
  const normalized = normalize(raw);
  const wordCount = words(normalized).length;
  return [
    ...forensicSignals(raw, wordCount),
    ...rhythmSignals(normalized, { withParagraphs }),
  ];
}

export function analyze(text: string): DetectorAnalysis {
  const raw = asRaw(text);
  const normalized = normalize(raw);
  const sentences = splitSentences(raw);
  const wordCount = words(normalized).length;
  const paragraphCount = normalized
    .split(/\n\s*\n+/)
    .filter((p) => p.trim()).length;

  const base = {
    version: DETECTOR_VERSION,
    phase: 1 as const,
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
      signals: forensicSignals(raw, wordCount).sort(
        (a, b) => b.contribution - a.contribution,
      ),
      windows: [],
    };
  }

  const documentSignals = measure(raw, true).sort(
    (a, b) => b.contribution - a.contribution,
  );

  const windows: AnalysisWindow[] = windowsOf(sentences).map(
    ([from, to], index) => {
      const slice = asRaw(sentences.slice(from, to + 1).join(" "));
      const signals = measure(slice, false);
      const score = scoreOf(signals);
      return {
        index,
        sentenceRange: [from, to] as [number, number],
        score,
        band: bandFor(score),
        signals: signals.sort((a, b) => b.contribution - a.contribution),
      };
    },
  );

  // The document reading is the floor; a run of four sentences that reads far
  // more machine-like raises it. Averaging alone would hide the mixed text
  // that is the normal case -- three paragraphs written, the fourth generated.
  const score = Math.max(
    scoreOf(documentSignals),
    aggregate(windows.map((w) => w.score)),
  );

  return {
    ...base,
    band: bandFor(score),
    score,
    reliable: true,
    signals: documentSignals,
    windows,
  };
}
