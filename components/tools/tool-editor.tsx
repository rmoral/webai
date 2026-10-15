"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import Script from "next/script";
import { Loader2 } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import type { Change } from "diff";

import { useAllowance } from "@/components/billing/allowance";
import type { Allowance } from "@/lib/usage/quotas";
import {
  QuotaPaywall,
  UsesPaywall,
  paywallDismissed,
  rememberPaywallDismissal,
  type WithheldResult,
} from "@/components/billing/paywall";
import { SignupInvite } from "@/components/billing/signup-invite";
import { UpsellBanner } from "@/components/billing/upsell-banner";
import {
  EditorInput,
  LimitNotice,
  RunCost,
  limitKind,
  type LimitKind,
} from "@/components/tools/overflow";
import { DetectorResultView } from "@/components/tools/detector-result";
import { Hint, tourStep, useTour } from "@/components/tools/tour";
import {
  DiffMarks,
  HighlightLegend,
  diffParts,
} from "@/components/tools/highlight";
import { CheckoutButton } from "@/components/marketing/checkout-button";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { UI_VERSION, track } from "@/lib/analytics/events";
import { TOOLS, resolveMode, type ToolId } from "@/lib/ai/tools";
import type { DetectorAnalysis } from "@/lib/ai/detector/types";
import { useViewer } from "@/components/marketing/viewer";
import { PLANS, type PlanId } from "@/lib/billing/plans";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { countWords, truncateToWords } from "@/lib/security/validation";
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
          /** Invisible unless Cloudflare decides it needs a click. */
          appearance?: "always" | "execute" | "interaction-only";
          "before-interactive-callback"?: () => void;
          "after-interactive-callback"?: () => void;
        },
      ) => string;
      reset: (id: string) => void;
    };
  }
}

