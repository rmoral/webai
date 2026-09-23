"use client";

import { useEffect, useId, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";

import { useAllowance } from "@/components/billing/allowance";
import { Button } from "@/components/ui/button";
import { PLANS, PRICES, formatUsd } from "@/lib/billing/plans";
import { Link } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import { minutesUntilQuotaReset } from "@/lib/usage/day";
import { cn } from "@/lib/utils";

// D1 — the balance block of the /app header.
//
// It replaces the `Badge` + `QuotaBar` pair, which said what plan you were
// on and how many words you had used, and nothing about what either meant:
// no way to know when the count refills, what the next plan would give, or
// when a trial turns into a charge.
//
// Five states, and the rule that keeps it out of the way: small controls
// only, never a filled brand button. The one filled button on the page is
// the tool's own.

/** Which of the five the header is showing. */
export type MeterKind = "free" | "pro" | "unlimited" | "trial";

/**
 * Which state an account is in.
 *
 * A trial is Unlimited that has not been charged yet, so it reads as
 * Unlimited everywhere else -- but not here, where the date of the first
 * charge is the whole reason the block exists. The trial is checked
 * first for that reason.
 */
export function meterKind(subscriber: {
  plan: { id: string };
  trialEnd: Date | null;
}): MeterKind {
  if (subscriber.trialEnd) return "trial";
  if (subscriber.plan.id === "unlimited") return "unlimited";
  return subscriber.plan.id === "pro" ? "pro" : "free";
}

export interface MeterProps {
  kind: MeterKind;
  /** Words spent in the current window. From `peekWords`. */
  used: number;
  /** The allowance, or null on an unmetered plan. */
  limit: number | null;
  /** `subscriber.periodEnd`, ISO. Pro only. */
  periodEnd?: string | null;
  /** `subscriber.trialEnd`, ISO. Trial only. */
  trialEnd?: string | null;
  /** `subscriber.topupWords`; shown in the Pro tooltip when > 0. */
  topup?: number;
}

export function UsageMeter({
  kind,
  used: initialUsed,
  limit: initialLimit,
  periodEnd,
  trialEnd,
  topup = 0,
}: MeterProps) {
  const t = useTranslations("app");
  const plans = useTranslations("plans");
  const format = useFormatter();
  const locale = useLocale() as Locale;
  const tooltipId = useId();
  const [open, setOpen] = useState(false);

  // The live figure, so the header moves with the editor rather than with
  // the next navigation. The server's reading is the fallback.
  const { allowance } = useAllowance();
  const used = allowance?.used ?? initialUsed;
  const limit = allowance?.limit ?? initialLimit;

  // How long until the daily allowance refills.
  //
  // Read after mount and again whenever the tooltip opens, never on a
  // timer: CLAUDE.md rules out polling, and a figure computed during the
  // server render would disagree with the client's a minute later --
  // which React reports as a hydration error on every page of the app.
  const [resetsIn, setResetsIn] = useState<string | null>(null);
  useEffect(() => {
    if (kind !== "free") return;
    const minutes = minutesUntilQuotaReset();
    setResetsIn(
      minutes >= 60
        ? t("time.hours", { n: Math.ceil(minutes / 60) })
        : t("time.minutes", { n: minutes }),
    );
  }, [kind, open, t]);

  const n = (value: number) => format.number(value);
  const longDate = (iso: string) =>
    format.dateTime(new Date(iso), { day: "numeric", month: "long" });

  const metered = kind === "free" || kind === "pro";
  const spent = metered && limit !== null && used >= limit;
  const percent =
    metered && limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  const label = metered && limit !== null && (
    <>
      {/* Two labels, one shown at a time: a phone has no room for the
          long one, and the short one says too little on a desktop. */}
      <span className="hidden items-baseline gap-1.5 sm:flex">
        <span className="text-muted-foreground">
          {kind === "free" ? t("meterToday") : t("meterMonth")}
        </span>
        <b className="font-medium tabular-nums">
          {t("meterWords", { used: n(used), limit: n(limit) })}
        </b>
        {/* Once it is spent, when it refills is the only thing that
            matters, so it leaves the tooltip and joins the label. */}
        {spent && kind === "free" && resetsIn && (
          <span className="text-danger-ink">
            · {t("meterResets", { time: resetsIn })}
          </span>
        )}
      </span>
      <b className="font-medium tabular-nums sm:hidden">
        {kind === "free"
          ? t("meterShortDay", { used: n(used), limit: n(limit) })
          : t("meterShortMonth", { used: n(used), limit: n(limit) })}
      </b>
    </>
  );

  const flat = !metered && (
    <span className="text-sm font-medium whitespace-nowrap">
      {kind === "trial" && trialEnd ? (
        <>
          <span className="hidden sm:inline">
            {t("meterTrial", { date: longDate(trialEnd) })}
          </span>
          <span className="sm:hidden">{t("meterTrialShort")}</span>
        </>
      ) : (
        t("meterUnlimited")
      )}
    </span>
  );

  return (
    <div
      className="relative flex min-w-0 items-center gap-2 sm:gap-3"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setOpen((was) => !was)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="focus-visible:ring-brand/30 -mx-1.5 -my-1 flex min-w-0 cursor-default flex-col gap-1.5 rounded-sm px-1.5 py-1 text-left text-sm focus-visible:ring-[3px] focus-visible:outline-none"
      >
        {metered && limit !== null ? (
          <>
            <span className="flex items-baseline gap-1.5 whitespace-nowrap">
              {label}
            </span>
            <span
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={limit}
              aria-valuenow={Math.min(used, limit)}
              aria-label={t("meterWords", { used: n(used), limit: n(limit) })}
              className="bg-border h-1 w-14 overflow-hidden rounded-full sm:w-36"
            >
              <span
                className={cn(
                  "block h-full rounded-full transition-[width] duration-200",
                  percent >= 100
                    ? "bg-danger"
                    : percent >= 80
                      ? "bg-warning-fill"
                      : "bg-brand",
                )}
                style={{ width: `${percent}%` }}
              />
            </span>
          </>
        ) : (
          flat
        )}
      </button>

      {/* Free is the only state with a button, and it is the quietest one
          that still reads as an offer. Pro gets a link; the two paid
          states that cannot be upgraded get nothing. */}
      {kind === "free" && (
        <Button size="sm" variant={spent ? "soft" : "outline"} asChild>
          <Link href={{ pathname: "/pricing", query: { from: "header" } }}>
            {t("upgrade")}
          </Link>
        </Button>
      )}
      {kind === "pro" && (
        <Button
          size="sm"
          variant="link"
          className="hidden sm:inline-flex"
          asChild
        >
          <Link href="/app/account">{t("upgradeToUnlimited")}</Link>
        </Button>
      )}

      {open && (
        <div
          role="tooltip"
          id={tooltipId}
          // Anchored to the meter on a wide screen; pinned to the margins
          // on a phone, where 18rem of fixed width overflows the viewport.
          className="bg-popover text-popover-foreground absolute top-full left-0 z-30 mt-2.5 flex w-72 flex-col gap-2 rounded-md border p-3 text-sm leading-normal shadow-lg max-sm:fixed max-sm:inset-x-3 max-sm:w-auto"
        >
          {kind === "free" && limit !== null && (
            <>
              <p className="font-semibold">
                {t("tipFreeTitle", { limit: n(limit) })}
              </p>
              <p>
                {spent
                  ? t("tipFreeSpent", { limit: n(limit), time: resetsIn ?? "" })
                  : t("tipFreeLeft", {
                      left: n(Math.max(0, limit - used)),
                      time: resetsIn ?? "",
                    })}
              </p>
              <p className="text-muted-foreground">
                {t("tipFreePro", {
                  month: n(PLANS.pro.limits.wordsPerMonth ?? 0),
                  request: n(PLANS.pro.limits.maxWordsPerRequest),
                })}
              </p>
              <Link
                href={{ pathname: "/pricing", query: { from: "header" } }}
                className="text-brand underline underline-offset-[3px]"
              >
                {t("seePlans")}
              </Link>
            </>
          )}

          {kind === "pro" && limit !== null && (
            <>
              <p className="font-semibold">
                {t("tipProTitle", { limit: n(limit) })}
              </p>
              <p>
                {t("tipProLeft", {
                  left: n(Math.max(0, limit - used)),
                  date: periodEnd ? longDate(periodEnd) : "",
                })}
              </p>
              {topup > 0 && <p>{t("tipProTopup", { words: n(topup) })}</p>}
              <p className="text-muted-foreground">
                {t("tipProUnlimited", {
                  month: n(PLANS.unlimited.limits.wordsPerMonth ?? 0),
                  request: n(PLANS.unlimited.limits.maxWordsPerRequest),
                })}
              </p>
              <Link
                href="/app/account"
                className="text-brand underline underline-offset-[3px]"
              >
                {t("upgradeToUnlimited")}
              </Link>
            </>
          )}

          {kind === "trial" && (
            <>
              <p className="font-semibold">{t("tipTrialTitle")}</p>
              <p>
                {t("tipTrialCharge", {
                  date: trialEnd ? longDate(trialEnd) : "",
                  amount: formatUsd(PRICES.unlimited.monthly.amount, locale),
                })}
              </p>
              <p className="text-muted-foreground">{t("tipTrialCancel")}</p>
              <Link
                href="/app/account"
                className="text-brand underline underline-offset-[3px]"
              >
                {t("manageSubscription")}
              </Link>
            </>
          )}

          {kind === "unlimited" && (
            <>
              <p className="font-semibold">
                {t("planBadge", { plan: plans("unlimited") })}
              </p>
              <p>
                {t("tipUnlimited", {
                  request: n(PLANS.unlimited.limits.maxWordsPerRequest),
                })}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
