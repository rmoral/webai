"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { TOOLS, type ToolId } from "@/lib/ai/tools";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

// One tab strip for both areas. Inside /app it switches the editor's tool
// through a query param; on marketing it points at each tool's landing, which
// is the page that has to rank. Tools that are not live yet render as plain
// text — `live` comes from lib/ai/tools.ts, never from a check here.
//
// Wrapped in Suspense because useSearchParams would otherwise opt every
// marketing page out of static rendering.
export function ToolTabs({ className }: { className?: string }) {
  return (
    <Suspense fallback={<div className="h-[3.75rem]" />}>
      <Tabs className={className} />
    </Suspense>
  );
}

function Tabs({ className }: { className?: string }) {
  // next-intl's usePathname: the internal pathname, so matching a tool works
  // the same in both languages without a table of translated URLs here.
  const pathname = usePathname();
  const active = useSearchParams().get("tool");
  const t = useTranslations();
  const inApp = pathname.startsWith("/app");

  const current: ToolId = inApp
    ? ((active && active in TOOLS ? active : "humanize") as ToolId)
    : ((Object.values(TOOLS).find((tool) => tool.path === pathname)?.id ??
        "") as ToolId);

  return (
    <div
      role="tablist"
      className={cn(
        "-mb-px flex [scrollbar-width:none] gap-0.5 overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {Object.values(TOOLS).map((tool) => {
        const selected = tool.id === current;
        const reachable = inApp ? tool.live : tool.landing;
        const name = t(`tools.${tool.id}.name`);
        const classes = cn(
          "relative shrink-0 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors",
          selected ? "text-brand" : "text-muted-foreground",
          reachable ? "hover:text-foreground" : "cursor-not-allowed opacity-50",
        );

        const underline = selected && (
          <span className="bg-brand absolute inset-x-2.5 -bottom-px h-0.5 rounded-full" />
        );

        if (!reachable) {
          return (
            <span
              key={tool.id}
              role="tab"
              aria-disabled
              title={t("nav.soon")}
              className={classes}
            >
              {name}
            </span>
          );
        }

        return (
          <Link
            key={tool.id}
            role="tab"
            aria-selected={selected}
            href={
              inApp ? { pathname: "/app", query: { tool: tool.id } } : tool.path
            }
            className={classes}
          >
            {name}
            {underline}
          </Link>
        );
      })}
    </div>
  );
}
