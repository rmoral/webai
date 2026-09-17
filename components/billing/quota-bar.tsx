"use client";

import { useFormatter, useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

// Words consumed against the plan allowance. `limit` is null on unmetered
// plans, where a bar would be meaningless: the count is shown as plain text.
// Limits always arrive from lib/billing/plans.ts — never hardcoded here.
//
// `unit` is a caller-supplied string rather than a key: the caller is what
// knows whether the allowance is daily or monthly, and it already has a
// translator.
export function QuotaBar({
  used,
  limit,
  plan,
  unit,
  showPlan = true,
  className,
}: {
  used: number;
  limit: number | null;
  plan?: string;
  unit: string;
  showPlan?: boolean;
  className?: string;
}) {
  const t = useTranslations("app");
  const format = useFormatter();

  const label = `${format.number(used)}${
    limit === null ? "" : ` / ${format.number(limit)}`
  } ${unit}`;

  if (limit === null) {
    return (
      <p className={cn("text-sm font-medium", className)}>
        {label}
        {showPlan && plan && (
          <span className="text-muted-foreground ml-2 text-xs">
            {t("planBadge", { plan })}
          </span>
        )}
      </p>
    );
  }

  const pct = Math.min(100, Math.round((used / limit) * 100));

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline gap-2 text-sm">
        <b className="font-medium whitespace-nowrap">{label}</b>
        {showPlan && plan && (
          <span className="text-muted-foreground text-xs whitespace-nowrap">
            {t("planBadge", { plan })}
          </span>
        )}
      </div>
      <div
        className="bg-border h-1.5 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={used}
        aria-label={label}
      >
        <span
          className={cn(
            "block h-full rounded-full transition-[width] duration-200",
            pct >= 100
              ? "bg-danger"
              : pct >= 80
                ? "bg-warning-fill"
                : "bg-brand",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
