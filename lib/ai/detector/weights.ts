// Calibration surface for the Phase 1 detector. Every number a human would
// want to turn lives here and nowhere else; the logic in the sibling files
// reads this table and never hardcodes a threshold.
//
// Weights are on a 0-1000 scale. Level A must never exceed 300 of it: the
// forensic artefacts are trivial to strip with a find-and-replace, so a
// detector that leans on them is a detector that a motivated user defeats in
// ten seconds (architecture doc §10). `assertWeightBudget` below turns that
// ceiling into something the test suite enforces rather than a convention.

export type SignalLevel = "A" | "B";

interface Base {
  level: SignalLevel;
  /** Shown as the row title in the evidence list. */
  label: string;
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
  d50: number;
}

/** A continuous measure ramped between a typical human and machine value. */
export interface RampSpec extends Base {
  kind: "ramp";
  /** Scores 0. */
  human: number;
  /** Scores 1. */
  machine: number;
}

/** Something a human would have produced and did not. All or nothing. */
export interface AbsenceSpec extends Base {
  kind: "absence";
  minWords: number;
}

export type SignalSpec = CountSpec | RampSpec | AbsenceSpec;

export const SIGNALS = {
  // ─── Level A.1 · Unicode artefacts ────────────────────────────────────
  raya_espaciada: {
    kind: "count",
    level: "A",
    label: "Raya con espaciado inglés",
    weight: 60,
    d50: 4,
  },
  caracteres_invisibles: {
    kind: "count",
    level: "A",
    label: "Caracteres invisibles",
    weight: 40,
    d50: 1,
  },
  homoglifos: {
    kind: "count",
    level: "A",
    label: "Letras de otro alfabeto",
    weight: 40,
    d50: 1,
  },
  comillas_curvas: {
    kind: "count",
    level: "A",
    label: "Comillas tipográficas",
    weight: 20,
    d50: 8,
  },
  espacios_especiales: {
    kind: "count",
    level: "A",
    label: "Espacios especiales",
    weight: 10,
    d50: 3,
  },
  semirraya_como_raya: {
    kind: "count",
    level: "A",
    label: "Semirraya usada como raya",
    weight: 10,
    d50: 4,
  },
  puntos_suspensivos_unicode: {
    kind: "count",
    level: "A",
    label: "Puntos suspensivos de un solo carácter",
    weight: 10,
    d50: 4,
  },
  apostrofo_tipografico: {
    kind: "count",
    level: "A",
    label: "Apóstrofo tipográfico",
    weight: 10,
    d50: 4,
  },

  // ─── Level A.2 · Format residue ───────────────────────────────────────
  markdown_superviviente: {
    kind: "count",
    level: "A",
    label: "Restos de Markdown",
    weight: 30,
    d50: 3,
  },
  emojis_estructurales: {
    kind: "count",
    level: "A",
    label: "Emojis como viñetas",
    weight: 20,
    d50: 3,
  },
  vinetas_uniformes: {
    kind: "count",
    level: "A",
    label: "Viñetas uniformes",
    weight: 10,
    d50: 6,
  },
  listas_numeradas_perfectas: {
    kind: "count",
    level: "A",
    label: "Lista numerada sin saltos",
    weight: 10,
    d50: 4,
  },
  encabezado_negrita_dos_puntos: {
    kind: "count",
    level: "A",
    label: "Encabezados en negrita con dos puntos",
    weight: 10,
    d50: 3,
  },

  // ─── Level A.3 · Typing anomalies, measured by absence ────────────────
  apertura_interrogacion_perfecta: {
    kind: "absence",
    level: "A",
    label: "Signos de apertura siempre presentes",
    weight: 10,
    minWords: 400,
  },
  espaciado_impecable: {
    kind: "absence",
    level: "A",
    label: "Espaciado sin un solo desliz",
    weight: 5,
    minWords: 600,
  },
  ausencia_correcciones_fosiles: {
    kind: "absence",
    level: "A",
    label: "Ni una corrección fósil",
    weight: 5,
    minWords: 600,
  },

  // ─── Level B · Rhythm (architecture doc section 4.1) ──────────────────
  //
  // The anchors below were set against the six texts in fixtures.ts, not
  // taken from the literature, and the measured values are in the comments so
  // the next person can see what they are moving away from. Six texts is a
  // starting point, not a calibration.
  //
  // measured: generado 0,281 · mixto 0,485 · académico 0,510 · informal 0,780
  //           · México 0,777 · Argentina 0,668
  // The one signal that separates cleanly, so it carries the most weight.
  cv_longitud_frase: {
    kind: "ramp",
    level: "B",
    label: "Variación de longitud de frase",
    weight: 300,
    human: 0.52,
    machine: 0.26,
  },
  // measured: generado 0,000 · mixto 0,154 · académico 0,154 · informal 0,353
  //           · México 0,368 · Argentina 0,235
  // The human anchor sits just under the formal-academic reading on purpose:
  // that register legitimately has few three-word sentences, and it is the
  // profile we must not accuse.
  distribucion_longitudes: {
    kind: "ramp",
    level: "B",
    label: "Frases muy cortas y muy largas",
    weight: 180,
    human: 0.14,
    machine: 0.01,
  },
  // measured: generado 0,385 · académico 0,255 · informal 0,348 · México 0,404
  // No separation at all -- the generated sample sits in the middle of the
  // human range. With four or five paragraphs this is a statistic over four
  // numbers, which is noise. It abstains below `minParagraphs` and keeps a
  // reduced weight so a longer corpus can revive it.
  uniformidad_parrafos: {
    kind: "ramp",
    level: "B",
    label: "Regularidad de los párrafos",
    weight: 80,
    human: 0.4,
    machine: 0.1,
  },
  // measured: generado 0,095 · every human 0,000. Weak but correctly signed.
  autocorrelacion_longitudes: {
    kind: "ramp",
    level: "B",
    label: "Encadenado de longitudes",
    weight: 60,
    human: 0,
    machine: 0.45,
  },
  // measured: generado 0,593 · humanos 0,539-0,604. Runs BACKWARDS: the
  // generated text varies more than two of the human ones. Anchored to stay
  // silent across the whole corpus rather than contribute noise; the weight
  // is kept because section 4.1 asks for the variable and a real corpus may
  // yet make it work.
  varianza_longitud_palabra: {
    kind: "ramp",
    level: "B",
    label: "Variación de longitud de palabra",
    weight: 50,
    human: 0.5,
    machine: 0.38,
  },
  // measured: generado 0,569 · humanos 0,474-0,551. Backwards too. Same
  // treatment.
  varianza_densidad_silabica: {
    kind: "ramp",
    level: "B",
    label: "Variación silábica",
    weight: 30,
    human: 0.45,
    machine: 0.35,
  },
} as const satisfies Record<string, SignalSpec>;

