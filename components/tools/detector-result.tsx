"use client";

import Link from "next/link";

import { asRaw, splitSentences } from "@/lib/ai/detector/segment";
import type { Band, DetectorAnalysis } from "@/lib/ai/detector/types";
import { RELIABILITY } from "@/lib/ai/detector/weights";
import { cn } from "@/lib/utils";

// The finding is a band and a list of what was measured. There is no number
// on screen, on purpose: an index of 52 reads as "52% AI" however the caption
// is worded, and no technique available today produces a calibrated
// probability for Spanish. The wording here is load-bearing -- this tool gets
// pointed at students.

const SCALE: Exclude<Band, "gris">[] = ["verde", "amarillo", "rojo"];

const BANDS: Record<
  Exclude<Band, "gris">,
  { headline: string; step: string; fill: string; text: string }
> = {
  verde: {
    headline: "No hay indicios de escritura automática",
    step: "sin indicios",
    fill: "var(--success)",
    text: "text-success-ink",
  },
  amarillo: {
    headline: "Hay algunos indicios de escritura automática",
    step: "algunos indicios",
    fill: "var(--warning-fill)",
    text: "text-warning-ink",
  },
  rojo: {
    headline: "Hay indicios claros de escritura automática",
    step: "indicios claros",
    fill: "var(--danger)",
    text: "text-danger-ink",
  },
};

function plural(n: number, uno: string, varios: string) {
  return n === 1 ? uno : varios;
}

