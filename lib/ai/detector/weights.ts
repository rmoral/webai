import type { Locale } from "@/lib/i18n/routing";

// Calibration surface for the Phase 1 detector. Every number a human would
// want to turn lives here and nowhere else; the logic in the sibling files
// reads this table and never hardcodes a threshold.
//
// Every tunable is given per language, side by side, because the two are
// genuinely different measurements and not a translation of each other.
// A spaced em dash is an artefact in Spanish -- the character is not even on
// the keyboard -- and an ordinary British punctuation mark in English. A
// curly apostrophe is a trace in Spanish and unavoidable in English, where
// Word turns every "don't" into one. Anchoring both from the Spanish numbers
// would produce an English detector that accuses people for using Word.
//
// Labels and explanations are NOT here: they are messages, keyed by signal
// id (`detectorSignals.<id>`). The engine emits ids and measurements; the
// interface turns them into sentences.
//
// Weights are on a 0-1000 scale and are shared across languages: what a
// signal is worth when it fires is a property of the signal, not of the
// language. What differs is how readily it fires, which is the anchors.
// Level A must never exceed 300 of the budget: the forensic artefacts are
// trivial to strip with a find-and-replace, so a detector that leans on them
// is one a motivated user defeats in ten seconds (architecture doc §10).

export type SignalLevel = "A" | "B";

/** `null` means the signal does not apply to that language at all. */
type PerLocale<T> = Record<Locale, T | null>;

interface Base {
  level: SignalLevel;
  /** Share of the 0-1000 budget. */
  weight: number;
  /**
   * Below this many words the signal is withheld. Absence signals need the
   * most: "no typos in 200 words" is not information, "none in 1,500" is.
   */
  minWords?: number;
}

/** Counted occurrences, scored by density and saturating. */
export interface CountSpec extends Base {
  kind: "count";
  /** Occurrences per 1,000 words at which the signal is half saturated. */
  d50: PerLocale<number>;
}

/** A continuous measure ramped between a typical human and machine value. */
export interface RampSpec extends Base {
  kind: "ramp";
  /** `human` scores 0, `machine` scores 1. */
  anchors: PerLocale<{ human: number; machine: number }>;
}

/** Something a human would have produced and did not. All or nothing. */
export interface AbsenceSpec extends Base {
  kind: "absence";
  minWords: number;
  applies: Record<Locale, boolean>;
}

export type SignalSpec = CountSpec | RampSpec | AbsenceSpec;

const BOTH = <T>(value: T): PerLocale<T> => ({ es: value, en: value });

