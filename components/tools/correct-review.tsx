"use client";

import type { Change } from "diff";
import { useTranslations } from "next-intl";

import type { ModeId } from "@/lib/ai/tools";
import { cn } from "@/lib/utils";

// F2-08 and F2-09: the corrector's two modes in sight, and its result as a
// review of the reader's own text -- each change marked where it happened,
// listed beside it, and taken or left one at a time.
//
// The changes come from a word diff in the browser, as the other tools'
// marks do: no model output to parse, no cost per request. Hence no type
// per change ("ortografía", "concordancia"): a diff knows what changed,
// not why (decision of 14-10).

export type Decision = "accepted" | "ignored";

export type Segment =
  | { kind: "same"; text: string }
  | { kind: "change"; id: number; before: string; after: string };

/**
 * The diff as the reader reviews it: a removal and the insertion right
 * after it are one change ("atencion → atención"), and a lone insertion or
 * removal is a change with nothing on one side ("∅ → ,").
 */
export function toSegments(parts: Change[]): Segment[] {
  const out: Segment[] = [];
  let id = 0;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part.added && !part.removed) {
      out.push({ kind: "same", text: part.value });
      continue;
    }
    const before = part.removed ? part.value : "";
    const next = parts[i + 1];
    const after = part.added
      ? part.value
      : next?.added
        ? (i++, next.value)
        : "";
    out.push({ kind: "change", id: id++, before, after });
  }
  return out;
}

/**
 * The corrected text, as copied: accepted and pending changes applied,
 * ignored ones left as the reader wrote them. `tail` is what the run did
 * not reach, which stays as it was.
 */
export function applyDecisions(
  segments: Segment[],
  decisions: Record<number, Decision>,
  tail = "",
): string {
  return (
    segments
      .map((s) =>
        s.kind === "same"
          ? s.text
          : decisions[s.id] === "ignored"
            ? s.before
            : s.after,
      )
      .join("") + tail
  );
}

