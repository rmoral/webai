"use client";

import { useFormatter, useTranslations } from "next-intl";

import { asRaw, splitSentences } from "@/lib/ai/detector/segment";
import type { Band, DetectorAnalysis } from "@/lib/ai/detector/types";
import { RELIABILITY } from "@/lib/ai/detector/weights";
import { FeatureLock } from "@/components/billing/paywall";
import { PLANS, type PlanId } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

// The finding is a band and a list of what was measured. There is no number
// on screen, on purpose: an index of 52 reads as "52% AI" however the caption
// is worded, and no technique available today produces a calibrated
// probability for Spanish. The wording here is load-bearing -- this tool gets
// pointed at students.

const SCALE: Exclude<Band, "gris">[] = ["verde", "amarillo", "rojo"];

/**
 * Only the colours live here. The band names and the sentence that goes with
 * each one are copy, and the copy in this panel is the product: it is what
 * stops a band being read as an accusation.
 */
const BAND_STYLE: Record<
  Exclude<Band, "gris">,
  { fill: string; text: string }
> = {
  verde: { fill: "var(--success)", text: "text-success-ink" },
  amarillo: { fill: "var(--warning-fill)", text: "text-warning-ink" },
  rojo: { fill: "var(--danger)", text: "text-danger-ink" },
};

/** What was actually found. A signal that did not fire is not evidence. */
function Evidence({ result }: { result: DetectorAnalysis }) {
  const t = useTranslations("detector");
  const signalText = useTranslations("detectorSignals");
  const found = result.signals.filter((s) => s.contribution > 0);
  if (found.length === 0) return null;

  // The engine emits a signal id and its measurements; the wording is a
  // message. That is what lets one engine serve two languages, and it means
  // the sentence a visitor reads is never assembled on the server.
  const explain = signalText as unknown as (
    key: string,
    values?: Record<string, string | number>,
  ) => string;

  return (
    <dl className="flex flex-col gap-4">
      <p className="text-sm font-medium">{t("evidenceTitle")}</p>
      {found.map((signal) => (
        <div key={signal.id} className="flex flex-col gap-1">
          <dt className="flex items-baseline gap-2 text-sm font-medium">
            <span
              aria-hidden
              className="mt-[0.4rem] size-1.5 shrink-0 rounded-full"
              style={{ background: "var(--muted-foreground)" }}
            />
            {explain(`${signal.id}.label`)}
          </dt>
          <dd className="text-muted-foreground pl-3.5 text-xs leading-relaxed">
            {explain(`${signal.id}.explanation`, signal.values)}
            {signal.samples?.length ? (
              <span className="mt-1 block">
                {t("forExample")}{" "}
                {signal.samples.map((s, i) => (
                  <span key={i}>
                    {i > 0 && ", "}
                    <code className="bg-muted rounded px-1 py-0.5 text-[0.7rem]">
                      {s}
                    </code>
                  </span>
                ))}
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function DetectorResultView({
  result,
  text,
  plan,
}: {
  result: DetectorAnalysis;
  /** The text that was analysed, for locating the windows. */
  text: string;
  /** Decides the passage breakdown, and names the wall when it is locked. */
  plan: PlanId;
}) {
  const canSeeSentences = PLANS[plan].limits.sentenceHighlight;
  const t = useTranslations("detector");
  const lock = useTranslations("paywall");
  const format = useFormatter();

  if (result.band === "gris") {
    return (
      <div className="flex flex-col gap-4 p-5" data-testid="detector-result">
        <div>
          <p className="font-medium">{t("tooShortTitle")}</p>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {t("tooShortBody", {
              words: t("wordsCount", { count: result.words }),
              sentences: t("sentencesCount", { count: result.sentenceCount }),
              minWords: RELIABILITY.minWords,
              minSentences: RELIABILITY.minSentences,
            })}
          </p>
        </div>
        {/* Forensic findings do not depend on length: an invisible character
            is an invisible character in twenty words. They are reported even
            here, without a band, because they are facts about the text. */}
        <Evidence result={result} />
      </div>
    );
  }

  const band = BAND_STYLE[result.band];
  const step = (b: Exclude<Band, "gris">) => t(`bands.${b}.step`);

  return (
    <div className="flex flex-col gap-5 p-5" data-testid="detector-result">
      <div className="flex flex-col gap-3">
        <p className={cn("font-semibold", band.text)}>
          {t(`bands.${result.band}.headline`)}
        </p>
        <div
          className="flex gap-1"
          role="img"
          aria-label={t("scaleLabel", { step: step(result.band) })}
        >
          {SCALE.map((item) => (
            <span
              key={item}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                item === result.band ? "" : "bg-border",
              )}
              style={
                item === result.band ? { background: band.fill } : undefined
              }
            />
          ))}
        </div>
        <div className="text-muted-foreground flex justify-between text-xs">
          {SCALE.map((item) => (
            <span key={item} className={item === result.band ? band.text : ""}>
              {step(item)}
            </span>
          ))}
        </div>
        <p className="text-muted-foreground text-sm">
          {t("over", { words: format.number(result.words) })}
        </p>
      </div>

      {result.band === "verde" && (
        <p className="border-brand-line bg-brand-soft text-brand-ink rounded-lg border px-4 py-3 text-xs leading-relaxed">
          <b className="font-semibold">{t("greenNoticeTitle")}</b>{" "}
          {t("greenNoticeBody")}
        </p>
      )}

      <Evidence result={result} />

      {canSeeSentences ? (
        <WindowMap result={result} text={text} />
      ) : (
        <FeatureLock
          feature="breakdown"
          plan={plan}
          label={lock("breakdownLock")}
        />
      )}

      {/* Non-negotiable per the design system: the result always reads as
          orientation, never as proof. */}
      <p className="text-muted-foreground border-t pt-4 text-xs leading-relaxed">
        {t("disclaimer")}
      </p>
    </div>
  );
}

/**
 * Where the indications concentrate. The engine scores overlapping windows of
 * a few sentences, so a generated paragraph inside a written text shows up
 * here even when the document as a whole does not reach a band -- which is
 * the normal mixed case.
 */
function WindowMap({
  result,
  text,
}: {
  result: DetectorAnalysis;
  text: string;
}) {
  const t = useTranslations("detector");
  const marked = result.windows.filter((w) => w.band !== "verde");
  if (marked.length === 0) return null;

  // Overlapping windows describing one stretch are one finding, not four.
  const runs: { from: number; to: number; band: Exclude<Band, "gris"> }[] = [];
  for (const w of marked) {
    const last = runs[runs.length - 1];
    const [from, to] = w.sentenceRange;
    if (last && from <= last.to + 1) {
      last.to = Math.max(last.to, to);
      if (w.band === "rojo") last.band = "rojo";
    } else {
      runs.push({ from, to, band: w.band as Exclude<Band, "gris"> });
    }
  }

  // Cut with the engine's own splitter, in the language it measured: the
  // ranges are indices into that array, and a different split would quote
  // the wrong sentences without failing anywhere.
  const sentences = splitSentences(asRaw(text), result.locale);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{t("windowsTitle")}</p>
      <div className="flex flex-col gap-3">
        {runs.map((run, i) => (
          <blockquote
            key={i}
            className="border-l-2 pl-3 text-xs leading-relaxed"
            style={{ borderColor: BAND_STYLE[run.band].fill }}
          >
            <span className="text-muted-foreground block">
              {t("sentenceRange", { from: run.from + 1, to: run.to + 1 })}
            </span>
            {sentences.slice(run.from, run.to + 1).join(" ")}
          </blockquote>
        ))}
      </div>
    </div>
  );
}
