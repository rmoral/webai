"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import Script from "next/script";
import { usePostHog } from "posthog-js/react";
import type { Change } from "diff";

import { useAllowance } from "@/components/billing/allowance";
import {
  QuotaPaywall,
  ToolLockPopover,
  ToolPaywall,
  paywallDismissed,
  rememberPaywallDismissal,
  type WithheldResult,
} from "@/components/billing/paywall";
import { UpsellBanner } from "@/components/billing/upsell-banner";
import {
  EditorInput,
  LimitNotice,
  RunCost,
  limitKind,
  type LimitKind,
} from "@/components/tools/overflow";
import { DetectorResultView } from "@/components/tools/detector-result";
import {
  DiffMarks,
  HighlightLegend,
  diffParts,
} from "@/components/tools/highlight";
import { CheckoutButton } from "@/components/marketing/checkout-button";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { track } from "@/lib/analytics/events";
import { TOOLS, resolveMode, type ToolId } from "@/lib/ai/tools";
import type { DetectorAnalysis } from "@/lib/ai/detector/types";
import { PLANS, type PlanId } from "@/lib/billing/plans";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { countWords } from "@/lib/security/validation";
import { minutesUntilQuotaReset } from "@/lib/usage/day";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          // A token lasts five minutes and is good for one request. Without
          // these two the widget goes quiet on expiry and the editor keeps
          // sending a token the server will refuse.
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      reset: (id: string) => void;
    };
  }
}