/** The two modes: radio cards on a desktop, a segmented control on a phone. */
export function CorrectModePicker({
  modes,
  value,
  onChange,
}: {
  modes: readonly ModeId[];
  value: ModeId;
  onChange: (mode: ModeId) => void;
}) {
  const name = useTranslations("modes");
  const copy = useTranslations("landing.correct");
  const line = (mode: ModeId) =>
    copy(`modes.${mode}.description` as "modes.general.description");

  function onKeyDown(event: React.KeyboardEvent) {
    if (
      !["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(event.key)
    )
      return;
    event.preventDefault();
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    const next =
      modes[
        (modes.indexOf(value) + (forward ? 1 : -1) + modes.length) %
          modes.length
      ];
    onChange(next);
    (event.currentTarget as HTMLElement)
      .querySelector<HTMLButtonElement>(`[data-mode="${next}"]`)
      ?.focus();
  }

  const radio = (
    mode: ModeId,
    className: string,
    children: React.ReactNode,
  ) => (
    <button
      key={mode}
      type="button"
      role="radio"
      aria-checked={mode === value}
      data-mode={mode}
      tabIndex={mode === value ? 0 : -1}
      onClick={() => onChange(mode)}
      className={cn(
        "focus-visible:ring-brand/30 outline-none focus-visible:ring-[3px]",
        className,
      )}
    >
      {children}
    </button>
  );

  return (
    <>
      <div
        role="radiogroup"
        aria-label={copy("modeLabel")}
        onKeyDown={onKeyDown}
        className="hidden grid-cols-2 gap-2 md:grid"
      >
        {modes.map((mode) =>
          radio(
            mode,
            cn(
              "flex flex-col gap-0.5 rounded-[10px] px-3 py-[9px] text-left",
              mode === value
                ? "bg-brand-softer ring-brand ring-2 ring-inset"
                : "ring-1 ring-neutral-200 ring-inset hover:bg-neutral-50",
            ),
            <>
              <span
                className={cn(
                  "text-sm leading-[19px] font-semibold",
                  mode === value && "text-brand-ink",
                )}
              >
                {name(mode)}
              </span>
              <span className="text-[13px] leading-[18px] text-neutral-600">
                {line(mode)}
              </span>
            </>,
          ),
        )}
      </div>

      <div className="md:hidden">
        <div
          role="radiogroup"
          aria-label={copy("modeLabel")}
          onKeyDown={onKeyDown}
          className="grid grid-cols-2 gap-1.5"
        >
          {modes.map((mode) =>
            radio(
              mode,
              cn(
                "h-10 rounded-lg text-sm",
                mode === value
                  ? "bg-brand font-semibold text-white"
                  : "font-medium text-neutral-700 ring-1 ring-neutral-200 ring-inset",
              ),
              name(mode),
            ),
          )}
        </div>
        <p className="mt-2 text-xs leading-4 text-neutral-600">{line(value)}</p>
      </div>
    </>
  );
}

const DEL = "text-danger-ink line-through decoration-[#c43d2f]";
const INS = "bg-success-soft text-success-ink rounded-[2px] px-px";

/** The reader's text with the changes on it, as decided so far. */
export function ReviewText({
  segments,
  decisions,
  tail,
}: {
  segments: Segment[];
  decisions: Record<number, Decision>;
  tail: string;
}) {
  return (
    <>
      {segments.map((s, i) => {
        if (s.kind === "same") return <span key={i}>{s.text}</span>;
        const decision = decisions[s.id];
        if (decision === "accepted") return <span key={i}>{s.after}</span>;
        if (decision === "ignored") return <span key={i}>{s.before}</span>;
        return (
          <span key={i}>
            {s.before && <del className={DEL}>{s.before}</del>}
            {s.after && (
              <ins className={cn(INS, "no-underline")}>{s.after}</ins>
            )}
          </span>
        );
      })}
      {/* What the run did not reach: the reader's, untouched. */}
      {tail && <span className="text-neutral-400">{tail}</span>}
    </>
  );
}

/** Every change, to take or leave; the count is what is still pending. */
export function ChangeList({
  segments,
  decisions,
  onDecide,
  className,
}: {
  segments: Segment[];
  decisions: Record<number, Decision>;
  onDecide: (next: Record<number, Decision>) => void;
  className?: string;
}) {
  const t = useTranslations("correct");
  const changes = segments.filter(
    (s): s is Extract<Segment, { kind: "change" }> => s.kind === "change",
  );
  const pending = changes.filter((c) => !decisions[c.id]);

  const acceptAll = (
    <button
      type="button"
      disabled={pending.length === 0}
      onClick={(event) => {
        // Inside a <summary> on a phone: take the click, not the toggle.
        event.preventDefault();
        onDecide({
          ...decisions,
          ...Object.fromEntries(pending.map((c) => [c.id, "accepted"])),
        });
      }}
      className="border-brand text-brand hover:bg-brand-softer ml-auto h-8 rounded-md border-[1.5px] px-3 text-[13px] font-semibold disabled:opacity-45 md:h-9"
    >
      {t("acceptAll")}
    </button>
  );

  const rows = changes.map((c) => {
    const decision = decisions[c.id];
    return (
      <li
        key={c.id}
        data-testid="change"
        className={cn(
          "flex flex-wrap items-center gap-2.5 border-b border-neutral-100 px-3 py-2.5 md:flex-nowrap md:px-4",
          decision && "opacity-55",
        )}
      >
        <p className="min-w-0 flex-1 text-sm leading-5">
          {c.before.trim() ? (
            <s className="text-danger-ink decoration-[#c43d2f]">{c.before}</s>
          ) : (
            <span className="text-neutral-400">∅</span>
          )}
          <span aria-hidden className="mx-1 text-neutral-400">
            →
          </span>
          {c.after.trim() ? (
            <b className="text-success-ink font-semibold">{c.after}</b>
          ) : (
            <span className="text-neutral-400">∅</span>
          )}
          {decision && (
            <span
              className={cn(
                "ml-2 text-xs font-semibold",
                decision === "accepted"
                  ? "text-success-ink"
                  : "text-neutral-600",
              )}
            >
              {t(decision)}
            </span>
          )}
        </p>
        {!decision && (
          <>
            <button
              type="button"
              onClick={() => onDecide({ ...decisions, [c.id]: "accepted" })}
              className="bg-brand-soft text-brand-ink border-brand-line h-9 rounded-[7px] border px-2.5 text-[13px] font-semibold md:h-8"
            >
              {t("accept")}
            </button>
            <button
              type="button"
              onClick={() => onDecide({ ...decisions, [c.id]: "ignored" })}
              className="h-9 px-1 text-[13px] font-semibold text-neutral-600 md:h-8"
            >
              {t("ignore")}
            </button>
          </>
        )}
      </li>
    );
  });

  const count = t("changes", { n: pending.length });

  // One list for both widths: an accordion on a phone, open to begin with;
  // on a desktop its summary is hidden and a header takes its place, so it
  // cannot be closed there.
  return (
    <div className={className}>
      <div className="hidden items-center gap-2.5 border-b px-4 py-3 md:flex">
        <b className="text-[15px] font-semibold">{count}</b>
        {acceptAll}
      </div>
      <details open className="max-md:border-t">
        <summary className="flex h-12 cursor-pointer list-none items-center gap-2 px-3 text-[15px] font-semibold md:hidden [&::-webkit-details-marker]:hidden">
          {count}
          {acceptAll}
        </summary>
        <ul>{rows}</ul>
      </details>
    </div>
  );
}
