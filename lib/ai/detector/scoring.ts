import type { Locale } from "@/lib/i18n/routing";

import {
  AGGREGATION,
  BANDS,
  budgetFor,
  SIGNALS,
  type SignalId,
} from "./weights";
import type { Band, SignalEvidence } from "./types";

// Turning measurements into evidence, and evidence into a band.

/**
 * Saturating, never linear in the count: seven em dashes are worth a good
 * deal more than one and nowhere near seven times as much (architecture doc
 * section 3.4). Density, not the raw count, is what saturates -- four
 * artefacts in 200 words and four in 4,000 are different findings.
 */
export function saturate(density: number, d50: number): number {
  if (density <= 0) return 0;
  return 1 - Math.pow(2, -density / d50);
}

/** Maps a continuous measure onto 0-1 between a human and a machine anchor. */
export function ramp(value: number, human: number, machine: number): number {
  const t = (value - human) / (machine - human);
  return Math.max(0, Math.min(1, t));
}

/**
 * Deliberately asymmetric. Missing generated text costs a miss; marking a
 * person costs an accusation, and this tool gets pointed at students. The
 * thresholds in weights.ts sit high for that reason and are the first thing
 * to turn during calibration.
 */
export function bandFor(score: number, locale: Locale): Exclude<Band, "gris"> {
  const bands = BANDS[locale];
  if (score >= bands.rojo) return "rojo";
  if (score >= bands.amarillo) return "amarillo";
  return "verde";
}

function base(id: SignalId) {
  return { id, level: SIGNALS[id].level, weight: SIGNALS[id].weight };
}

/** Null when the signal does not apply, or the sample is too short. */
export function countEvidence(
  id: SignalId,
  locale: Locale,
  count: number,
  wordCount: number,
  values: Record<string, string | number>,
  samples?: string[],
): SignalEvidence | null {
  const spec = SIGNALS[id];
  if (spec.kind !== "count") throw new Error(`${id} is not a count signal`);

  const d50 = spec.d50[locale];
  if (d50 === null) return null;
  // `as const satisfies` keeps the literal shapes, so an optional field is
  // absent rather than undefined on the entries that do not declare it.
  const floor = "minWords" in spec ? (spec.minWords as number) : 0;
  if (wordCount < floor) return null;
  if (count === 0) return null;

  const density = count / Math.max(wordCount / 1000, 0.001);
  const saturated = saturate(density, d50);
  return {
    ...base(id),
    count,
    density,
    saturated,
    contribution: spec.weight * saturated,
    values: { ...values, count, per1000: Number(density.toFixed(1)) },
    ...(samples?.length ? { samples: samples.slice(0, 3) } : {}),
  };
}

export function rampEvidence(
  id: SignalId,
  locale: Locale,
  value: number,
  values: Record<string, string | number> = {},
): SignalEvidence | null {
  const spec = SIGNALS[id];
  if (spec.kind !== "ramp") throw new Error(`${id} is not a ramp signal`);

  const anchors = spec.anchors[locale];
  if (anchors === null) return null;

  const saturated = ramp(value, anchors.human, anchors.machine);
  return {
    ...base(id),
    count: 0,
    density: value,
    saturated,
    contribution: spec.weight * saturated,
    values: { ...values, value: Number(value.toFixed(2)) },
  };
}

/**
 * Absence signals are all or nothing, and only above their own word floor.
 * "No typos in 200 words" is not information; in 1,500 it is.
 */
export function absenceEvidence(
  id: SignalId,
  locale: Locale,
  holds: boolean,
  wordCount: number,
): SignalEvidence | null {
  const spec = SIGNALS[id];
  if (spec.kind !== "absence")
    throw new Error(`${id} is not an absence signal`);
  if (!spec.applies[locale]) return null;
  if (!holds || wordCount < spec.minWords) return null;

  return {
    ...base(id),
    count: 1,
    density: 1,
    saturated: 1,
    contribution: spec.weight,
    values: { words: wordCount },
  };
}

/**
 * Index on 0-100, as a share of what this language could have scored.
 * Signals that did not fire contribute nothing, which is the point: absence
 * of evidence is not evidence. Not clamped away from 0 -- the "never show
 * 0 % or 100 %" rule is about a displayed probability, and this is not one.
 */
export function scoreOf(signals: SignalEvidence[], locale: Locale): number {
  const total = signals.reduce((acc, s) => acc + s.contribution, 0);
  return Math.round((total / budgetFor(locale)) * 100);
}

/**
 * A mixed text is the normal case: three paragraphs written, the fourth
 * generated. Averaging every window hides exactly that (architecture doc
 * section 6), so the top third of the windows gets counted again.
 *
 * Counted *again*, not counted alone. Letting the top third decide on its
 * own reads the same for a generated block and for a stretch of unusually
 * even human sentences -- four sentences are not enough to tell them apart,
 * and the fixtures in fixtures.ts measure both at about 48. What separates
 * them is how much of the text reads that way, which is exactly what a
 * weighted mean measures. See the note on AGGREGATION in weights.ts.
 */
export function aggregate(windowScores: number[]): number {
  if (windowScores.length === 0) return 0;

  const sorted = [...windowScores].sort((a, b) => b - a);
  const take = Math.max(1, Math.round(sorted.length * AGGREGATION.topFraction));
  const top = sorted.slice(0, take);

  const sum = windowScores.reduce((a, b) => a + b, 0);
  const extra = top.reduce((a, b) => a + b, 0) * (AGGREGATION.topWeight - 1);
  const weight = windowScores.length + top.length * (AGGREGATION.topWeight - 1);

  return Math.round((sum + extra) / weight);
}
