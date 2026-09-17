import type { Locale } from "@/lib/i18n/routing";

import { rampEvidence } from "./scoring";
import { splitParagraphs, splitSentences, syllables, words } from "./segment";
import { MIN_PARAGRAPHS } from "./weights";
import type { NormalizedText, SignalEvidence } from "./types";

// Level B, rhythm only (architecture doc section 4.1). Human writing varies;
// generated writing tends to the mean. It is the most robust finding in the
// field and, per section 10, the part that survives paraphrasing best --
// which is why it carries 700 of the 1,000 points and the forensic layer
// carries 300.
//
// These take NormalizedText. Measuring rhythm on raw text would let a
// non-breaking space or a stray Markdown marker change a word count.
//
// The measurements are language-independent; where they sit for a person is
// not. English sentences run shorter and vary less, and second-language
// English varies least of all, so the anchors in weights.ts differ sharply
// between the two.

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

function cv(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  if (m === 0) return 0;
  const variance = mean(xs.map((x) => (x - m) ** 2));
  return Math.sqrt(variance) / m;
}

/** Lag-1 autocorrelation: does each sentence echo the length of the last one. */
function autocorrelation(xs: number[]): number {
  if (xs.length < 4) return 0;
  const m = mean(xs);
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < xs.length; i++) {
    denominator += (xs[i] - m) ** 2;
    if (i > 0) numerator += (xs[i] - m) * (xs[i - 1] - m);
  }
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * The rhythm of one slice. `paragraphs` is optional because paragraph shape
 * has no meaning inside a four-sentence window -- it is a property of the
 * document, so the pipeline only asks for it there.
 */
export function rhythmSignals(
  text: NormalizedText,
  locale: Locale,
  { withParagraphs = false } = {},
): SignalEvidence[] {
  const sentences = splitSentences(text, locale);
  const lengths = sentences.map((s) => words(s).length).filter((n) => n > 0);
  const allWords = words(text);

  const signals: (SignalEvidence | null)[] = [
    rampEvidence("cv_longitud_frase", locale, cv(lengths), {
      meanWords: Math.round(mean(lengths)),
    }),

    rampEvidence(
      "distribucion_longitudes",
      locale,
      lengths.length === 0
        ? 0
        : lengths.filter((l) => l <= 5 || l >= 35).length / lengths.length,
      {},
    ),

    rampEvidence(
      "autocorrelacion_longitudes",
      locale,
      Math.max(0, autocorrelation(lengths)),
      {},
    ),

    rampEvidence(
      "varianza_longitud_palabra",
      locale,
      cv(allWords.map((w) => w.length)),
      {},
    ),

    rampEvidence(
      "varianza_densidad_silabica",
      locale,
      cv(allWords.map((w) => syllables(w, locale))),
      {},
    ),
  ];

  if (withParagraphs) {
    const perParagraph = splitParagraphs(text).map(
      (p) => splitSentences(p, locale).length,
    );
    // Too few paragraphs and this measures nothing. It reports the human
    // anchor, which scores zero, rather than guessing in either direction.
    const enough = perParagraph.length >= MIN_PARAGRAPHS;
    signals.push(
      rampEvidence(
        "uniformidad_parrafos",
        locale,
        enough ? cv(perParagraph) : 1,
        { paragraphs: perParagraph.length, shape: perParagraph.join(", ") },
      ),
    );
  }

  return signals.filter((s): s is SignalEvidence => s !== null);
}