const TURNSTILE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function ToolEditor({
  tool,
  plan: serverPlan = "anonymous",
  initialRemaining = null,
  periodEnd = null,
  showCost = false,
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
  /**
   * The cost line beside the button. /app only: on the landings it pushed
   * the button below the fold and said what the counter and the strip
   * already say (F1-12).
   */
  showCost?: boolean;
}) {
  const t = useTranslations("editor");
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

  // The three first-visit hints. Derived from the editor's own state, and
  // given no setter for anything -- see components/tools/tour.tsx.
  const tour = useTour();
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
  // Wall C: the day's runs of a tool metered by uses are spent, and the
  // button was pressed anyway.
  const [usesWall, setUsesWall] = useState(false);
  // Runs of this tool spent today, on a plan that meters it by uses.
  // Unknown until the server says.
  const [usesUsed, setUsesUsed] = useState<number | null>(null);
  // Whether they have reached for the box at all, which is when the
  // counter asks what is left. See the allowance below.
  const [reached, setReached] = useState(false);
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
  const resultRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const detector = useTranslations("detector");
  const posthog = usePostHog();

  // Who is reading, on a page whose server render could not know.
  //
  // Nothing here trusts the browser with anything it could gain by lying:
  // the endpoint checks the session itself and answers to that. What this
  // fixes is the opposite failure -- a customer being offered a free
  // account, walled out of a tool they pay for, or held to the anonymous
  // ceiling, on a page that had simply assumed the worst about them.
  const viewer = useViewer();
  const plan = viewer?.plan ?? serverPlan;

  // Whether this plan meters the tool by uses rather than words (F2-01):
  // so many words a run, so many runs a day, apart from the word allowance.
  const metered = PLANS[plan].limits.uses[tool];

  // The anti-bot check stays keyed to what the server said. A browser that
  // claimed a plan could otherwise skip it; claiming to be anonymous only
  // ever means answering one more challenge.
  const needsToken = Boolean(TURNSTILE_KEY) && serverPlan === "anonymous";
  // Callers waiting for the next token: a click that came before the
  // widget had answered, and the silent retry. Both wait for the widget
  // instead of guessing at a delay.
  const waiting = useRef<((token: string) => void)[]>([]);
  // Cloudflare asked for a click. The widget is invisible until then
  // (`interaction-only`), and then it shows in the empty result panel.
  const [interactive, setInteractive] = useState(false);

  const receiveToken = useCallback((token: string) => {
    tokenRef.current = token;
    waiting.current.splice(0).forEach((resolve) => resolve(token));
  }, []);

  const loseToken = useCallback(() => {
    tokenRef.current = "";
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
  //
  // Nothing is written back until the draft has been read for this tool:
  // the write would otherwise run first, with the empty initial box, and
  // delete the draft it was about to restore -- which is what a second
  // mount does (React's development double run, or another tool handing
  // its text over, F2-04).
  const [restoredFor, setRestoredFor] = useState<ToolId | null>(null);
  useEffect(() => {
    try {
      setInput(sessionStorage.getItem(`editor:${tool}`) ?? "");
    } catch {
      // Private mode, or storage denied. An empty box is a fine fallback.
    }
    setRestoredFor(tool);
  }, [tool]);

  useEffect(() => {
    if (restoredFor !== tool) return;
    try {
      if (input) sessionStorage.setItem(`editor:${tool}`, input);
      else sessionStorage.removeItem(`editor:${tool}`);
    } catch {
      // As above: losing the draft is survivable, failing the render is not.
    }
  }, [input, tool, restoredFor]);

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
    setUsesWall(false);
    setUsesUsed(null);
    askedAllowance.current = false;
  }, [tool]);

  // Rendered when the script says it is ready -- on load, and on every
  // mount after that -- rather than by polling for `window.turnstile`.
  const renderWidget = useCallback(() => {
    if (!window.turnstile || !widgetRef.current || widgetId.current) return;
    widgetId.current = window.turnstile.render(widgetRef.current, {
      sitekey: TURNSTILE_KEY!,
      appearance: "interaction-only",
      callback: receiveToken,
      "expired-callback": loseToken,
      "error-callback": loseToken,
      "before-interactive-callback": () => setInteractive(true),
      "after-interactive-callback": () => setInteractive(false),
    });
  }, [receiveToken, loseToken]);

  // Which build of the landing a funnel event came from (F2), so the
  // before and after of a redesign can be told apart in PostHog.
  useEffect(() => {
    posthog?.register({ ui_version: UI_VERSION });
  }, [posthog]);

  // Whichever is fresher: the shared figure, or the last response this
  // editor saw. They are the same number from the same source. A tool
  // metered by uses spends no words, so it has none to run out of.
  const left = metered ? null : (remaining ?? allowance?.remaining ?? null);

  const words = countWords(input);
  // The ceiling is the plan's, never a number written here: a run's words
  // on a tool metered by uses, the request size otherwise.
  const ceiling = metered?.perUse ?? PLANS[plan].limits.maxWordsPerRequest;
  // The day's runs are spent: the button opens wall C (F2-01).
  const usesSpent =
    metered !== undefined &&
    usesUsed !== null &&
    usesUsed >= metered.usesPerDay;
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
    perUse: metered !== undefined,
  });
  // A daily allowance for the free tiers, a monthly one for the paid.
  const monthly = PLANS[plan].limits.wordsPerDay === null;
  // Nothing will run as asked: the strip says why, and the button opens
  // the wall instead of sending a request that can only be refused.
  const blocked = kind === "exhausted";
  // The detector over what this run can analyse (F2-03): the notice says
  // so, the button offers the first `processable` words, and the text is
  // dimmed from the cut on -- never refused, never cut in silence.
  const detectorCut = measures && processable > 0 && words > processable;
  // Dimming marks the cut, so it only exists when something is cut and
  // something else is kept.
  const dimmed = !blocked && processable > 0 && words > processable;

  // The counter in the box (F2-02): what is in it over what is left, so
  // the limit is on screen before anything is pasted. Until the server has
  // said, a first visit's whole allowance -- which is what it has.
  const allowanceLeft =
    left ??
    (monthly
      ? PLANS[plan].limits.wordsPerMonth
      : PLANS[plan].limits.wordsPerDay) ??
    ceiling;
  const counterOver = metered
    ? words > ceiling || usesSpent
    : words > Math.min(ceiling, allowanceLeft);
  const counter = metered
    ? t("quota.uses", {
        words: format.number(words),
        perUse: format.number(metered.perUse),
        used: usesUsed ?? 0,
        uses: metered.usesPerDay,
      })
    : t("quota.words", {
        words: format.number(words),
        left: format.number(allowanceLeft),
        window: monthly ? "month" : "day",
      });

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
      reason: kind === "overflow" || kind === "perUse" ? "overflow" : "quota",
      plan,
      tool,
    });
  }, [kind, plan, tool, posthog]);

  // The per-request ceiling is the one limit a free account does not
  // move: anonymous and free both stop at the same number of words per
  // run. Offering "create a free account" there would be offering
  // something that does not fix what the reader just ran into.
  // The strip's own button: white on amber, so it reads as part of the
  // notice rather than as a second run button beside the real one.
  const noticeButton =
    "border-warning-line text-warning-ink hover:bg-warning-soft h-8 shrink-0 px-3 text-[13px] font-semibold md:h-8";
  const seePlans = (
    <Button size="sm" variant="outline" className={noticeButton} asChild>
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

  // What is left, for a page that has no server render to read it from.
  //
  // Asked for when the reader reaches for the box rather than on load: the
  // tool landings are the SEO asset, and a request per visit to tell a
  // crawler how many words it has left is paid on every visit and read on
  // almost none. Focus comes before any paste, so the counter in the box is
  // true before there is anything in it (F2-02). Until then it shows the
  // plan's full allowance, which is what a first visit has.
  const askedAllowance = useRef(false);
  useEffect(() => {
    const needWords = !metered && remaining === null && !allowance;
    const needUses = metered !== undefined && usesUsed === null;
    if (!needWords && !needUses) return;
    // The two answers in one shape: /api/usage, or the viewer's copy of it.
    const take = (data: Allowance | null) => {
      if (!data) return;
      if (needWords && typeof data.remaining === "number") {
        setRemaining(data.remaining);
        reportAllowance(data);
      }
      const runs = data.uses?.[tool];
      if (needUses && runs) setUsesUsed(runs.used);
    };
    // A signed-in reader on a landing already has one: the viewer asked
    // for it on mount, and asking twice would spend a second read of the
    // same counter to learn the same number.
    if (viewer?.allowance) {
      take(viewer.allowance);
      return;
    }
    if (askedAllowance.current || (!reached && words === 0)) return;
    askedAllowance.current = true;
    fetch("/api/usage", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then(take)
      .catch(() => {
        // A number we could not read is a number we do not show.
      });
  }, [
    tool,
    metered,
    reached,
    words,
    remaining,
    usesUsed,
    allowance,
    reportAllowance,
    viewer,
  ]);

  /**
   * The token in hand, or the next one the widget hands out.
   *
   * The button no longer waits on Turnstile (F2): a click that comes first
   * shows the spinner and goes out the moment the token arrives. If the
   * widget never answers -- the script blocked, Cloudflare unreachable --
   * the request goes without one after `ms` and the server decides. An ad
   * blocker should cost a round trip, not the product.
   */
  function currentToken(ms: number): Promise<string> {
    if (tokenRef.current || !needsToken) {
      return Promise.resolve(tokenRef.current);
    }
    return new Promise((resolve) => {
      const waiter = (token: string) => {
        clearTimeout(timer);
        resolve(token);
      };
      const timer = setTimeout(() => {
        waiting.current = waiting.current.filter((w) => w !== waiter);
        resolve("");
      }, ms);
      waiting.current.push(waiter);
    });
  }

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
    return currentToken(8_000);
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
  const wayOut = (className?: string) =>
    plan === "anonymous" ? (
      <Button
        size="sm"
        variant={className ? "outline" : "default"}
        className={className}
        asChild
      >
        <Link href={{ pathname: "/signup", query: { next: here } }}>
          {wall("createAccount", {
            words: format.number(PLANS.free.limits.wordsPerDay ?? 0),
          })}
        </Link>
      </Button>
    ) : className ? (
      seePlans
    ) : (
      <Button size="sm" asChild>
        <Link href="/pricing">{t("seePlans")}</Link>
      </Button>
    );

  /**
   * "Recortar yo mismo": selects from the first word past the cut to the
   * end, with the caret at the cut so the box scrolls to it. Delete or cut
   * removes the lot; nothing is removed here (F2-03).
   */
  function selectPastCut() {
    const box = inputRef.current;
    if (!box) return;
    const kept = truncateToWords(input, processable).length;
    const start = kept + (input.slice(kept).match(/^\s*/)?.[0].length ?? 0);
    box.focus();
    box.setSelectionRange(start, input.length, "backward");
    // The box scrolls inside: bring the cut into view, a third of the way
    // down. Proportional rather than measured -- close enough for a line of
    // text, and the dimmed mirror follows the scroll.
    box.scrollTop = Math.max(
      0,
      (box.scrollHeight * start) / input.length - box.clientHeight / 3,
    );
  }

  /**
   * The button. Never disabled by a limit (F2): it does what it says, or
   * opens the wall that explains why it cannot.
   */
  function press() {
    // The verb stays on the button while it works, so a second press is
    // possible; it must not start a second request.
    if (status === "loading") return;
    // The day's runs are spent: wall C, every time it is pressed, rather
    // than a request the server could only refuse.
    if (usesSpent) {
      setUsesWall(true);
      return;
    }
    // A daily allowance that cannot cover the run: wall B, without a
    // request the server could only refuse. A paid plan's month goes to
    // the server, whose answer names the renewal and the top-up.
    if (!monthly && kind === "exhausted") {
      const limitToday = PLANS[plan].limits.wordsPerDay ?? 0;
      const spent = {
        visibleText: "",
        withheldWords: Math.min(words, ceiling),
        usedToday: limitToday - (left ?? 0),
        limitToday,
      };
      if (paywallDismissed("quota", tool)) setQuotaNotice(spent);
      else setWithheld(spent);
      return;
    }
    void run();
  }

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
      truncated: processable < words,
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
          // The cut the notice announced, so what comes back can never be
          // more than what the reader was told (F2-13).
          // Only when the reader pressed "Analizar las primeras {n}".
          truncate: detectorCut || undefined,
          maxWords:
            processable > 0 && processable < words ? processable : undefined,
        }),
      });

    try {
      let res = await send(await currentToken(10_000));

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
        // The runs were spent elsewhere -- another tab, another device on
        // the same account: the counter learns it and the wall says it.
        if (res.status === 429 && data?.error === "uses_exhausted") {
          setUsesUsed(typeof data.used === "number" ? data.used : null);
          setUsesWall(true);
          setStatus("idle");
          return;
        }
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
      const runsUsed = header("x-uses-used");
      if (runsUsed !== null) setUsesUsed(runsUsed);
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

  // On a phone the result is below the button, and below the fold: take
  // the reader to its first line once it is there, with the header's
  // height to spare. Not scrollIntoView, which would also move the page
  // sideways on a narrow screen and ignores the margin.
  useEffect(() => {
    if (status !== "done" || !resultRef.current) return;
    if (!window.matchMedia("(max-width: 639px)").matches) return;
    window.scrollTo({
      top: resultRef.current.getBoundingClientRect().top + window.scrollY - 64,
      behavior: "smooth",
    });
  }, [status]);

  const hint = tourStep({
    dismissed: tour.dismissed,
    hasModes: modes.length > 0,
    hasText: words > 0,
    hasResult: status === "done",
  });

  return (
    <div className="flex flex-col gap-4">
      {needsToken && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
          onReady={renderWidget}
        />
      )}

      {/* Wall C. It answers the button, never arrival: these pages are
          the SEO asset, and a modal over content reached from a search
          result is an intrusive interstitial. */}
      {usesWall && (
        <UsesPaywall
          tool={tool}
          plan={plan}
          onDismiss={() => setUsesWall(false)}
        />
      )}

      <div className="bg-card overflow-hidden rounded-[14px] border shadow-sm">
        {modes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b p-3 md:px-4">
            {modes.map((m) => (
              <Chip
                key={m}
                pressed={m === mode}
                onClick={() => setPicked(m)}
                className="h-8"
              >
                {modeLabel(m)}
              </Chip>
            ))}
          </div>
        )}

        {hint === 2 && <Hint step={2} onDismiss={tour.dismiss} />}

        <div className="grid md:grid-cols-2 md:divide-x">
          {/* The working column, in the order a phone reads it: the text
              with its counter, what is worth knowing about it, and the
              button -- above the result, so it is on screen before there
              is anything to scroll to (F1-03, F2). */}
          <div className="flex min-w-0 flex-col">
            <EditorInput
              inputRef={inputRef}
              value={input}
              onChange={setInput}
              onReach={() => setReached(true)}
              placeholder={t("placeholder")}
              label={t("inputLabel")}
              processable={processable}
              dimmed={dimmed}
              className="h-[200px] md:h-[140px]"
            >
              {/* Inside the box, so it takes no room and moves nothing
                  when the real figure arrives (F2-02, F2-12). Rendered
                  from state, so it is also the signal that the client has
                  taken over: before hydration the box can hold text while
                  React still believes it is empty. */}
              <p
                data-testid="word-count"
                aria-live="polite"
                className={cn(
                  "pointer-events-none absolute right-2 bottom-2 h-5 rounded-[5px] bg-white/95 px-1.5 text-xs leading-5 text-neutral-500 tabular-nums",
                  counterOver &&
                    "bg-warning-soft text-warning-ink font-semibold",
                )}
              >
                {counter}
              </p>
            </EditorInput>

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
                tool={tool}
                action={
                  // A run's cut says what happens and nothing else: the
                  // button below still runs (F2-01).
                  // The detector's cut is offered by the button below, and
                  // the price line already has "Ver planes" (F2-03).
                  kind === "perUse" ||
                  kind === "detector" ||
                  kind === "detectorTooLong"
                    ? null
                    : kind === "overflow"
                      ? seePlans
                      : kind === "exhausted" && monthly
                        ? topUp
                        : wayOut(noticeButton)
                }
              />
            )}

            {/* What the next run costs, before the click rather than
                after. In the app only; see `showCost`. */}
            {showCost && (
              <div className={cn("px-3 py-2 md:px-4", !kind && "border-t")}>
                <RunCost
                  words={words}
                  ceiling={ceiling}
                  remaining={left}
                  monthly={monthly}
                  detector={measures}
                />
              </div>
            )}

            <div
              className={cn(
                "relative p-3 md:flex md:items-center md:gap-3 md:px-4",
                !kind && !showCost && "border-t",
              )}
            >
              <Button
                onClick={press}
                // Only an empty box: a spent allowance opens the wall, and
                // a click before Turnstile answers waits for it (F2).
                disabled={words === 0}
                aria-busy={status === "loading"}
                size="lg"
                className="w-full disabled:cursor-not-allowed disabled:opacity-45 md:w-auto md:min-w-[220px]"
                data-testid="run"
              >
                {status === "loading" && (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                )}
                {detectorCut
                  ? detector("analyzeFirst", { n: format.number(processable) })
                  : t(`run.${tool}`)}
              </Button>
              {/* The other way out of the cut: select what will not be
                  analysed, so one keystroke removes it (F2-03). */}
              {detectorCut && (
                <Button
                  variant="link"
                  className="text-brand mt-1 h-11 w-full text-[15px] font-semibold md:mt-0 md:w-auto"
                  onClick={selectPastCut}
                >
                  {detector("trimMyself")}
                </Button>
              )}
            </div>
          </div>

          <div
            ref={resultRef}
            className="flex min-h-[120px] min-w-0 flex-col border-t md:min-h-64 md:border-t-0"
          >
            {/* Invisible unless Cloudflare wants a click, and then here, in
                the empty result panel: it never inserts a row under the
                button (F2-12). */}
            {needsToken && (
              <div
                ref={widgetRef}
                className={cn(interactive && "flex justify-center p-3")}
              />
            )}
            {hint === 3 && <Hint step={3} onDismiss={tour.dismiss} />}
            {measures && report ? (
              <DetectorResultView
                result={report.analysis}
                text={report.text}
                plan={plan}
                actions={
                  // From the verdict to the next step (F2-04): the other
                  // tool with this text, or a fresh one here.
                  <>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-brand text-brand hover:bg-brand-softer hover:text-brand w-full border-[1.5px] md:w-auto"
                      onClick={() => {
                        track(posthog, "cross_tool", {
                          from: tool,
                          to: "humanize",
                        });
                        // The humanizer's own draft slot: it reads it on
                        // mount, as it does when the reader comes back.
                        try {
                          sessionStorage.setItem(
                            "editor:humanize",
                            report.text,
                          );
                        } catch {
                          // The reader lands on an empty humanizer. Worse,
                          // but not broken.
                        }
                        router.push(TOOLS.humanize.path);
                      }}
                    >
                      {detector("humanizeThis")}
                    </Button>
                    <Button
                      variant="link"
                      className="text-brand h-11 w-full text-[15px] font-semibold md:w-auto"
                      onClick={() => {
                        setInput("");
                        setReport(null);
                        setStatus("idle");
                        inputRef.current?.focus();
                      }}
                    >
                      {detector("analyzeAnother")}
                    </Button>
                  </>
                }
              />
            ) : (
              <div className="flex-1 p-3 text-[15px] whitespace-pre-wrap md:p-4 md:text-sm">
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
              <div className="flex flex-wrap items-center gap-4 border-t px-3 py-2 md:px-4">
                <HighlightLegend kind="rewritten" />
                <HighlightLegend kind="added" />
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => navigator.clipboard.writeText(output)}
                >
                  {t("copyResult")}
                </Button>
              </div>
            )}
          </div>
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
        <UpsellBanner tone="quota" action={wayOut()}>
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

      {/* D5. The one offer that answers a result instead of a refusal, so
          it only appears when the result is the whole of what happened:
          no wall, no spent allowance, no error. Under the card and never
          over it -- the reader came for the text, not for us. */}
      {plan === "anonymous" &&
        status === "done" &&
        !withheld &&
        !quotaNotice &&
        !error && <SignupInvite tool={tool} next={here} />}
    </div>
  );
}
