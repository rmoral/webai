"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Script from "next/script";
import { usePostHog } from "posthog-js/react";
import type { Change } from "diff";

import {
  QuotaPaywall,
  ToolPaywall,
  paywallDismissed,
  rememberPaywallDismissal,
  type WithheldResult,
} from "@/components/billing/paywall";
import { UpsellBanner } from "@/components/billing/upsell-banner";
import { EditorInput, OverflowNotice } from "@/components/tools/overflow";
import { DetectorResultView } from "@/components/tools/detector-result";
import {
  DiffMarks,
  HighlightLegend,
  diffParts,
} from "@/components/tools/highlight";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { track } from "@/lib/analytics/events";
import { TOOLS, resolveMode, type ToolId } from "@/lib/ai/tools";
import type { DetectorAnalysis } from "@/lib/ai/detector/types";
import { PLANS, TRIAL, type PlanId } from "@/lib/billing/plans";
import { Link } from "@/lib/i18n/navigation";
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

export function ToolEditor({
  tool,
  plan = "anonymous",
}: {
  tool: ToolId;
  plan?: PlanId;
}) {
  const t = useTranslations("editor");
  const names = useTranslations("tools");
  const modeLabel = useTranslations("modes");
  // The API is not under [locale], so it cannot resolve the language from
  // the URL. The client knows it and says so; the server validates it.
  const locale = useLocale();

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
  // Wall B. Set only when the server answered a refused request with the
  // result anyway; otherwise the refusal falls back to the quota banner.
  const [withheld, setWithheld] = useState<WithheldResult | null>(null);
  // Wall C, dismissed. Read from session storage on mount rather than
  // during render, because sessionStorage does not exist on the server and
  // reading it in the body would make the two renders disagree.
  const [toolWallDismissed, setToolWallDismissed] = useState(true);
  // Whether they have reached for the tool yet. See wall C below.
  const [wantedTool, setWantedTool] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const tokenRef = useRef<string>("");
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string>(null);
  const posthog = usePostHog();

  // What was typed survives leaving the page and coming back -- which is
  // exactly what signing up is. "Your text is still in the editor" is a
  // promise the sign-up page makes; this is what makes it true, and it
  // costs nothing because sessionStorage never leaves the browser.
  //
  // Per tool, because two tools are two different pieces of work. Read in
  // an effect rather than in the initial state: sessionStorage does not
  // exist on the server, and reading it during render makes the two passes
  // disagree.
  useEffect(() => {
    try {
      setInput(sessionStorage.getItem(`editor:${tool}`) ?? "");
    } catch {
      // Private mode, or storage denied. An empty box is a fine fallback.
    }
  }, [tool]);

  useEffect(() => {
    try {
      if (input) sessionStorage.setItem(`editor:${tool}`, input);
      else sessionStorage.removeItem(`editor:${tool}`);
    } catch {
      // As above: losing the draft is survivable, failing the render is not.
    }
  }, [input, tool]);

  // Switching tool reuses this component, so a previous result would sit
  // under the new tool's heading as if it had produced it.
  useEffect(() => {
    setOutput("");
    setParts(null);
    setReport(null);
    setError(null);
    setWithheld(null);
    setStatus("idle");
  }, [tool]);

  useEffect(() => {
    setToolWallDismissed(paywallDismissed("tool"));
    setWantedTool(false);
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
  // Wall A. The ceiling is the plan's, never a number written here.
  const ceiling = PLANS[plan].limits.maxWordsPerRequest;
  const overflowed = words > ceiling;
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
    // Measured from the click, not from the response: what the visitor
    // waits through includes the anti-bot check and the queue.
    const startedAt = Date.now();
    track(posthog, "tool_run", {
      tool,
      logged_in: plan !== "anonymous",
      words_in: words,
      quota_left: remaining,
    });
    setOutput("");
    setParts(null);
    setReport(null);
    setWithheld(null);
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
          locale,
          turnstileToken: tokenRef.current || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        // The first thing a visitor ever sees from us must not be an
        // anti-bot failure, so it is counted apart from every other
        // refusal. `retry_ok` is false until C3 adds the silent retry.
        if (res.status === 403 && data?.error === "captcha_failed") {
          track(posthog, "antibot_error", { tool, retry_ok: false });
        }
        if (res.status === 429) {
          // The allowance is spent and the server produced the result
          // anyway: wall B shows the beginning of it. When it did not --
          // a paid plan out of monthly words, or the day's one preview
          // already spent -- the banner says so without a teaser.
          if (typeof data?.partialResult === "string") {
            // The wall counts itself when it opens (PaywallDialog).
            setWithheld(data as WithheldResult);
          } else {
            track(posthog, "wall_shown", {
              variant: "inline",
              reason: "quota",
              plan,
              tool,
            });
            setUpsell(true);
          }
        }
        setError(data?.message ?? t("genericError"));
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
        track(posthog, "tool_result", {
          tool,
          ms: Date.now() - startedAt,
          truncated: overflowed,
        });
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
      track(posthog, "tool_result", {
        tool,
        ms: Date.now() - startedAt,
        truncated: overflowed,
      });
      setParts(await diffParts(sent, acc));
    } catch {
      setError(t("connectionError"));
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

      {/* Wall C. It opens on the first attempt to use the tool -- a click
          into the box, or the button -- and not on arrival.
          
          The design says "when a free user opens the paraphraser", but
          these pages are the SEO asset: a modal covering the content of a
          page someone reached from a search result is an intrusive
          interstitial, which Google demotes on mobile. Waiting for the
          first interaction keeps the rule that the wall answers an action
          while leaving the landing readable and indexable. */}
      {!included && wantedTool && !toolWallDismissed && (
        <ToolPaywall
          tool={tool}
          plan={plan}
          onDismiss={() => {
            rememberPaywallDismissal("tool");
            setToolWallDismissed(true);
          }}
        />
      )}

      <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
        {modes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b px-5 py-3">
            {modes.map((m) => (
              <Chip key={m} pressed={m === mode} onClick={() => setPicked(m)}>
                {modeLabel(m)}
              </Chip>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 md:divide-x">
          <div className="flex flex-col">
            <EditorInput
              value={input}
              onChange={setInput}
              onReach={included ? undefined : () => setWantedTool(true)}
              placeholder={t("placeholder")}
              label={t("inputLabel")}
              ceiling={ceiling}
              overflowed={overflowed}
              className="min-h-44 md:min-h-64"
            />
            <p
              // Rendered from state, so it is also the signal that the
              // client has taken over: before hydration the box can hold
              // text while React still believes it is empty.
              data-testid="word-count"
              className="text-muted-foreground border-t px-5 py-2 text-xs"
            >
              {t("words", { words })}
              {remaining !== null && t("remaining", { words: remaining })}
            </p>
          </div>

          <div className="flex min-h-44 flex-col border-t md:min-h-64 md:border-t-0">
            {measures && report ? (
              <DetectorResultView
                result={report.analysis}
                text={report.text}
                plan={plan}
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
                          ? t("analyzing")
                          : t("writing")
                        : measures
                          ? t("analysisHere")
                          : t("resultHere")}
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

        {overflowed && <OverflowNotice ceiling={ceiling} submitted={words} />}

        <div className="flex flex-wrap items-center gap-3 border-t px-5 py-3">
          <Button
            onClick={included ? run : () => setWantedTool(true)}
            disabled={included && (status === "loading" || words === 0)}
            size="lg"
          >
            {!included
              ? t("paywallCta")
              : status === "loading"
                ? t("processing")
                : names(`${tool}.name`)}
          </Button>
          {status === "done" && !measures && (
            <Button
              variant="outline"
              onClick={() => navigator.clipboard.writeText(output)}
            >
              {t("copyResult")}
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

      {upsell && (
        <UpsellBanner
          tone="quota"
          title={t("quotaTitle")}
          action={
            <Button size="sm" asChild>
              <Link href="/pricing">{t("seePlans")}</Link>
            </Button>
          }
        >
          {t("quotaBody", { days: TRIAL.days })}
        </UpsellBanner>
      )}

      {withheld && !paywallDismissed("quota") && (
        <QuotaPaywall
          tool={tool}
          plan={plan}
          result={withheld}
          onDismiss={() => {
            rememberPaywallDismissal("quota");
            setWithheld(null);
          }}
        />
      )}
    </div>
  );
}
