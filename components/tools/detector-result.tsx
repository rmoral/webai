"use client";

import Link from "next/link";

import type { Band, DetectorResult } from "@/lib/ai/detector/features";
import { cn } from "@/lib/utils";

// The number on screen is an index of measured style patterns, never a
// probability, and never a verdict. The wording here is load-bearing: this
// tool gets pointed at students.
//
// It used to be drawn as a filled ring, which is the shape of a percentage
// gauge whatever the caption underneath says -- an index of 3 read as "3%
// likely". The band is the finding; the number is supporting detail, and it
// is shown as a position on a three-step scale rather than as a fill.

const ORDER: Band[] = ["bajo", "medio", "alto"];

const BANDS: Record<Band, { headline: string; ring: string; text: string }> = {
  bajo: {
    headline: "Indicios bajos de escritura automática",
    ring: "var(--success)",
    text: "text-success-ink",
  },
  medio: {
    headline: "Indicios moderados de escritura automática",
    ring: "var(--warning-fill)",
    text: "text-warning-ink",
  },
  alto: {
    headline: "Indicios altos de escritura automática",
    ring: "var(--danger)",
    text: "text-danger-ink",
  },
};

export function DetectorResultView({
  result,
  canSeeSentences,
}: {
  result: DetectorResult;
  canSeeSentences: boolean;
}) {
  if (!result.reliable) {
    return (
      <div className="p-5" data-testid="detector-result">
        <p className="font-medium">Texto demasiado corto para analizarlo</p>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Con {result.words.toLocaleString("es-ES")}{" "}
          {result.words === 1 ? "palabra" : "palabras"} en{" "}
          {result.sentenceCount}{" "}
          {result.sentenceCount === 1 ? "frase" : "frases"}, las medidas de
          ritmo y repetición son ruido. Hacen falta al menos 120 palabras y 5
          frases para que el resultado signifique algo. Preferimos decírtelo a
          darte un número inventado.
        </p>
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
          aria-label={`Indicios ${result.band}, sobre una escala de bajo, medio y alto`}
        >
          {ORDER.map((step) => (
            <span
              key={step}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                step === result.band ? "" : "bg-border",
              )}
              style={
                step === result.band ? { background: band.ring } : undefined
              }
            />
          ))}
        </div>
        <div className="text-muted-foreground flex justify-between text-xs">
          {ORDER.map((step) => (
            <span key={step} className={step === result.band ? band.text : ""}>
              {step}
            </span>
          ))}
        </div>
        <p className="text-muted-foreground text-sm">
          Índice interno {result.index}/100 sobre{" "}
          {result.words.toLocaleString("es-ES")} palabras. Es la suma de las
          señales de abajo, no una probabilidad.
        </p>
      </div>

      {result.band === "bajo" && (
        <p className="border-brand-line bg-brand-soft text-brand-ink rounded-lg border px-4 py-3 text-xs leading-relaxed">
          <b className="font-semibold">
            Indicios bajos no significa «lo escribió una persona».
          </b>{" "}
          Estas señales reconocen el estilo formulario típico de un chatbot. Un
          texto generado en registro narrativo, comercial o académico cuidado
          puede no activar ninguna y salir aquí igual que uno humano. Lo que
          puedes concluir es que no hay indicios, no que no haya IA.
        </p>
      )}

      <dl className="flex flex-col gap-3">
        {result.signals.map((signal) => (
          <div key={signal.id} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-sm font-medium">{signal.label}</dt>
              <dd className="text-muted-foreground text-xs">
                {Math.round(signal.score * 100)}/100
              </dd>
            </div>
            <div className="bg-border h-1 overflow-hidden rounded-full">
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${Math.round(signal.score * 100)}%`,
                  background: band.ring,
                }}
              />
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {signal.detail}
            </p>
          </div>
        ))}
      </dl>

      {canSeeSentences && result.sentences && (
        <div>
          <p className="text-sm font-medium">Frase por frase</p>
          <p className="mt-2 text-sm leading-relaxed">
            {result.sentences.map((s, i) => (
              <span
                key={i}
                className={cn(
                  "rounded-[2px] px-px",
                  s.score >= 60 &&
                    "bg-[var(--hl-rewritten)] shadow-[inset_0_-2px_0_var(--hl-rewritten-line)]",
                )}
              >
                {s.text}{" "}
              </span>
            ))}
          </p>
        </div>
      )}

      {!canSeeSentences && (
        <p className="text-muted-foreground text-xs">
          El desglose frase por frase está disponible en los planes de pago.{" "}
          <Link href="/precios" className="underline">
            Ver planes
          </Link>
        </p>
      )}

      {/* Non-negotiable per the design system: the result always reads as
          orientation, never as proof. */}
      <p className="text-muted-foreground border-t pt-4 text-xs leading-relaxed">
        Esto mide patrones de estilo, no autoría. Un texto humano muy formal
        puede puntuar alto y un texto generado con buen estilo puede puntuar
        bajo. Ningún detector, el nuestro incluido, sirve como prueba para
        acusar a nadie.
      </p>
    </div>
  );
}
