import { useFormatter, useTranslations } from "next-intl";

import {
  DETECTOR_PROOF,
  type DetectorProofData,
  type DetectorResult,
} from "@/lib/proof/detectors";
import { cn } from "@/lib/utils";

// F1-07: "tested with the detectors", as four rings under the editor and on
// /precios, or as one line of text in the paywall.
//
// Neither a server nor a client component on purpose: the landing renders
// it on the server and the paywall inside a client dialog, from the same
// data. Without results it renders nothing at all -- no frame, no empty
// rings -- so it can ship before the figures do.

export function DetectorProof({
  variant,
  data = DETECTOR_PROOF,
  className,
}: {
  variant: "block" | "row";
  /** Overridable for tests; production reads lib/proof/detectors.ts. */
  data?: DetectorProofData;
  className?: string;
}) {
  const t = useTranslations("proof");
  const format = useFormatter();

  if (data.results.length === 0) return null;

  const pct = (n: number) => format.number(n / 100, { style: "percent" });
  const label = (r: DetectorResult) =>
    `${r.name}: ${pct(r.humanPct)} ${t("human")}`;

  if (variant === "row") {
    return (
      <p
        className={cn(
          "mt-3.5 rounded-[10px] border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[13px] leading-[19px] text-neutral-600",
          className,
        )}
      >
        <span className="text-foreground font-semibold">{t("rowLead")}</span>{" "}
        {data.results.map((r, i) => (
          <span key={r.name}>
            {i > 0 && " · "}
            <span className="text-foreground font-medium">{r.name}</span>{" "}
            {pct(r.humanPct)}
          </span>
        ))}
      </p>
    );
  }

  return (
    <section
      className={cn(
        "mt-6 grid rounded-[14px] border px-4 pt-5 pb-4 md:mt-7 md:grid-cols-[260px_1fr] md:gap-x-8 md:px-7 md:py-6",
        className,
      )}
    >
      <h2 className="text-base font-semibold md:text-lg">{t("title")}</h2>
      <ul className="mt-4 grid grid-cols-4 gap-2 md:col-start-2 md:row-span-2 md:row-start-1 md:mt-0 md:flex md:gap-4">
        {data.results.map((r) => (
          <li key={r.name} className="flex flex-col items-center text-center">
            <Ring pct={r.humanPct} label={label(r)} text={pct(r.humanPct)} />
            <span className="mt-2 text-xs font-medium text-neutral-800 md:text-sm md:font-semibold">
              {r.name}
            </span>
            <span className="text-muted-foreground text-[11px] md:text-xs">
              {t("human")}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground mt-4 border-t border-neutral-100 pt-3 text-xs leading-4 md:mt-1.5 md:border-0 md:pt-0 md:text-[13px] md:leading-[18px]">
        {t.rich("foot", {
          date: format.dateTime(new Date(data.testedAt), {
            dateStyle: "long",
          }),
          link: (chunks) => (
            <a
              href={data.methodologyUrl}
              className="text-brand font-medium hover:underline"
            >
              {chunks}
            </a>
          ),
        })}
      </p>
    </section>
  );
}

/** 64 on a phone, 72 above: one viewBox, sized by CSS. */
function Ring({
  pct,
  label,
  text,
}: {
  pct: number;
  label: string;
  text: string;
}) {
  const r = 33;
  const c = 2 * Math.PI * r;
  return (
    <span
      role="img"
      aria-label={label}
      className="relative flex size-16 items-center justify-center md:size-[72px]"
    >
      {/* Starts at twelve o'clock: rotated a quarter turn back. */}
      <svg
        viewBox="0 0 72 72"
        className="absolute inset-0 -rotate-90"
        aria-hidden
      >
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          strokeWidth="6"
          className="stroke-border"
        />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          className="stroke-brand"
        />
      </svg>
      <span aria-hidden className="text-sm font-semibold md:text-base">
        {text}
      </span>
    </span>
  );
}