export const SIGNALS = {
  // ─── Level A.1 · Unicode artefacts ────────────────────────────────────
  // Spanish: the character is not on the keyboard and the spacing is the
  // English convention, so both facts point the same way.
  // English: a spaced em dash is ordinary British practice and the Word
  // autocorrect produces it, so it takes three times the density to mean
  // the same thing.
  raya_espaciada: {
    kind: "count",
    level: "A",
    weight: 60,
    d50: { es: 4, en: 12 },
  },
  caracteres_invisibles: {
    kind: "count",
    level: "A",
    weight: 40,
    d50: BOTH(1),
  },
  // Not evidence of generation at all: evidence of an evasion tool. Equally
  // alien to both languages.
  homoglifos: {
    kind: "count",
    level: "A",
    weight: 40,
    d50: BOTH(1),
  },
  markdown_superviviente: {
    kind: "count",
    level: "A",
    weight: 30,
    d50: BOTH(3),
  },
  // English word processors curl quotes by default and most English writing
  // passes through one, so this barely separates there.
  comillas_curvas: {
    kind: "count",
    level: "A",
    weight: 20,
    d50: { es: 8, en: 30 },
  },
  emojis_estructurales: {
    kind: "count",
    level: "A",
    weight: 20,
    d50: BOTH(3),
  },
  espacios_especiales: {
    kind: "count",
    level: "A",
    weight: 10,
    d50: BOTH(3),
  },
  // The en dash between spaces is the standard British dash. In Spanish it
  // has no such role.
  semirraya_como_raya: {
    kind: "count",
    level: "A",
    weight: 10,
    d50: { es: 4, en: 20 },
  },
  puntos_suspensivos_unicode: {
    kind: "count",
    level: "A",
    weight: 10,
    d50: { es: 4, en: 12 },
  },
  // English is full of apostrophes and every word processor curls them, so
  // the density needed to mean anything is an order of magnitude higher.
  apostrofo_tipografico: {
    kind: "count",
    level: "A",
    weight: 10,
    d50: { es: 4, en: 60 },
  },
  vinetas_uniformes: {
    kind: "count",
    level: "A",
    weight: 10,
    d50: BOTH(6),
  },
  listas_numeradas_perfectas: {
    kind: "count",
    level: "A",
    weight: 10,
    d50: BOTH(4),
  },
  encabezado_negrita_dos_puntos: {
    kind: "count",
    level: "A",
    weight: 10,
    d50: BOTH(3),
  },

  // ─── Level A.3 · Typing anomalies, measured by absence ────────────────
  // Spanish only, and not by oversight: English has no opening ¿ or ¡, so
  // there is nothing that could have been dropped and nothing to measure.
  apertura_interrogacion_perfecta: {
    kind: "absence",
    level: "A",
    weight: 10,
    minWords: 400,
    applies: { es: true, en: false },
  },
  espaciado_impecable: {
    kind: "absence",
    level: "A",
    weight: 5,
    minWords: 600,
    applies: { es: true, en: true },
  },
  ausencia_correcciones_fosiles: {
    kind: "absence",
    level: "A",
    weight: 5,
    minWords: 600,
    applies: { es: true, en: true },
  },

  // ─── Level B · Rhythm (architecture doc section 4.1) ──────────────────
  //
  // The anchors were set against the texts in fixtures.ts, not taken from
  // the literature, and the measured values are in the comments so the next
  // person can see what they are moving away from. Six texts per language is
  // a starting point, not a calibration.
  //
  // Measured over fixtures.ts:
  //   es  generado 0,281 · no nativo 0,307 · mixto 0,485 · académico 0,510
  //       · Argentina 0,668 · México 0,777 · informal 0,780
  //   en  generated 0.290 · non-native 0.297 · academic 0.457 · mixed 0.457
  //       · informal 0.763
  //
  // Read the first two columns of each row together: careful second-language
  // writing measures 0,307 against generated text at 0,281 in Spanish, and
  // 0.297 against 0.290 in English. There is no threshold that separates
  // them, in either language, because there is nothing here to separate --
  // fluency acquired as a second language is genuinely more regular, and
  // regularity is all this measures. The anchors below therefore separate
  // generated text from NATIVE writing, and CORROBORATION below is what
  // keeps that from turning into an accusation.
  cv_longitud_frase: {
    kind: "ramp",
    level: "B",
    weight: 300,
    anchors: {
      es: { human: 0.52, machine: 0.26 },
      en: { human: 0.37, machine: 0.2 },
    },
  },
  // es measured: generado 0,000 · mixto 0,154 · académico 0,154
  //              · informal 0,353 · México 0,368 · Argentina 0,235
  // en measured: generated 0.000 · non-native 0.000 · academic 0.077
  //              · mixed 0.077 · informal 0.353
  distribucion_longitudes: {
    kind: "ramp",
    level: "B",
    weight: 180,
    anchors: {
      es: { human: 0.14, machine: 0.01 },
      en: { human: 0.1, machine: 0.01 },
    },
  },
  // es measured: generado 0,385 · académico 0,255 · informal 0,348
  //              · México 0,404 -- no separation at all.
  // Most English fixtures have five paragraphs or fewer, so the signal
  // abstains on them entirely. Kept at a reduced weight because with four or
  // five paragraphs it is a statistic over four numbers.
  uniformidad_parrafos: {
    kind: "ramp",
    level: "B",
    weight: 80,
    anchors: {
      es: { human: 0.4, machine: 0.1 },
      en: { human: 0.4, machine: 0.1 },
    },
  },
  // es measured: generado 0,095 · every human 0,000. Weak, correctly signed.
  autocorrelacion_longitudes: {
    kind: "ramp",
    level: "B",
    weight: 60,
    anchors: {
      es: { human: 0, machine: 0.45 },
      en: { human: 0, machine: 0.45 },
    },
  },
  // Runs BACKWARDS in Spanish: the generated text varies more than two of
  // the human samples. Anchored to stay silent across the corpus rather than
  // contribute noise, in both languages, because §4.1 asks for the variable
  // and a real corpus may yet make it work.
  varianza_longitud_palabra: {
    kind: "ramp",
    level: "B",
    weight: 50,
    anchors: {
      es: { human: 0.5, machine: 0.38 },
      en: { human: 0.5, machine: 0.38 },
    },
  },
  varianza_densidad_silabica: {
    kind: "ramp",
    level: "B",
    weight: 30,
    anchors: {
      es: { human: 0.45, machine: 0.35 },
      en: { human: 0.45, machine: 0.35 },
    },
  },
} as const satisfies Record<string, SignalSpec>;

export type SignalId = keyof typeof SIGNALS;

/** Whether a signal is measured at all in this language. */
export function applies(id: SignalId, locale: Locale): boolean {
  const spec: SignalSpec = SIGNALS[id];
  if (spec.kind === "absence") return spec.applies[locale];
  if (spec.kind === "count") return spec.d50[locale] !== null;
  return spec.anchors[locale] !== null;
}

/**
 * What a text in this language could score if every applicable signal
 * saturated. Spanish reaches 1,000; English 990, because the inverted
 * openers do not exist there.
 *
 * The index divides by this rather than by a flat 1,000 so that "half the
 * evidence there was to find" reads the same in both languages -- otherwise
 * the band thresholds would have to absorb the difference, which is exactly
 * the kind of hidden coupling this file exists to avoid.
 */
