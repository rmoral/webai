"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { usePostHog } from "posthog-js/react";
import type { Change } from "diff";

import { UpsellBanner } from "@/components/billing/upsell-banner";
import { DetectorResultView } from "@/components/tools/detector-result";
import {
  DiffMarks,
  HighlightLegend,
  diffParts,
} from "@/components/tools/highlight";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { TOOLS, resolveMode, type ToolId } from "@/lib/ai/tools";
import type { DetectorAnalysis } from "@/lib/ai/detector/types";
import { PLANS, type PlanId } from "@/lib/billing/plans";
import { countWords } from "@/lib/security/validation";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: { sitekey: string; callback: (token: string) => void },
      ) => string;
      reset: (id: string) => void;
    };
  }
}

const TURNSTILE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const MODE_LABELS: Record<string, string> = {
  academico: "Académico",
  neutro: "Neutro",
  informal: "Informal",
  estandar: "Estándar",
  fluido: "Fluido",
  formal: "Formal",
  simple: "Simple",
  creativo: "Creativo",
  general: "General",
};

export function ToolEditor({
  tool,
  plan = "anonymous",
}: {
  tool: ToolId;
  plan?: PlanId;
}) {
  const modes = TOOLS[tool].modes;
  // What the user picked, which may belong to a tool they have since left.
  // resolveMode is what decides the mode actually in force.
  const [picked, setPicked] = useState<string>();
  const mode = resolveMode(tool, picked);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [parts, setParts] = useState<Change[] | null>(null);
  // Analysis and the exact text it describes, kept together: the window
  // ranges are indices into that text's sentences, so a report paired with a
  // later edit of the box would quote the wrong passages.
  const [report, setReport] = useState<{
    analysis: DetectorAnalysis;
    text: string;
  } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [upsell, setUpsell] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const tokenRef = useRef<string>("");
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string>(null);
  const posthog = usePostHog();

  // Switching tool reuses this component, so a previous result would sit
  // under the new tool's heading as if it had produced it.
  useEffect(() => {
    setOutput("");
    setParts(null);
    setReport(null);
    setError(null);
    setStatus("idle");
  }, [tool]);

  useEffect(() => {
    if (!TURNSTILE_KEY || !widgetRef.current || widgetId.current) return;
    const interval = setInterval(() => {
      if (window.turnstile && widgetRef.current && !widgetId.current) {
        widgetId.current = window.turnstile.render(widgetRef.current, {
          sitekey: TURNSTILE_KEY,
          callback: (token) => (tokenRef.current = token),
        });
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const words = countWords(input);
  const paid = plan === "pro" || plan === "unlimited";
  // The detector measures the text instead of rewriting it, so it answers
  // with JSON rather than a stream and renders its own result view.
  const measures = tool === "detect";
  // Whether the plan may use this tool at all. Checked here so a visitor
  // sees the paywall before writing, not as a 403 after pressing the
  // button. The server enforces it either way.
  const included = PLANS[plan].limits.tools.includes(tool);

  async function run() {
    setStatus("loading");
    setError(null);
    setOutput("");
    setParts(null);
    setReport(null);
    // Frozen so the diff compares against what was actually sent, even if
    // the user keeps typing while the answer streams in.
    const sent = input;
    try {
      const res = await fetch(`/api/ai/${tool}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text: input,
          mode,
          turnstileToken: tokenRef.current || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (res.status === 429) {
          posthog?.capture("quota_hit", { tool });
          posthog?.capture("paywall_shown", { tool });
          setUpsell(true);
        }
        setError(data?.message ?? "Algo ha salido mal. Inténtalo de nuevo.");
        setStatus("idle");
        return;
      }

      const remainingHeader = res.headers.get("x-words-remaining");
      if (remainingHeader !== null) setRemaining(Number(remainingHeader));

      if (measures) {
        setReport({
          analysis: (await res.json()) as DetectorAnalysis,
          text: sent,
        });
        setStatus("done");
        posthog?.capture("tool_used", { tool, words });
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setOutput(acc);
      }
      setStatus("done");
      setParts(await diffParts(sent, acc));
      posthog?.capture("tool_used", { tool, words, mode });
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setStatus("idle");
    } finally {
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {TURNSTILE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
        />
      )}

      {!included && (
        <UpsellBanner
          title={`${TOOLS[tool].name} está en los planes de pago.`}
          action={
            <Button size="sm" asChild>
              <Link href="/precios">Ver planes</Link>
            </Button>
          }
        >
          Puedes probar gratis el humanizador y el detector de IA sin crear
          cuenta.
        </UpsellBanner>
      )}

      <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
        {modes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b px-5 py-3">
            {modes.map((m) => (
              <Chip key={m} pressed={m === mode} onClick={() => setPicked(m)}>
                {MODE_LABELS[m] ?? m}
              </Chip>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 md:divide-x">
          <div className="flex flex-col">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pega aquí tu texto…"
              aria-label="Texto de entrada"
              className="min-h-44 w-full resize-y bg-transparent p-5 text-base outline-none md:min-h-64 md:text-sm"
            />
            <p className="text-muted-foreground border-t px-5 py-2 text-xs">
              {words.toLocaleString("es-ES")} palabras
              {remaining !== null &&
                ` · te quedan ${remaining.toLocaleString("es-ES")}`}
            </p>
          </div>

          <div className="flex min-h-44 flex-col border-t md:min-h-64 md:border-t-0">
            {measures && report ? (
              <DetectorResultView
                result={report.analysis}
                text={report.text}
                canSeeSentences={PLANS[plan].limits.sentenceHighlight}
              />
            ) : (
              <div className="flex-1 p-5 text-base whitespace-pre-wrap md:text-sm">
                {status === "done" && !measures ? (
                  <DiffMarks parts={parts} fallback={output} />
                ) : (
                  output || (
                    <span className="text-muted-foreground">
                      {status === "loading"
                        ? measures
                          ? "Analizando…"
                          : "Escribiendo…"
                        : measures
                          ? "El análisis aparecerá aquí"
                          : "El resultado aparecerá aquí"}
                    </span>
                  )
                )}
              </div>
            )}
            {status === "done" && parts && !measures && (
              <div className="flex flex-wrap items-center gap-4 border-t px-5 py-2">
                <HighlightLegend kind="rewritten" />
                <HighlightLegend kind="added" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t px-5 py-3">
          <Button
            onClick={run}
            disabled={!included || status === "loading" || words === 0}
            size="lg"
          >
            {!included
              ? "Requiere un plan de pago"
              : status === "loading"
                ? "Procesando…"
                : TOOLS[tool].name}
          </Button>
          {status === "done" && !measures && (
            <Button
              variant="outline"
              onClick={() => navigator.clipboard.writeText(output)}
            >
              Copiar resultado
            </Button>
          )}
          <div ref={widgetRef} className="ml-auto" />
        </div>
      </div>

      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}

      {upsell ? (
        <UpsellBanner
          tone="quota"
          title="Has agotado tu límite."
          action={
            <Button size="sm" asChild>
              <Link href="/precios">Ver planes</Link>
            </Button>
          }
        >
          Sigue escribiendo hoy mismo con Ilimitado: 3 días gratis y cancelas
          cuando quieras.
        </UpsellBanner>
      ) : (
        !paid &&
        included && (
          <UpsellBanner
            title="¿Textos más largos?"
            action={
              <Button size="sm" variant="soft" asChild>
                <Link href="/precios">Ver planes</Link>
              </Button>
            }
          >
            Los planes de pago amplían el límite por petición, guardan tu
            historial y desbloquean todas las herramientas.
          </UpsellBanner>
        )
      )}
    </div>
  );
}