/** What was actually found. A signal that did not fire is not evidence. */
function Evidence({ result }: { result: DetectorAnalysis }) {
  const found = result.signals.filter((s) => s.contribution > 0);
  if (found.length === 0) return null;

  return (
    <dl className="flex flex-col gap-4">
      <p className="text-sm font-medium">Qué hemos medido</p>
      {found.map((signal) => (
        <div key={signal.id} className="flex flex-col gap-1">
          <dt className="flex items-baseline gap-2 text-sm font-medium">
            <span
              aria-hidden
              className="mt-[0.4rem] size-1.5 shrink-0 rounded-full"
              style={{ background: "var(--muted-foreground)" }}
            />
            {signal.label}
          </dt>
          <dd className="text-muted-foreground pl-3.5 text-xs leading-relaxed">
            {signal.explanation}
            {signal.samples?.length ? (
              <span className="mt-1 block">
                Por ejemplo:{" "}
                {signal.samples.map((s, i) => (
                  <span key={i}>
                    {i > 0 && ", "}
                    <code className="bg-muted rounded px-1 py-0.5 text-[0.7rem]">
                      {s}
                    </code>
                  </span>
                ))}
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function DetectorResultView({
  result,
  text,
  canSeeSentences,
}: {
  result: DetectorAnalysis;
  /** The text that was analysed, for locating the windows. */
  text: string;
  canSeeSentences: boolean;
}) {
  if (result.band === "gris") {
    return (
      <div className="flex flex-col gap-4 p-5" data-testid="detector-result">
        <div>
          <p className="font-medium">Texto demasiado corto para analizarlo</p>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Con {result.words.toLocaleString("es-ES")}{" "}
            {plural(result.words, "palabra", "palabras")} en{" "}
            {result.sentenceCount}{" "}
            {plural(result.sentenceCount, "frase", "frases")}, las medidas de
            ritmo son ruido. Hacen falta al menos {RELIABILITY.minWords}{" "}
            palabras y {RELIABILITY.minSentences} frases para que el resultado
            signifique algo. Preferimos decírtelo a darte un número inventado.
          </p>
        </div>
        {/* Forensic findings do not depend on length: an invisible character
            is an invisible character in twenty words. They are reported even
            here, without a band, because they are facts about the text. */}
        <Evidence result={result} />
      </div>
    );
  }

  const band = BANDS[result.band];

  return (
    <div className="flex flex-col gap-5 p-5" data-testid="detector-result">
      <div className="flex flex-col gap-3">
        <p className={cn("font-semibold", band.text)}>{band.headline}</p>
        <div
          className="flex gap-1"
          role="img"
          aria-label={`${band.step}, sobre una escala de sin indicios, algunos indicios e indicios claros`}
        >
          {SCALE.map((step) => (
            <span
              key={step}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                step === result.band ? "" : "bg-border",
              )}
              style={
                step === result.band ? { background: band.fill } : undefined
              }
            />
          ))}
        </div>
        <div className="text-muted-foreground flex justify-between text-xs">
          {SCALE.map((step) => (
            <span key={step} className={step === result.band ? band.text : ""}>
              {BANDS[step].step}
            </span>
          ))}
        </div>
        <p className="text-muted-foreground text-sm">
          Sobre {result.words.toLocaleString("es-ES")} palabras. No damos un
          porcentaje porque no existe ninguno que sea de fiar: lo que puedes
          leer es qué hemos encontrado.
        </p>
      </div>

      {result.band === "verde" && (
        <p className="border-brand-line bg-brand-soft text-brand-ink rounded-lg border px-4 py-3 text-xs leading-relaxed">
          <b className="font-semibold">
            Sin indicios no significa «lo escribió una persona».
          </b>{" "}
          Medimos el ritmo del texto y los rastros que deja un copiar y pegar.
          Un texto generado y luego reescrito a mano, o generado en un registro
          narrativo o académico cuidado, puede no dejar ninguno. Lo que puedes
          concluir es que no hay indicios, no que no haya IA.
        </p>
      )}

      <Evidence result={result} />

      {canSeeSentences ? (
        <WindowMap result={result} text={text} />
      ) : (
        <p className="text-muted-foreground text-xs">
          El desglose por pasajes está disponible en los planes de pago.{" "}
          <Link href="/precios" className="underline">
            Ver planes
          </Link>
        </p>
      )}

      {/* Non-negotiable per the design system: the result always reads as
          orientation, never as proof. */}
      <p className="text-muted-foreground border-t pt-4 text-xs leading-relaxed">
        Esto mide patrones de estilo, no autoría. Un texto humano muy formal
        puede dar indicios y un texto generado con buen estilo puede no dar
        ninguno. Ningún detector, el nuestro incluido, sirve como prueba para
        acusar a nadie.
      </p>
    </div>
  );
}

/**
 * Where the indications concentrate. The engine scores overlapping windows of
 * a few sentences, so a generated paragraph inside a written text shows up
 * here even when the document as a whole does not reach a band -- which is
 * the normal mixed case.
 */
function WindowMap({
  result,
  text,
}: {
  result: DetectorAnalysis;
  text: string;
}) {
  const marked = result.windows.filter((w) => w.band !== "verde");
  if (marked.length === 0) return null;

  // Overlapping windows describing one stretch are one finding, not four.
  const runs: { from: number; to: number; band: Exclude<Band, "gris"> }[] = [];
  for (const w of marked) {
    const last = runs[runs.length - 1];
    const [from, to] = w.sentenceRange;
    if (last && from <= last.to + 1) {
      last.to = Math.max(last.to, to);
      if (w.band === "rojo") last.band = "rojo";
    } else {
      runs.push({ from, to, band: w.band as Exclude<Band, "gris"> });
    }
  }

  // Cut with the engine's own splitter, not a copy of it: the ranges are
  // indices into that array, and a copy that drifted would quote the wrong
  // sentences without failing anywhere.
  const sentences = splitSentences(asRaw(text));

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">Dónde se concentran los indicios</p>
      <div className="flex flex-col gap-3">
        {runs.map((run, i) => (
          <blockquote
            key={i}
            className="border-l-2 pl-3 text-xs leading-relaxed"
            style={{ borderColor: BANDS[run.band].fill }}
          >
            <span className="text-muted-foreground block">
              Frases {run.from + 1}–{run.to + 1}
            </span>
            {sentences.slice(run.from, run.to + 1).join(" ")}
          </blockquote>
        ))}
      </div>
    </div>
  );
}
