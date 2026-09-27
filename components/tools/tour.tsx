"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

// Three hints for a first visit to the editor, one at a time.
//
// Not a modal and not an overlay. CLAUDE.md forbids a new modal, and it is
// right to: a carousel of three panels over the editor covers exactly what
// it is explaining, and on a phone it covers all of it. These are strips in
// the flow, anchored to the thing they name, and they push the layout by
// their own height rather than floating over anything.
//
// The step is derived from the editor's own state rather than kept as a
// counter: there is no "next" to get out of step with, and a reader who
// pastes a text before the first hint is read simply sees the second.
//
// Nothing here can touch the text. The component takes no setter and the
// editor passes none -- the rule that a hint must never eat what somebody
// wrote is enforced by there being nothing to eat it with.

export type TourStep = 1 | 2 | 3;

export const TOUR_KEY = "vbx:tour";

/** Bumped when the steps change, so a stored "seen" is not a stale answer. */
export const TOUR_VERSION = 1;

/**
 * Which hint belongs on screen, or null for none.
 *
 * Pure, and exported so the order can be asserted without a browser: the
 * failure worth catching is two hints at once, which reads as a broken page
 * rather than as help.
 */
export function tourStep(state: {
  dismissed: boolean;
  /** Whether this tool has registers to choose from. */
  hasModes: boolean;
  hasText: boolean;
  hasResult: boolean;
}): TourStep | null {
  if (state.dismissed) return null;
  if (state.hasResult) return 3;
  if (state.hasText) return state.hasModes ? 2 : null;
  return 1;
}

function readDismissed(): boolean {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(TOUR_KEY) ?? "null",
    );
    return (
      !!stored &&
      typeof stored === "object" &&
      (stored as { v?: number }).v === TOUR_VERSION
    );
  } catch {
    // Private mode, or storage denied. Better to say nothing than to show
    // the same three hints on every visit.
    return true;
  }
}

/**
 * Whether the hints are still wanted, and how to stop them.
 *
 * Starts dismissed and only opens once the effect has read storage. That
 * order is deliberate: the server renders no hint, so the HTML that Google
 * indexes is the page without them, and nothing flashes into place on a
 * second visit.
 */
export function useTour(): { dismissed: boolean; dismiss: () => void } {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(readDismissed());
  }, []);

  return {
    dismissed,
    dismiss: () => {
      setDismissed(true);
      try {
        localStorage.setItem(
          TOUR_KEY,
          JSON.stringify({ v: TOUR_VERSION, at: Date.now() }),
        );
      } catch {
        // It stops for this visit either way; it just will not be
        // remembered. Failing here would take the editor down over a hint.
      }
    },
  };
}

/**
 * One hint.
 *
 * Closing any of them ends the whole thing, which is what somebody pressing
 * the X is asking for. Three separate dismissals would be three chances to
 * be asked again.
 */
export function Hint({
  step,
  onDismiss,
}: {
  step: TourStep;
  onDismiss: () => void;
}) {
  const t = useTranslations("tour");

  return (
    <div
      data-testid={`tour-${step}`}
      className="border-brand/20 bg-brand/5 text-foreground/80 flex items-start gap-3 border-b px-5 py-2.5 text-xs"
    >
      <p className="flex-1 leading-relaxed">{t(`step${step}`)}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t("dismiss")}
        className="text-muted-foreground hover:text-foreground -mr-1 shrink-0 rounded p-0.5"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
