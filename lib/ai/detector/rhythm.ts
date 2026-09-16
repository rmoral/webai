import { rampEvidence } from "./scoring";
import { splitParagraphs, splitSentences, syllables, words } from "./segment";
import { MIN_PARAGRAPHS } from "./weights";
import type { NormalizedText, SignalEvidence } from "./types";

// Level B, rhythm only (architecture doc section 4.1). Human writing varies;
// generated writing tends to the mean. It is the most robust finding in the
// field and, per section 10, the part that survives paraphrasing best -- which
// is why it carries 700 of the 1,000 points and the forensic layer carries 300.
//
// These take NormalizedText. Measuring rhythm on raw text would let a
// non-breaking space or a stray Markdown marker change a word count.

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

const comma = (n: number) => n.toFixed(2).replace(".", ",");

/**
 * The rhythm of one slice. `paragraphs` is optional because paragraph shape
 * has no meaning inside a four-sentence window -- it is a property of the
 * document, so the pipeline only asks for it there.
 */
export function rhythmSignals(
  text: NormalizedText,
  { withParagraphs = false } = {},
): SignalEvidence[] {
  const sentences = splitSentences(text);
  const lengths = sentences.map((s) => words(s).length).filter((n) => n > 0);
  const allWords = words(text);

  const signals: SignalEvidence[] = [];

  const variation = cv(lengths);
  signals.push(
    rampEvidence(
      "cv_longitud_frase",
      variation,
      (v) =>
        `Las frases varían de longitud con un coeficiente de ${comma(v)}. En prosa humana suele estar entre 0,40 y 0,60; por debajo de 0,25 el ritmo es llano. Media de ${mean(lengths).toFixed(0)} palabras por frase.`,
    ),
  );

  const extremes =
    lengths.length === 0
      ? 0
      : lengths.filter((l) => l <= 5 || l >= 35).length / lengths.length;
  signals.push(
    rampEvidence(
      "distribucion_longitudes",
      extremes,
      (v) =>
        `${Math.round(v * 100)} % de las frases son muy cortas (5 palabras o menos) o muy largas (35 o más). Al escribir se producen ambos extremos; la escritura automática se concentra entre 15 y 25 palabras.`,
    ),
  );

  const echo = Math.max(0, autocorrelation(lengths));
  signals.push(
    rampEvidence(
      "autocorrelacion_longitudes",
      echo,
      (v) =>
        `Cada frase repite la longitud de la anterior con una correlación de ${comma(v)}. Cuanto más alta, más encadenado y regular es el ritmo.`,
    ),
  );

  const wordLengths = allWords.map((w) => w.length);
  signals.push(
    rampEvidence(
      "varianza_longitud_palabra",
      cv(wordLengths),
      (v) =>
        `La longitud de las palabras varía con un coeficiente de ${comma(v)}.`,
    ),
  );

  signals.push(
    rampEvidence(
      "varianza_densidad_silabica",
      cv(allWords.map(syllables)),
      (v) =>
        `El número de sílabas por palabra varía con un coeficiente de ${comma(v)}.`,
    ),
  );

  if (withParagraphs) {
    const paragraphs = splitParagraphs(text);
    const perParagraph = paragraphs.map((p) => splitSentences(p).length);
    // Too few paragraphs and this measures nothing. It reports the human
    // anchor, which scores zero, rather than guessing in either direction.
    const enough = perParagraph.length >= MIN_PARAGRAPHS;
    const regularity = enough ? cv(perParagraph) : 1;
    signals.push(
      rampEvidence("uniformidad_parrafos", regularity, (v) =>
        enough
          ? `Los párrafos tienen ${perParagraph.join(", ")} frases: una variación de ${comma(v)}. La escritura automática produce párrafos de tres o cuatro frases con una regularidad casi métrica.`
          : `Solo hay ${perParagraph.length} párrafos: no son suficientes para medir su regularidad.`,
      ),
    );
  }

  return signals;
}
