"use client";

import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import type { ModeId } from "@/lib/ai/tools";
import { cn } from "@/lib/utils";

// The paraphraser's six registers, all visible and each one explained
// (F2-07). Three chips used to fit at the fold and the other three, with
// what any of them did, were a section 862 px down the page.
//
// On a desktop, a 3 × 2 radio group with the active register described
// beside it. On a phone, a native select dressed as the design's dropdown:
// the platform's own picker lists the six with their descriptions, and a
// native control needs no dependency and no focus management of ours.
export function RegisterPicker({
  modes,
  value,
  onChange,
}: {
  modes: readonly ModeId[];
  value: ModeId;
  onChange: (mode: ModeId) => void;
}) {
  const name = useTranslations("modes");
  const describe = useTranslations("landing.paraphrase");
  const group = useRef<HTMLDivElement>(null);
  const description = (mode: ModeId) =>
    describe(`modes.${mode}.description` as "modes.estandar.description");

  // Arrow keys move the choice, as a radio group's do.
  function onKeyDown(event: React.KeyboardEvent) {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (!step) return;
    event.preventDefault();
    const next =
      modes[(modes.indexOf(value) + step + modes.length) % modes.length];
    onChange(next);
    group.current
      ?.querySelector<HTMLButtonElement>(`[data-mode="${next}"]`)
      ?.focus();
  }

  return (
    <>
      <div className="hidden items-center gap-5 md:flex">
        <div
          ref={group}
          role="radiogroup"
          aria-label={describe("modeLabel")}
          onKeyDown={onKeyDown}
          className="grid shrink-0 grid-cols-[repeat(3,112px)] gap-1.5"
        >
          {modes.map((mode) => {
            const on = mode === value;
            return (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={on}
                data-mode={mode}
                tabIndex={on ? 0 : -1}
                onClick={() => onChange(mode)}
                className={cn(
                  "focus-visible:ring-brand/30 h-8 rounded-lg text-sm transition-colors outline-none focus-visible:ring-[3px]",
                  on
                    ? "bg-brand font-semibold text-white"
                    : "bg-background font-medium text-neutral-700 ring-1 ring-neutral-200 ring-inset hover:bg-neutral-50",
                )}
              >
                {name(mode)}
              </button>
            );
          })}
        </div>
        <p
          aria-live="polite"
          data-testid="register-description"
          className="max-w-[520px] text-[13px] leading-[18px] text-neutral-600"
        >
          <b className="font-semibold text-neutral-950">{name(value)}.</b>{" "}
          {description(value)}
        </p>
      </div>

      <div className="focus-within:ring-brand relative flex h-14 flex-col justify-center rounded-[10px] pr-10 pl-3 ring-1 ring-neutral-300 ring-inset focus-within:ring-2 md:hidden">
        <span className="text-[15px] leading-5 font-semibold">
          {name(value)}
        </span>
        <span className="truncate text-xs leading-4 text-neutral-500">
          {description(value)}
        </span>
        <ChevronDown
          aria-hidden
          className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-neutral-600"
        />
        <select
          aria-label={describe("modeLabel")}
          value={value}
          onChange={(event) => onChange(event.target.value as ModeId)}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          {modes.map((mode) => (
            <option key={mode} value={mode}>
              {`${name(mode)} — ${description(mode)}`}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
