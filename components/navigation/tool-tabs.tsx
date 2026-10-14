"use client";

import { Suspense, useEffect, useRef } from "react";
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
// Filled tabs rather than an underline (F2-15): four grey words in a row
// did not read as a way to switch tool. No "Pro" marks: every tool can be
// tried on the free plans (F2-01).
//
// Wrapped in Suspense because useSearchParams would otherwise opt every
// marketing page out of static rendering.
export function ToolTabs({ className }: { className?: string }) {
  return (
    <Suspense fallback={<div className="h-[52px]" />}>
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
  const strip = useRef<HTMLElement>(null);

  const current: ToolId = inApp
    ? ((active && active in TOOLS ? active : "humanize") as ToolId)
    : ((Object.values(TOOLS).find((tool) => tool.path === pathname)?.id ??
        "") as ToolId);

  // On a phone the row scrolls, and the active tab may start off screen.
  // Bring it in once, without moving the page.
  useEffect(() => {
    const row = strip.current;
    const on = row?.querySelector<HTMLElement>("[aria-current='page']");
    if (row && on) row.scrollLeft = on.offsetLeft - row.offsetLeft - 16;
  }, [current]);

  return (
    <nav
      ref={strip}
      aria-label={t("footer.tools")}
      className={cn(
        "flex h-[52px] [scrollbar-width:none] items-center gap-1.5 overflow-x-auto py-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {Object.values(TOOLS).map((tool) => {
        const selected = tool.id === current;
        const reachable = inApp ? tool.live : tool.landing;
        const name = t(`tools.${tool.id}.name`);
        const classes = cn(
          "flex h-9 shrink-0 items-center rounded-lg px-3.5 text-sm whitespace-nowrap transition-colors",
          selected
            ? "bg-brand font-semibold text-white"
            : "bg-muted font-medium text-neutral-700",
          reachable
            ? !selected && "hover:bg-neutral-200"
            : "cursor-not-allowed opacity-50",
        );

        if (!reachable) {
          return (
            <span
              key={tool.id}
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
            aria-current={selected ? "page" : undefined}
            href={
              inApp ? { pathname: "/app", query: { tool: tool.id } } : tool.path
            }
            className={classes}
          >
            {name}
          </Link>
        );
      })}
    </nav>
  );
}
