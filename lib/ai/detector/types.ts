import type { Locale } from "@/lib/i18n/routing";

import type { SignalId, SignalLevel } from "./weights";

// The public contract. Phase 2 adds a calibrated percentage and Phase 3 a
// per-sentence heat map; both arrive as new optional fields, so nothing
// written against Phase 1 has to change. `score` is documented and tested as
// an index precisely so a probability can never quietly take its place.

export type Band = "verde" | "amarillo" | "rojo" | "gris";

declare const rawBrand: unique symbol;
declare const normalizedBrand: unique symbol;

/**
 * Text exactly as the user sent it. Level A reads only this.
 *
 * The forensic signals live in the bytes -- a non-breaking space, a curly
 * quote, an em dash with English spacing. Normalising first destroys them,
 * which the architecture doc calls the most common way to get this wrong
 * (sections 3 and 11). Making raw and normalised different types means a
 * forensic signal fed normalised text does not compile, rather than silently
 * returning zero for the rest of the product's life.
 */
export type RawText = string & { readonly [rawBrand]: true };

/** Unicode-normalised text. Level B reads only this. */
export type NormalizedText = string & { readonly [normalizedBrand]: true };

export interface SignalEvidence {
  id: SignalId;
  level: SignalLevel;
  /** From weights.ts, on the 0-1000 budget. */
  weight: number;
  /** Raw occurrences. Zero for continuous measures. */
  count: number;
  /** Per 1,000 words for counted signals; the measure itself otherwise. */
  density: number;
  /** 0-1 after saturation or ramping. */
  saturated: number;
  /** weight times saturated. What this signal actually bought. */
  contribution: number;
  /**
   * Values for the `detectorSignals.<id>.explanation` message.
   *
   * The engine emits measurements, not sentences. It used to build the
   * Spanish prose itself, which meant a second language would have meant a
   * second engine -- and it made the signals untestable without reading
   * their copy. The label and the wording live in the message catalogue,
   * keyed by `id`.
   */
  values: Record<string, string | number>;
  /** Concrete excerpts, so the evidence can be checked rather than believed. */
  samples?: string[];
}

export interface AnalysisWindow {
  index: number;
  /** Inclusive sentence indices, for locating the block. */
  sentenceRange: [number, number];
  score: number;
  band: Band;
  signals: SignalEvidence[];
}

export interface DetectorAnalysis {
  /** Contract and weights version, so a stored result stays readable. */
  version: string;
  /** Which pipeline produced this. */
  phase: 1 | 2 | 3;
  band: Band;
  /**
   * 0-100 index of measured style patterns. NOT a probability, and never to
   * be rendered as one. The percentage belongs to `calibrated`, which only a
   * trained model may fill.
   */
  score: number;
  reliable: boolean;
  reason?: "texto_corto" | "frases_insuficientes";
  /**
   * Whether level A found enough to let the band leave green. False means
   * the rhythm measured high but nothing corroborated it, so the score was
   * held below the yellow threshold. See CORROBORATION in weights.ts.
   *
   * Absent on a grey result, where no band was computed at all.
   */
  corroborated?: boolean;
  /** The language the text was measured as. Anchors differ per language. */
  locale: Locale;
  words: number;
  sentenceCount: number;
  paragraphCount: number;
  /** Document level, ordered by contribution. */
  signals: SignalEvidence[];
  windows: AnalysisWindow[];

  /** Phase 2. Absent here by design. */
  calibrated?: {
    probability: number;
    interval: [number, number];
    model: string;
  };
  /** Phase 3. Absent here by design; `windows` is this at coarser grain. */
  sentences?: { index: number; text: string; score: number; band: Band }[];
}
