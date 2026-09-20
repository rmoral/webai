"use client";

import { useRef, type ChangeEvent } from "react";
import { useFormatter, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/billing/plans";
import { Link } from "@/lib/i18n/navigation";
import { truncateToWords } from "@/lib/security/validation";

// Wall A — the paste is longer than the plan accepts.
//
// It interrupts nothing. From the word after the ceiling the text dims
// inside the editor itself, and a notice under the panels says which words
// will be processed. The user can still press the button; the first N words
// are what the model receives, which is what the server does too.
//
// Amber, not red: a ceiling is not an error.

const TEXTAREA_CLASS =
  "w-full resize-y bg-transparent p-5 text-base outline-none md:text-sm";

/**
 * The editor's input box, with the overflow dimmed.
 *
 * A textarea cannot style part of its own value, so the overflow state
 * renders a mirror underneath it -- same font, same padding, same wrapping
 * -- and makes the real text transparent. The mirror is `aria-hidden`: the
 * textarea still holds the whole value and a screen reader still reads it,
 * because the words are not being withheld, only marked.
 *
 * Below the ceiling there is no mirror and no transparency, so the ordinary
 * case is an ordinary textarea.
 */
export function EditorInput({
  value,
  onChange,
  placeholder,
  label,
  ceiling,
  overflowed,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  ceiling: number;
  overflowed: boolean;
  className?: string;
}) {
  const mirror = useRef<HTMLDivElement>(null);

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange(event.target.value);
  }

  const kept = overflowed ? truncateToWords(value, ceiling) : value;

  return (
    <div className="relative">
      {overflowed && (
        <div
          ref={mirror}
          aria-hidden
          className={`${TEXTAREA_CLASS} pointer-events-none absolute inset-0 overflow-hidden break-words whitespace-pre-wrap`}
        >
          {kept}
          <span className="opacity-[0.38]">{value.slice(kept.length)}</span>
        </div>
      )}
      <textarea
        value={value}
        onChange={handleChange}
        onScroll={(event) => {
          if (mirror.current) {
            mirror.current.scrollTop = event.currentTarget.scrollTop;
          }
        }}
        placeholder={placeholder}
        aria-label={label}
        className={`${TEXTAREA_CLASS} relative ${className ?? ""} ${
          overflowed ? "caret-foreground text-transparent" : ""
        }`}
      />
    </div>
  );
}

/**
 * The notice. Names both figures -- what is processed and what was pasted
 * -- and both paid ceilings, so the reader can tell which plan answers the
 * text in front of them without opening the pricing page.
 */
export function OverflowNotice({
  ceiling,
  submitted,
}: {
  ceiling: number;
  submitted: number;
}) {
  const t = useTranslations("paywall");
  const format = useFormatter();

  return (
    <div className="border-warning-line bg-warning-soft flex flex-wrap items-center gap-4 border-t px-5 py-3">
      <span className="text-danger-ink font-mono text-sm whitespace-nowrap">
        {format.number(ceiling)} / {format.number(ceiling)}
      </span>
      <p className="text-warning-ink flex-1 basis-72 text-sm leading-normal">
        <b className="font-semibold">
          {t("overflowLead", { words: format.number(ceiling) })}
        </b>{" "}
        {t("overflowBody", {
          submitted: format.number(submitted),
          pro: format.number(PLANS.pro.limits.maxWordsPerRequest),
          unlimited: format.number(PLANS.unlimited.limits.maxWordsPerRequest),
        })}
      </p>
      <Button size="sm" variant="soft" asChild>
        <Link href="/pricing">{t("seePlans")}</Link>
      </Button>
    </div>
  );
}
