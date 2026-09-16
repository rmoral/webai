import {
  AGGREGATION,
  BANDS,
  SIGNALS,
  TOTAL_BUDGET,
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
export function bandFor(score: number): Exclude<Band, "gris"> {
  if (score >= BANDS.rojo) return "rojo";
  if (score >= BANDS.amarillo) return "amarillo";
  return "verde";
}

function base(id: SignalId) {
  const spec = SIGNALS[id];
  return { id, level: spec.level, label: spec.label, weight: spec.weight };
}

/** Null when the sample is too short for this signal to mean anything. */
export function countEvidence(
  id: SignalId,
  count: number,
  wordCount: number,
  explain: (count: number, per1000: number) => string,
  samples?: string[],
): SignalEvidence | null {
  const spec = SIGNALS[id];
  if (spec.kind !== "count") throw new Error(`${id} is not a count signal`);
  // `as const satisfies` keeps the literal shapes, so an optional field is
  // absent rather than undefined on the entries that do not declare it.
  const floor = "minWords" in spec ? (spec.minWords as number) : 0;
  if (wordCount < floor) return null;
  if (count === 0) return null;

  const density = count / Math.max(wordCount / 1000, 0.001);
  const saturated = saturate(density, spec.d50);
  return {
    ...base(id),
    count,
    density,
    saturated,
    contribution: spec.weight * saturated,
    explanation: explain(count, density),
    ...(samples?.length ? { samples: samples.slice(0, 3) } : {}),
  };
}

export function rampEvidence(
  id: SignalId,
  value: number,
  explain: (value: number) => string,
): SignalEvidence {
  const spec = SIGNALS[id];
  if (spec.kind !== "ramp") throw new Error(`${id} is not a ramp signal`);

  const saturated = ramp(value, spec.human, spec.machine);
  return {
    ...base(id),
    count: 0,
    density: value,
    saturated,
    contribution: spec.weight * saturated,
    explanation: explain(value),
  };
}

/**
 * Absence signals are all or nothing, and only above their own word floor.
 * "No typos in 200 words" is not information; in 1,500 it is.
 */
export function absenceEvidence(
  id: SignalId,
  holds: boolean,
  wordCount: number,
  explanation: string,
): SignalEvidence | null {
  const spec = SIGNALS[id];
  if (spec.kind !== "absence")
    throw new Error(`${id} is not an absence signal`);
  if (!holds || wordCount < spec.minWords) return null;

  return {
    ...base(id),
    count: 1,
    density: 1,
    saturated: 1,
    contribution: spec.weight,
    explanation,
  };
}

/**
 * Index on 0-100. Signals that did not fire contribute nothing, which is the
 * point: absence of evidence is not evidence. Not clamped away from 0 -- the
 * "never show 0 % or 100 %" rule is about a displayed probability, and this
 * is not one.
 */
export function scoreOf(signals: SignalEvidence[]): number {
  const total = signals.reduce((acc, s) => acc + s.contribution, 0);
  return Math.round((total / TOTAL_BUDGET) * 100);
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
