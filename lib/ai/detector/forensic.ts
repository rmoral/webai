import { countEvidence, absenceEvidence } from "./scoring";
import type { RawText, SignalEvidence } from "./types";

// Level A. Physical traces, not inference: when one of these fires it fires
// for a reason, which is why the evidence list can quote it back.
//
// Every function here takes RawText and only RawText. Normalising first
// destroys most of what this file looks for -- a non-breaking space becomes a
// space, a curly quote becomes a straight one -- so the ordering is enforced
// by the type, not by a comment someone can skip past. See types.ts.

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

/** Every ? and ! carries its opener. A person in a hurry drops them. */
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
): SignalEvidence[] {
  const plural = (n: number, one: string, many: string) =>
    n === 1 ? one : many;

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
    countEvidence(
      "raya_espaciada",
      dashes.length,
      wordCount,
      (n, per) =>
        `${n} ${plural(n, "raya", "rayas")} (—) con espacio a ambos lados, la convención inglesa: en español la raya va pegada al inciso. ${per.toFixed(1)} por cada 1.000 palabras. Además, ese carácter no está en un teclado español.`,
      dashes,
    ),
    countEvidence(
      "caracteres_invisibles",
      invisible.length,
      wordCount,
      (n) =>
        `${n} ${plural(n, "carácter invisible", "caracteres invisibles")} (espacio de ancho cero o similar). No se teclean: aparecen al copiar desde una interfaz web.`,
    ),
    countEvidence(
      "homoglifos",
      homoglyphs.length,
      wordCount,
      (n) =>
        `${n} ${plural(n, "palabra mezcla", "palabras mezclan")} letras latinas con cirílicas o griegas. Esto no indica escritura automática: indica que el texto ha pasado por una herramienta de evasión.`,
      homoglyphs,
    ),
    countEvidence(
      "comillas_curvas",
      curly.length,
      wordCount,
      (n) =>
        `${n} ${plural(n, "comilla tipográfica", "comillas tipográficas")} en un texto que por lo demás es plano. Un campo de texto produce comillas rectas.`,
    ),
    countEvidence(
      "espacios_especiales",
      spaces.length,
      wordCount,
      (n) =>
        `${n} ${plural(n, "espacio especial", "espacios especiales")} (espacio duro o fino) en lugar del espacio normal.`,
    ),
    countEvidence(
      "semirraya_como_raya",
      enDashes.length,
      wordCount,
      (n) =>
        `${n} ${plural(n, "semirraya", "semirrayas")} (–) usada como raya. En español no cumple esa función.`,
    ),
    countEvidence(
      "puntos_suspensivos_unicode",
      ellipsis.length,
      wordCount,
      (n) =>
        `${n} ${plural(n, "vez", "veces")} aparecen los puntos suspensivos como un solo carácter (…) en lugar de tres puntos.`,
    ),
    countEvidence(
      "apostrofo_tipografico",
      apostrophes.length,
      wordCount,
      (n) =>
        `${n} ${plural(n, "apóstrofo tipográfico", "apóstrofos tipográficos")} (’) en lugar del recto.`,
    ),
    countEvidence(
      "markdown_superviviente",
      markdown.length,
      wordCount,
      (n) =>
        `${n} ${plural(n, "resto", "restos")} de Markdown sin convertir (negritas con asteriscos, encabezados con almohadilla o separadores). Sobreviven al copiar desde un chat.`,
      markdown,
    ),
    countEvidence(
      "emojis_estructurales",
      emojis.length,
      wordCount,
      (n) =>
        `${n} ${plural(n, "línea empieza", "líneas empiezan")} por un emoji en posición de viñeta, un patrón de maquetación muy característico.`,
    ),
    countEvidence(
      "vinetas_uniformes",
      bullets.length,
      wordCount,
      (n) => `${n} ${plural(n, "viñeta", "viñetas")} con formato idéntico.`,
    ),
    countEvidence(
      "listas_numeradas_perfectas",
      numbered,
      wordCount,
      (n) =>
        `${n} elementos de lista numerada consecutivos, sin saltos ni reinicios.`,
    ),
    countEvidence(
      "encabezado_negrita_dos_puntos",
      boldHeadings.length,
      wordCount,
      (n) =>
        `${n} ${plural(n, "párrafo empieza", "párrafos empiezan")} por un encabezado en negrita seguido de dos puntos.`,
      boldHeadings,
    ),
    absenceEvidence(
      "apertura_interrogacion_perfecta",
      openersAlwaysPresent(raw),
      wordCount,
      "Todas las interrogaciones y exclamaciones llevan su signo de apertura. Escribiendo deprisa se omiten a menudo; un modelo nunca lo hace.",
    ),
    absenceEvidence(
      "espaciado_impecable",
      spacingFlawless(raw),
      wordCount,
      "En todo el texto no hay un solo espacio doble ni un espacio antes de un signo de puntuación.",
    ),
    absenceEvidence(
      "ausencia_correcciones_fosiles",
      noFossilCorrections(raw),
      wordCount,
      "No hay ninguna palabra repetida por descuido ni ninguna frase abandonada a medias, que es lo que suele quedar al escribir de corrido.",
    ),
  ];

  return signals.filter((s): s is SignalEvidence => s !== null);
}