export type SignalId = keyof typeof SIGNALS;

/** Sliding windows, so a generated block inside a human text can be located. */
/**
 * Paragraph regularity over four paragraphs is a statistic over four numbers.
 * Below this many, the signal abstains instead of guessing.
 */
export const MIN_PARAGRAPHS = 6;

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
 */
export const RELIABILITY = {
  minWords: 200,
  minSentences: 8,
} as const;

/**
 * Thresholds on the 0-100 index. Asymmetric: see the note in scoring.ts.
 *
 * They sit far below 50/80 because the index is a share of a 1,000-point
 * budget that no real text ever spends. Only two rhythm signals separate
 * strongly (cv_longitud_frase and distribucion_longitudes, 480 points
 * between them) and the forensic layer only fires on unedited output, so a
 * text pasted straight out of a chat measures around 50 and formal human
 * prose around 25. Measured over the fixtures in fixtures.ts:
 *
 *   generado sin editar   52  rojo
 *   mixto                 25  verde   <- missed; see the note below
 *   humano académico      25  verde
 *   español de Argentina  16  verde
 *   español de México     13  verde
 *   humano informal        6  verde
 *
 * Raising `rojo` costs recall on generated text; lowering `amarillo` starts
 * catching formal human prose, which is the one error this tool must not
 * make. Ten points of margin is what the corpus allows today.
 */
export const BANDS = {
  amarillo: 35,
  rojo: 50,
} as const;

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

/** Level A cannot buy more than this share of the score. */
export const LEVEL_A_BUDGET = 300;
export const TOTAL_BUDGET = 1000;