export function budgetFor(locale: Locale): number {
  return (Object.keys(SIGNALS) as SignalId[])
    .filter((id) => applies(id, locale))
    .reduce((total, id) => total + SIGNALS[id].weight, 0);
}

/** Level A's ceiling, as a share of the language's own budget. */
export const LEVEL_A_SHARE = 0.3;

/**
 * Paragraph regularity over four paragraphs is a statistic over four
 * numbers. Below this many, the signal abstains instead of guessing.
 */
export const MIN_PARAGRAPHS = 6;

/** Sliding windows, so a generated block inside a human text can be located. */
export const WINDOW = {
  /** Sentences per window. The doc's range is 3-5. */
  size: 4,
  step: 1,
  /**
   * Fewer sentences than this and windowing is theatre: the whole text is
   * one window.
   */
  minSentences: 6,
} as const;

/**
 * Below this, no band. Every statistical measure here is noise on a short
 * sample, and a competitor putting a percentage on 80 words is inventing it
 * (architecture doc §8).
 *
 * The same floor in both languages. English sentences are shorter, so 200
 * English words yield more sentences than 200 Spanish ones -- the floor is
 * therefore slightly more generous in English, which errs the safe way.
 */
export const RELIABILITY = {
  minWords: 200,
  minSentences: 8,
} as const;

/**
 * Thresholds on the 0-100 index. Asymmetric: see the note in scoring.ts.
 *
 * They sit far below 50/80 because no real text spends its whole budget.
 * Only two rhythm signals separate strongly, and the forensic layer fires
 * only on unedited output. Measured over fixtures.ts, with CORROBORATION
 * applied:
 *
 *   es  generado sin editar   52  rojo
 *       no nativo             34  verde   <- capped, would read 46
 *       mixto                 25  verde   <- missed, see AGGREGATION
 *       humano académico      25  verde
 *       español de Argentina  16  verde
 *       español de México     13  verde
 *       humano informal        6  verde
 *
 *   en  generated unedited    47  rojo
 *       non-native            36  verde   <- capped, would read 40
 *       mixed                 30  verde   <- missed, same reason
 *       academic              25  verde
 *       informal               7  verde
 *
 * Raising `rojo` costs recall on generated text; lowering `amarillo` starts
 * catching careful human prose, which is the one error this tool must not
 * make.
 */
export const BANDS: Record<Locale, { amarillo: number; rojo: number }> = {
  es: { amarillo: 35, rojo: 50 },
  en: { amarillo: 37, rojo: 45 },
};

/**
 * Rhythm alone may not accuse anybody.
 *
 * The corpus says plainly that flat sentence rhythm has an innocent
 * explanation. Careful second-language writing measures 0,307 in Spanish and
 * 0.297 in English against generated text at 0,281 and 0.290 -- the same
 * reading, from a person who did the work. Left alone, the engine put the
 * Spanish sample at 46 and the English one at 40, both in the yellow band,
 * which is the documented harm this category of tool causes and the one
 * thing /detector-de-ia promises not to do.
 *
 * So the band can only leave green when a SECOND, independent kind of
 * evidence is present: at least this many points from level A, the physical
 * traces of a paste. Those are facts about the bytes rather than inferences
 * about style, and nobody writes them by hand.
 *
 * The number is 15 of level A's 300, which is deliberately above what an
 * ordinary word processor produces on its own -- twenty curly apostrophes in
 * 250 words of English come to about 6 -- and below one spaced em dash plus
 * a surviving Markdown heading. The cost is that a generated text with its
 * artefacts cleaned off reads green. That is the honest answer: once the
 * traces are gone, it measures the same as a careful non-native writer, and
 * we cannot tell them apart.
 */
export const CORROBORATION = 15;

/**
 * How the document score comes out of the windows. Averaging the whole text
 * hides a mixed one -- three human paragraphs and a generated fourth average
 * to nothing (architecture doc §6) -- so the top third gets a second vote.
 *
 * `topWeight` is why it is a second vote and not the whole vote. Measured
 * over the fixtures, the top third on its own reads 49 for generated text
 * and 47 for formal human prose: it cannot tell a generated block from a
 * stretch of unusually even human sentences, because at four sentences a
 * window has no statistical power. What does separate is coverage -- every
 * window of the generated sample reads high, only three of the human
 * sample's ten do:
 *
 *   generado    51 48 48 48 49 51 48 52 48 48 48 48 48 48 50
 *   académico    0  4 30 50 48 44  1  0  0  0
 *
 * Counting the top third twice keeps the mixed text visible in the windows
 * while making an isolated spike cost about a quarter of what a uniformly
 * machine-like text costs.
 */
export const AGGREGATION = {
  topFraction: 1 / 3,
  topWeight: 2,
} as const;
