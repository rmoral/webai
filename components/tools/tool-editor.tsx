"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { usePostHog } from "posthog-js/react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TOOLS, type ToolId } from "@/lib/ai/tools";
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
};

export function ToolEditor({ tool }: { tool: ToolId }) {
  const modes = TOOLS[tool].modes;
  const [mode, setMode] = useState<string | undefined>(modes[1] ?? modes[0]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const tokenRef = useRef<string>("");
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string>(null);
  const posthog = usePostHog();

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

  async function run() {
    setStatus("loading");
    setError(null);
    setOutput("");
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
        if (res.status === 429) posthog?.capture("quota_hit", { tool });
        setError(data?.message ?? "Algo ha salido mal. Inténtalo de nuevo.");
        setStatus("idle");
        return;
      }

      const remainingHeader = res.headers.get("x-words-remaining");
      if (remainingHeader !== null) setRemaining(Number(remainingHeader));

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

      {modes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {modes.map((m) => (
            <Button
              key={m}
              size="sm"
              variant={m === mode ? "default" : "outline"}
              onClick={() => setMode(m)}
            >
              {MODE_LABELS[m] ?? m}
            </Button>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pega aquí tu texto…"
            className="min-h-56"
          />
          <p className="text-muted-foreground text-sm">
            {words} palabras
            {remaining !== null && ` · Te quedan ${remaining} hoy`}
          </p>
        </div>
        <div className="bg-muted/40 min-h-56 rounded-md border p-3 text-sm whitespace-pre-wrap">
          {output ||
            (status === "loading" ? (
              <span className="text-muted-foreground">Escribiendo…</span>
            ) : (
              <span className="text-muted-foreground">
                El resultado aparecerá aquí
              </span>
            ))}
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex items-center gap-4">
        <Button
          onClick={run}
          disabled={status === "loading" || words === 0}
          size="lg"
        >
          {status === "loading" ? "Procesando…" : TOOLS[tool].name}
        </Button>
        {status === "done" && (
          <Button
            variant="outline"
            onClick={() => navigator.clipboard.writeText(output)}
          >
            Copiar resultado
          </Button>
        )}
      </div>

      <div ref={widgetRef} />
    </div>
  );
}
