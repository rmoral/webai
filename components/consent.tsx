"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import {
  DENIED,
  GRANTED,
  consentSignals,
  readConsent,
  writeConsent,
  type Consent,
} from "@/lib/analytics/consent";
import { Link } from "@/lib/i18n/navigation";
import { LEGAL_SLUGS } from "@/lib/i18n/legal";
import type { Locale } from "@/lib/i18n/routing";

// The banner, and the answer it collects.
//
// Rejecting is one click, the same size and in the same row as accepting.
// That is not a style decision: a banner where refusing costs more than
// consenting is the one the AEPD fines, and it is also the one that
// produces consent nobody meant to give.

interface Store {
  /** What was chosen, or null while nothing has been. */
  consent: Consent | null;
  /** Reopens the banner, for the promise the cookie policy makes. */
  reopen: () => void;
}

const ConsentContext = createContext<Store>({
  consent: null,
  reopen: () => {},
});

export function useConsent(): Store {
  return useContext(ConsentContext);
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  // null means unanswered, and unanswered is what opens the banner. Read
  // after mount: the server has no storage, and a banner in the server's
  // HTML and not the browser's is a hydration error on every page.
  const [consent, setConsent] = useState<Consent | null>(null);
  const [asked, setAsked] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    setConsent(stored);
    setAsked(stored !== null);
  }, []);

  const save = useCallback((choice: Consent) => {
    writeConsent(choice);
    setConsent(choice);
    setAsked(true);
    setOpen(false);
    // Google is told immediately. The tag is already loaded with
    // everything denied, so this is the moment it starts being allowed to
    // store anything.
    window.gtag?.("consent", "update", consentSignals(choice));
  }, []);

  const reopen = useCallback(() => setOpen(true), []);
  const value = useMemo(() => ({ consent, reopen }), [consent, reopen]);

  return (
    <ConsentContext.Provider value={value}>
      {children}
      {(!asked || open) && (
        <Banner
          current={consent}
          onSave={save}
          onClose={asked ? () => setOpen(false) : undefined}
        />
      )}
    </ConsentContext.Provider>
  );
}

function Banner({
  current,
  onSave,
  onClose,
}: {
  current: Consent | null;
  onSave: (choice: Consent) => void;
  /** Only once an answer exists: the first time there is no way past it. */
  onClose?: () => void;
}) {
  const t = useTranslations("consent");
  const locale = useLocale() as Locale;
  const [draft, setDraft] = useState<Consent>(current ?? DENIED);
  // The first time, two answers and nothing else: the banner sits over the
  // fold of an ad landing, so it is two lines and two equal buttons (F1).
  // Reopened from the footer's "Cookies" -- where the policy sends anyone
  // who wants to change their mind -- it keeps both answers, so withdrawing
  // is still one click, and adds the choice purpose by purpose.
  const reopened = onClose !== undefined;
  const outline =
    "h-10 border-neutral-300 text-sm font-semibold md:h-10 sm:w-[120px]";

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      data-testid="consent-banner"
      className="bg-popover fixed inset-x-0 bottom-0 z-50 border-t px-4 pt-3 pb-[calc(14px+env(safe-area-inset-bottom))] shadow-[0_-6px_20px_rgb(0_0_0/0.08)] sm:py-3.5"
    >
      <div className="mx-auto flex max-w-[62rem] flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="text-muted-foreground max-w-[40rem] text-[13px] leading-[18px]">
          {t("body")}{" "}
          <Link
            href={{
              pathname: "/legal/[slug]",
              params: { slug: LEGAL_SLUGS[locale].cookies },
            }}
            className="text-brand underline underline-offset-[3px]"
          >
            {t("policy")}
          </Link>
        </p>

        {/* Same size, same row, one click, same weight. A banner where
            refusing costs more than consenting -- or merely looks like the
            lesser option -- is the one the AEPD fines. */}
        <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
          <Button
            variant="outline"
            className={outline}
            onClick={() => onSave(DENIED)}
          >
            {t("reject")}
          </Button>
          <Button
            variant="outline"
            className={outline}
            onClick={() => onSave(GRANTED)}
          >
            {t("accept")}
          </Button>
        </div>
      </div>

      {reopened && (
        <div className="mx-auto mt-2.5 flex max-w-[62rem] flex-wrap items-center gap-2">
          {/* Two purposes, because the policy names two. Whoever wants the
              product measured but not the ads can say exactly that. */}
          <Chip
            pressed={draft.analytics}
            onClick={() => setDraft({ ...draft, analytics: !draft.analytics })}
          >
            {t("analytics")}
          </Chip>
          <Chip
            pressed={draft.ads}
            onClick={() => setDraft({ ...draft, ads: !draft.ads })}
          >
            {t("ads")}
          </Chip>
          <Button size="sm" onClick={() => onSave(draft)}>
            {t("save")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="ml-auto"
          >
            {t("close")}
          </Button>
        </div>
      )}
    </div>
  );
}

/** The way back to the choice, which the cookie policy promises. */
export function ConsentSettings({ className }: { className?: string }) {
  const t = useTranslations("consent");
  const { reopen } = useConsent();
  return (
    <button type="button" onClick={reopen} className={className}>
      {t("settings")}
    </button>
  );
}
