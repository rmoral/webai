"use client";

import { useRef, type ChangeEvent } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";

import { PLANS, TOPUP, formatUsd, type PlanId } from "@/lib/billing/plans";
import type { Locale } from "@/lib/i18n/routing";
import { truncateToWords } from "@/lib/security/validation";
import { cn } from "@/lib/utils";

// D3 — what the limits look like before the reader presses anything.
//
// It informs and never interrupts: no modal, no red. A ceiling is not an
// error, so every strip is amber. And the reader's text is never touched:
// what will not be processed is dimmed and stays in the box.
//
// The strip this replaces said "Procesamos las primeras 300 palabras"
// whatever the balance was -- including when the balance was zero and
// nothing at all would be processed -- and showed "300 / 300" in red
// without saying what either number meant.

const TEXTAREA_CLASS =
  "w-full resize-y bg-transparent p-5 text-base outline-none md:text-sm";

/**
 * The editor's input box, with everything past the cut dimmed.
 *
 * A textarea cannot style part of its own value, so the overflow state
 * renders a mirror underneath it -- same font, same padding, same wrapping
 * -- and makes the real text transparent. The mirror is `aria-hidden`: the
 * textarea still holds the whole value and a screen reader still reads it,
 * because the words are not being withheld, only marked.
 *
 * `processable` is the cut, and it is not always the plan's ceiling: with
 * 200 words of balance left it is 200. Below the cut there is no mirror
 * and no transparency, so the ordinary case is an ordinary textarea.
 */
export function EditorInput({
  value,
  onChange,
  placeholder,
  label,
  processable,
  dimmed,
  className,
  onReach,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  /** Words that will be processed. Everything after this is dimmed. */
  processable: number;
  /** Whether there is anything to dim at all. */
  dimmed: boolean;
  className?: string;
  /** Called the first time the box is reached for, for wall C. */
  onReach?: () => void;
}) {
  const mirror = useRef<HTMLDivElement>(null);

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange(event.target.value);
  }

  const kept = dimmed ? truncateToWords(value, processable) : value;

  return (
    <div className="relative">
      {dimmed && (
        <div
          ref={mirror}
          aria-hidden
          className={`${TEXTAREA_CLASS} pointer-events-none absolute inset-0 overflow-hidden break-words whitespace-pre-wrap`}
        >
          {kept}
          {/* Where the cut falls, so the reader can see it rather than
              count to it. */}
          <span className="border-warning-fill mx-px inline-block h-[1em] translate-y-[0.15em] border-l-2" />
          <span className="opacity-[0.38]">{value.slice(kept.length)}</span>
        </div>
      )}
      <textarea
        value={value}
        onChange={handleChange}
        onFocus={onReach}
        onScroll={(event) => {
          if (mirror.current) {
            mirror.current.scrollTop = event.currentTarget.scrollTop;
          }
        }}
        placeholder={placeholder}
        aria-label={label}
        className={`${TEXTAREA_CLASS} relative ${className ?? ""} ${
          dimmed ? "caret-foreground text-transparent" : ""
        }`}
      />
    </div>
  );
}

/**
 * Which limit is binding, if any.
 *
 * One strip at a time, and it is the one with the smaller figure: two
 * strips would be two answers to the same question. `exhausted` comes
 * first because nothing can run at all, and the detector's two cases come
 * next because they are refusals rather than cuts.
 */
export type LimitKind =
  "overflow" | "partial" | "exhausted" | "detector" | "detectorTooLong";

export function limitKind({
  words,
  ceiling,
  remaining,
  detector,
}: {
  words: number;
  ceiling: number;
  /** Words left in the window. `null` when unmetered or not yet known. */
  remaining: number | null;
  detector: boolean;
}): LimitKind | null {
  if (words === 0) return null;
  if (remaining === 0) return "exhausted";

  const wanted = Math.min(words, ceiling);
  if (detector && words > ceiling) return "detectorTooLong";
  if (detector && remaining !== null && remaining < wanted) return "detector";
  if (remaining !== null && remaining < wanted) return "partial";
  if (words > ceiling) return "overflow";
  return null;
}

/**
 * The strip under the editor panels: what will happen, and the one way
 * out of it that costs the reader the least.
 */