const TURNSTILE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function ToolEditor({
  tool,
  plan = "anonymous",
  initialRemaining = null,
  periodEnd = null,
}: {
  tool: ToolId;
  plan?: PlanId;
  /**
   * Words left when the page was rendered. `/app` reads it from the same
   * `peekWords` the header does; the landings are static and have none,
   * so they ask /api/usage once the reader starts writing.
   */
  initialRemaining?: number | null;
  /** When a paid plan's period renews. ISO, formatted here. */
  periodEnd?: string | null;
}) {
  const t = useTranslations("editor");
  const names = useTranslations("tools");
  const modeLabel = useTranslations("modes");
  const wall = useTranslations("paywall");
  const time = useTranslations("app");
  const pricing = useTranslations("pricing");
  const format = useFormatter();
  // Where to come back to after creating an account: this page, with the
  // text still in the box.
  const here = usePathname();
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
  // Wall B. Set when the allowance covered only part of what was asked
  // for: the reader has a real result and some words that were not done.
  const [withheld, setWithheld] = useState<WithheldResult | null>(null);
  // The same fact, in the flow, once the wall has been closed. Closing the
  // wall used to take the result with it, which is the one thing the
  // reader was there for.
  const [quotaNotice, setQuotaNotice] = useState<WithheldResult | null>(null);
  // Wall C, dismissed. Read from session storage on mount rather than
  // during render, because sessionStorage does not exist on the server and
  // reading it in the body would make the two renders disagree.
  const [toolWallDismissed, setToolWallDismissed] = useState(true);
  // Whether they have reached for the tool yet. See wall C below.
  const [wantedTool, setWantedTool] = useState(false);
  // Wall C, second time: the compact form, under the button.
  const [toolPopover, setToolPopover] = useState(false);
  // The allowance, shared with the header. `report` is what makes every
  // counter move at the same moment; outside the signed-in shell it is a
  // no-op and the editor keeps its own copy.
  // `report` is taken by the detector's own state, so the updater keeps
  // its full name here.
  const { allowance, report: reportAllowance } = useAllowance();
  const [remaining, setRemaining] = useState<number | null>(initialRemaining);
  // Whether the failed request can simply be tried again, which is true of
  // an anti-bot refusal and of nothing else.
  const [retryable, setRetryable] = useState(false);
  const tokenRef = useRef<string>("");
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string>(null);
  const posthog = usePostHog();

  // The anti-bot check is only asked of visitors without a session -- that
  // is the rule the server enforces -- and the marketing pages are static,
  // so everyone reading one counts as anonymous here.
  const needsToken = Boolean(TURNSTILE_KEY) && plan === "anonymous";
  // Whether a usable token is in hand. Held in state and not only in a ref
  // because the run button waits on it: the button used to be live before
  // Turnstile had resolved, so the first click of the visit -- the first
  // thing anyone does with the product -- answered "anti-bot check failed".
  const [hasToken, setHasToken] = useState(false);
  // Callers waiting for the next token, so a silent retry can ask for one
  // and wait for the widget instead of guessing at a delay.
  const waiting = useRef<((token: string) => void)[]>([]);
  // The escape hatch. If the widget never resolves -- the script blocked,
  // Cloudflare unreachable -- the button must not stay disabled forever:
  // after ten seconds the visitor goes through and the server decides.
  // An ad blocker should cost a round trip, not the product.
  const [waived, setWaived] = useState(false);

  const receiveToken = useCallback((token: string) => {
    tokenRef.current = token;
    setHasToken(true);
    waiting.current.splice(0).forEach((resolve) => resolve(token));
  }, []);

  const loseToken = useCallback(() => {
    tokenRef.current = "";
    setHasToken(false);
  }, []);

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
    setQuotaNotice(null);
    setStatus("idle");
  }, [tool]);

  useEffect(() => {
    setToolWallDismissed(paywallDismissed("tool", tool));
    setWantedTool(false);
    setToolPopover(false);
  }, [tool]);

  useEffect(() => {
    if (!needsToken || !widgetRef.current || widgetId.current) return;
    const interval = setInterval(() => {
      if (window.turnstile && widgetRef.current && !widgetId.current) {
        widgetId.current = window.turnstile.render(widgetRef.current, {
          sitekey: TURNSTILE_KEY!,
          callback: receiveToken,
          "expired-callback": loseToken,
          "error-callback": loseToken,
        });
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, [needsToken, receiveToken, loseToken]);

  useEffect(() => {
    if (!needsToken || hasToken || waived) return;
    const timer = setTimeout(() => setWaived(true), 10_000);
    return () => clearTimeout(timer);
  }, [needsToken, hasToken, waived]);

  // Whichever is fresher: the shared figure, or the last response this
  // editor saw. They are the same number from the same source.
  const left = remaining ?? allowance?.remaining ?? null;

  const words = countWords(input);
  // The ceiling is the plan's, never a number written here.
  const ceiling = PLANS[plan].limits.maxWordsPerRequest;
  // The detector measures the text instead of rewriting it, so it answers
  // with JSON rather than a stream and renders its own result view.
  const measures = tool === "detect";

  // What this run would actually process: the smaller of what was pasted,
  // what the plan takes in one request, and what is left of the
  // allowance. Everything the reader is told comes from this one figure,
  // which is why the strip could not say "the first 300" with nothing
  // left -- it no longer computes 300 in that case.
  const processable = Math.min(words, ceiling, left ?? Infinity);
  const overflowed = words > ceiling;
  // Which limit is binding, if any. One strip, never two.
  const kind = limitKind({
    words,
    ceiling,
    remaining: left,
    detector: measures,
  });
  // A daily allowance for the free tiers, a monthly one for the paid.
  const monthly = PLANS[plan].limits.wordsPerDay === null;
  // Nothing will run: the strip says why and the button says so too.
  const blocked =
    kind === "exhausted" || kind === "detector" || kind === "detectorTooLong";
  // Dimming marks the cut, so it only exists when something is cut and
  // something else is kept.
  const dimmed = !blocked && processable > 0 && words > processable;

  // How long until the allowance refills, in the timezone the quota
  // actually rolls over in (lib/usage/day.ts). Computed at render rather
  // than on a timer: CLAUDE.md rules out polling, and a number that is a
  // minute stale is a number nobody can tell is stale. Only computed when
  // a strip is on screen, which is almost never.
  const resetMinutes = kind ? minutesUntilQuotaReset() : 0;
  const resetsIn =
    resetMinutes === 0
      ? ""
      : resetMinutes >= 60
        ? time("time.hours", { n: Math.ceil(resetMinutes / 60) })
        : time("time.minutes", { n: resetMinutes });
  const renewsOn = periodEnd
    ? format.dateTime(new Date(periodEnd), {
        day: "numeric",
        month: "long",
      })
    : undefined;

  // The strip counts itself once per kind and session. It is derived from
  // the word count, so it re-renders on every keystroke; an event per
  // keystroke would drown the funnel it is meant to measure.
  const seenKinds = useRef(new Set<LimitKind>());
  useEffect(() => {
    if (!kind || seenKinds.current.has(kind)) return;
    seenKinds.current.add(kind);
    track(posthog, "wall_shown", {
      variant: "inline",
      reason: kind === "overflow" ? "overflow" : "quota",
      plan,
      tool,
    });
  }, [kind, plan, tool, posthog]);

  // The per-request ceiling is the one limit a free account does not
  // move: anonymous and free both stop at the same number of words per
  // run. Offering "create a free account" there would be offering
  // something that does not fix what the reader just ran into.
  const seePlans = (
    <Button size="sm" asChild>
      <Link href="/pricing">{t("seePlans")}</Link>
    </Button>
  );

  // Pro with the month spent is the one strip that does not lead to the
  // pricing page: the plan is already paid for, what is missing is words.
  const topUp = (
    <CheckoutButton
      plan="topup"
      interval="monthly"
      variant="outline"
      label={pricing("topupCta")}
    />
  );
  // Whether the plan may use this tool at all. Checked here so a visitor
  // sees the paywall before writing, not as a 403 after pressing the
  // button. The server enforces it either way.
  const included = PLANS[plan].limits.tools.includes(tool);

  // What is left, for a page that has no server render to read it from.
  //
  // Asked for when the reader starts writing rather than on load: the tool
  // landings are the SEO asset, and a request per visit to tell a crawler
  // how many words it has left is paid on every visit and read on almost
  // none. By the time there are words in the box the number matters, and
  // it is there before the button is pressed.
  const askedAllowance = useRef(false);
  useEffect(() => {
    if (askedAllowance.current || words === 0) return;
    if (remaining !== null || allowance) return;
    askedAllowance.current = true;
    fetch("/api/usage", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || typeof data.remaining !== "number") return;
        setRemaining(data.remaining);
        reportAllowance(data);
      })
      .catch(() => {
        // A number we could not read is a number we do not show.
      });
  }, [words, remaining, allowance, reportAllowance]);

  // Waiting on the anti-bot check, and not yet waived.
  const verifying = needsToken && !hasToken && !waived;

  /**
   * Asks the widget for a new token and waits for it.
   *
   * A token is spent by the request that carries it, and it expires after
   * five minutes, so the commonest anti-bot failure is a token that was
   * simply used or too old -- not a visitor who looks like a robot. Asking
   * for another one and trying again is what turns that into nothing the
   * reader ever sees. Resolves empty if the widget does not answer, and
   * then the failure is real.
   */
  function freshToken(): Promise<string> {
    const widget = widgetId.current;
    if (!widget || !window.turnstile) return Promise.resolve("");
    loseToken();
    window.turnstile.reset(widget);
    return new Promise((resolve) => {
      const waiter = (token: string) => {
        clearTimeout(timer);
        resolve(token);
      };
      const timer = setTimeout(() => {
        waiting.current = waiting.current.filter((w) => w !== waiter);
        resolve("");
      }, 8_000);
      waiting.current.push(waiter);
    });
  }

  /**
   * The one exit, wherever the limit is met.
   *
   * Both inline notices offer it and both offer the same one: an account
   * to somebody who has none -- which is free, and doubles their words --
   * and the plans to somebody who already signed up. The second attempt
   * used to end in a red banner whose only link was to pricing, offered
   * to a reader whose next step cost nothing.
   */
  const wayOut =
    plan === "anonymous" ? (
      <Button size="sm" asChild>
        <Link href={{ pathname: "/signup", query: { next: here } }}>
          {wall("createAccount", {
            words: format.number(PLANS.free.limits.wordsPerDay ?? 0),
          })}
        </Link>
      </Button>
    ) : (
      <Button size="sm" asChild>
        <Link href="/pricing">{t("seePlans")}</Link>
      </Button>
    );

  async function run() {
    setStatus("loading");
    setError(null);
    setRetryable(false);
    // Measured from the click, not from the response: what the visitor
    // waits through includes the anti-bot check and the queue.
    const startedAt = Date.now();
    track(posthog, "tool_run", {
      tool,
      logged_in: plan !== "anonymous",
      words_in: words,
      quota_left: left,
    });
    setOutput("");
    setParts(null);
    setReport(null);
    setWithheld(null);
    setQuotaNotice(null);
    // Frozen so the diff compares against what was actually sent, even if
    // the user keeps typing while the answer streams in.
    const sent = input;
    const send = (token: string) =>
      fetch(`/api/ai/${tool}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text: input,
          mode,
          locale,
          turnstileToken: token || undefined,
        }),
      });

    try {
      let res = await send(tokenRef.current);

      // One silent retry with a fresh token. The first thing a visitor
      // ever sees from us must not be "anti-bot check failed", and an
      // expired or already-spent token is the usual cause -- neither is
      // anything the reader can act on, so they are not told about it.
      if (res.status === 403) {
        const refusal = await res
          .clone()
          .json()
          .catch(() => null);
        if (refusal?.error === "captcha_failed") {
          const fresh = await freshToken();
          if (fresh) res = await send(fresh);
          track(posthog, "antibot_error", {
            tool,
            retry_ok: fresh !== "" && res.ok,
          });
        }
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        // Only an anti-bot refusal is worth a retry button: every other
        // failure here means trying again changes nothing.
        setRetryable(res.status === 403 && data?.error === "captcha_failed");
        // A 429 now means the allowance is spent outright -- the server
        // reserves words before it calls the model, so there is no result
        // to show and nothing was generated. When some words were left,
        // the answer is a normal one with fewer words in it.
        if (res.status === 429 && data?.error === "quota_exceeded") {
          if (typeof data.used === "number" && typeof data.limit === "number") {
            setRemaining(Math.max(0, data.limit - data.used));
            reportAllowance({
              used: data.used,
              limit: data.limit,
              remaining: Math.max(0, data.limit - data.used),
              metered: allowance?.metered ?? true,
            });
          }
        }
        setError(data?.message ?? t("genericError"));
        setStatus("idle");
        return;
      }

      // One reading of the allowance, from the response that just spent
      // it: the header bar, the editor and the wall are all written from
      // these three numbers, so they cannot disagree.
      const header = (name: string) => {
        const value = res.headers.get(name);
        return value === null ? null : Number(value);
      };
      const processed = header("x-words-processed");
      const limitToday = header("x-words-limit");
      const usedToday = header("x-words-used");
      const stillLeft = header("x-words-remaining");
      if (stillLeft !== null) {
        setRemaining(stillLeft);
        // The header bar and the account page read the same figure, and
        // they read it now rather than on the next navigation.
        if (limitToday !== null) {
          reportAllowance({
            used: usedToday ?? 0,
            limit: limitToday,
            remaining: stillLeft,
            metered: allowance?.metered ?? true,
          });
        }
      }

      // What the allowance could not cover. `wanted` is what the request
      // asked for after wall A's cut, so this counts only the words denied
      // for want of quota -- the ones wall A removed are already named by
      // its own notice.
      const wanted = Math.min(words, ceiling);
      const shortfall =
        processed === null ? 0 : Math.max(0, wanted - processed);

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
        truncated: overflowed || shortfall > 0,
      });
      setParts(await diffParts(sent, acc));

      if (shortfall > 0 && limitToday !== null) {
        const ran = {
          visibleText: acc,
          withheldWords: shortfall,
          usedToday: usedToday ?? limitToday,
          limitToday,
        };
        // Closed once this session, for this tool: the offer stays, in the
        // flow, instead of taking over the screen a second time.
        if (paywallDismissed("quota", tool)) setQuotaNotice(ran);
        else setWithheld(ran);
      }
    } catch {
      setError(t("connectionError"));
      setStatus("idle");
    } finally {
      // The token that was just sent is spent, whatever came back. Clearing
      // it alongside the reset is what stops the *second* run from going
      // out with a dead token -- the same race as the first click, one
      // request later, and the button now waits for the new one.
      if (widgetId.current) {
        loseToken();
        window.turnstile?.reset(widgetId.current);
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {needsToken && (
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
            rememberPaywallDismissal("tool", tool);
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
              processable={processable}
              dimmed={dimmed}
              className="min-h-44 md:min-h-64"
            />
            <p
              // Rendered from state, so it is also the signal that the
              // client has taken over: before hydration the box can hold
              // text while React still believes it is empty.
              data-testid="word-count"
              className="text-muted-foreground border-t px-5 py-2 text-xs"
            >
              <span
                className={cn(
                  (words > processable || blocked) && "text-danger-ink",
                )}
              >
                {t("words", { words })}
              </span>
              {dimmed &&
                wall("maxThisRequest", { words: format.number(processable) })}
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

        {kind && (
          <LimitNotice
            kind={kind}
            plan={plan}
            words={words}
            ceiling={ceiling}
            remaining={left}
            resetsIn={resetsIn}
            renewsOn={renewsOn}
            monthly={monthly}
            action={
              kind === "overflow"
                ? seePlans
                : kind === "exhausted" && monthly
                  ? topUp
                  : wayOut
            }
          />
        )}

        <div className="flex flex-wrap items-center gap-3 border-t px-5 py-3">
          <Button
            onClick={
              included
                ? run
                : () => {
                    setWantedTool(true);
                    // The modal is shown once per tool per session. After
                    // that this button had nothing left to open, so it did
                    // nothing at all -- a dead control on the one screen
                    // where the reader is asking to buy.
                    if (toolWallDismissed) setToolPopover(true);
                  }
            }
            disabled={
              included &&
              (status === "loading" || words === 0 || verifying || blocked)
            }
            size="lg"
            // The label legitimately changes -- the tool, "Verificando…",
            // "Sin palabras hoy" -- so the tests need something that does
            // not.
            data-testid="run"
          >
            {!included
              ? t("paywallCta")
              : status === "loading"
                ? t("processing")
                : kind === "exhausted"
                  ? wall(monthly ? "noWordsMonth" : "noWordsDay")
                  : verifying
                    ? t("verifying")
                    : names(`${tool}.name`)}
          </Button>
          {/* What the next run costs, before the click rather than after. */}
          <RunCost
            words={words}
            ceiling={ceiling}
            remaining={left}
            monthly={monthly}
            detector={measures}
          />
          {status === "done" && !measures && (
            <Button
              variant="outline"
              onClick={() => navigator.clipboard.writeText(output)}
            >
              {t("copyResult")}
            </Button>
          )}
          {toolPopover && !included && (
            <div className="relative">
              <ToolLockPopover
                tool={tool}
                plan={plan}
                onClose={() => setToolPopover(false)}
              />
            </div>
          )}
          <div ref={widgetRef} className="ml-auto" />
        </div>
      </div>

      {error && (
        <p
          className="text-destructive flex flex-wrap items-center gap-3 text-sm"
          role="alert"
        >
          {error}
          {/* An anti-bot failure that survived the silent retry is the one
              error with a way out, so it carries the way out. */}
          {retryable && (
            <Button size="sm" variant="outline" onClick={run}>
              {t("retry")}
            </Button>
          )}
        </p>
      )}

      {/* Closing wall B keeps the result. It used to take it with it:
          the reader pressed Escape -- the only way out there was -- and
          the words they had just waited for went with the modal. */}
      {quotaNotice && (
        <UpsellBanner tone="quota" action={wayOut}>
          {wall("quotaInline", {
            words: format.number(quotaNotice.withheldWords),
          })}
        </UpsellBanner>
      )}

      {withheld && (
        <QuotaPaywall
          tool={tool}
          plan={plan}
          result={withheld}
          onDismiss={() => {
            rememberPaywallDismissal("quota", tool);
            // The offer moves into the flow, and the result stays where
            // the reader left it.
            setQuotaNotice(withheld);
            setWithheld(null);
          }}
        />
      )}
    </div>
  );
}