export function LimitNotice({
  kind,
  plan,
  words,
  ceiling,
  remaining,
  resetsIn,
  renewsOn,
  monthly,
  action,
}: {
  kind: LimitKind;
  plan: PlanId;
  /** Words in the box. */
  words: number;
  ceiling: number;
  remaining: number | null;
  /** How long until the daily allowance refills, already formatted. */
  resetsIn: string;
  /** When a paid plan's period renews, already formatted. */
  renewsOn?: string;
  /** Whether this plan's allowance is monthly rather than daily. */
  monthly: boolean;
  /** The way out. The caller decides it: it depends on who is reading. */
  action: React.ReactNode;
}) {
  const t = useTranslations("paywall");
  const format = useFormatter();
  const locale = useLocale() as Locale;
  const n = (value: number) => format.number(value);

  const anonymous = plan === "anonymous";
  const left = remaining ?? 0;
  const dailyLimit = PLANS[plan].limits.wordsPerDay ?? 0;

  let lead: string;
  let body: string;

  if (kind === "overflow") {
    lead = t("overflowLead", { words: n(ceiling) });
    body = t("overflowBody", {
      submitted: n(words),
      pro: n(PLANS.pro.limits.maxWordsPerRequest),
      unlimited: n(PLANS.unlimited.limits.maxWordsPerRequest),
    });
  } else if (kind === "partial") {
    lead = t("partialLead", { left: n(left) });
    body = t("partialBody", {
      left: n(left),
      submitted: n(words),
      time: resetsIn,
    });
  } else if (kind === "detectorTooLong") {
    lead = t("detectorLead");
    body = t("detectorTooLongBody", {
      words: n(words),
      ceiling: n(ceiling),
      pro: n(PLANS.pro.limits.maxWordsPerRequest),
      unlimited: n(PLANS.unlimited.limits.maxWordsPerRequest),
    });
  } else if (kind === "detector") {
    lead = t("detectorLead");
    body = t("detectorBody", {
      words: n(Math.min(words, ceiling)),
      left: n(left),
      time: resetsIn,
    });
  } else if (monthly) {
    lead = t("spentProLead");
    body = t("spentProBody", {
      date: renewsOn ?? "",
      words: n(TOPUP.words),
      price: formatUsd(TOPUP.amount, locale),
    });
  } else {
    lead = t("spentLead", { limit: n(dailyLimit) });
    body = anonymous
      ? t("spentBodyAnon", {
          time: resetsIn,
          free: n(PLANS.free.limits.wordsPerDay ?? 0),
        })
      : t("spentBody", { time: resetsIn });
  }

  return (
    <div
      role="status"
      data-kind={kind}
      data-testid="limit-notice"
      className="border-warning-line bg-warning-soft flex flex-wrap items-center gap-x-4 gap-y-3 border-t px-5 py-3"
    >
      <p className="text-warning-ink flex-1 basis-72 text-sm leading-normal">
        <b className="font-semibold">{lead}</b>
        {body}
      </p>
      {action}
    </div>
  );
}

/**
 * What the next run will cost, beside the button: before the click rather
 * than after it.
 *
 *   142 palabras · te quedan 358 hoy
 *   923 palabras · se procesarán 200 · te quedan 200
 *   923 palabras · no te quedan palabras hoy
 *   280 palabras · necesita 280 · te quedan 200      (detector)
 *
 * `remaining === null` means the server has not said yet -- a first
 * anonymous visit, before /api/usage answers. The balance segment is left
 * out rather than guessed.
 */
export function RunCost({
  words,
  ceiling,
  remaining,
  monthly,
  detector,
}: {
  words: number;
  ceiling: number;
  remaining: number | null;
  monthly: boolean;
  detector: boolean;
}) {
  const t = useTranslations("paywall");
  const format = useFormatter();
  const n = (value: number) => format.number(value);

  if (words === 0) return null;

  const window = monthly ? t("windowMonth") : t("windowDay");
  const cap = remaining === null ? ceiling : Math.min(ceiling, remaining);
  const over = words > cap;
  const wanted = Math.min(words, ceiling);

  const parts: { text: string; tone?: "cut" }[] = [];
  if (remaining === 0) {
    parts.push({ text: t("costNone", { window }), tone: "cut" });
  } else if (detector && remaining !== null && remaining < wanted) {
    parts.push({ text: t("costNeeds", { words: n(wanted) }), tone: "cut" });
    parts.push({ text: t("costLeft", { words: n(remaining) }) });
  } else {
    if (over) {
      parts.push({
        text: t("costProcessed", { words: n(Math.min(words, cap)) }),
        tone: "cut",
      });
    }
    if (remaining !== null) {
      parts.push({
        text: over
          ? t("costLeft", { words: n(remaining) })
          : t("costLeftWindow", { words: n(remaining), window }),
      });
    }
  }

  return (
    <p
      data-testid="run-cost"
      className="text-muted-foreground flex flex-wrap items-baseline gap-x-1.5 text-sm tabular-nums"
    >
      <span className={cn(over && "text-danger-ink font-medium")}>
        {t("costWords", { words: n(words) })}
      </span>
      {parts.map((part) => (
        <span key={part.text} className="flex items-baseline gap-x-1.5">
          <span aria-hidden className="opacity-55">
            ·
          </span>
          <span
            className={cn(
              part.tone === "cut" && "text-warning-ink font-medium",
            )}
          >
            {part.text}
          </span>
        </span>
      ))}
    </p>
  );
}
