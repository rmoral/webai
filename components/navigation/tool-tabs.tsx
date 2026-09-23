"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { useViewer } from "@/components/marketing/viewer";
import { Badge } from "@/components/ui/badge";
import { TOOLS, type ToolId } from "@/lib/ai/tools";
import { PLANS, type PlanId } from "@/lib/billing/plans";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

// One tab strip for both areas. Inside /app it switches the editor's tool
// through a query param; on marketing it points at each tool's landing, which
// is the page that has to rank. Tools that are not live yet render as plain
// text — `live` comes from lib/ai/tools.ts, never from a check here.
//
// Wrapped in Suspense because useSearchParams would otherwise opt every
// marketing page out of static rendering.
export function ToolTabs({
  className,
  plan,
}: {
  className?: string;
  /**
   * Whose tabs these are. Inside /app the layout knows it and says so;
   * on the marketing pages, which are prerendered, the browser answers
   * and this is left out.
   */
  plan?: PlanId;
}) {
  return (
    <Suspense fallback={<div className="h-[3.75rem]" />}>
      <Tabs className={className} plan={plan} />
    </Suspense>
  );
}

function Tabs({ className, plan }: { className?: string; plan?: PlanId }) {
  // next-intl's usePathname: the internal pathname, so matching a tool works
  // the same in both languages without a table of translated URLs here.
  const pathname = usePathname();
  const active = useSearchParams().get("tool");
  const t = useTranslations();
  const inApp = pathname.startsWith("/app");
  // The server's answer where there is one, the browser's where the page
  // was built without a reader. Anonymous until either speaks, which is
  // what the prerendered HTML says and what most readers are.
  const viewer = useViewer();
  const mine = plan ?? viewer?.plan ?? "anonymous";

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
        // Wall C opens on the first attempt to use one of these, which is
        // a surprise if nothing said so beforehand. It stays a link: the
        // tab is how somebody finds out what the tool does, and the wall
        // is a better argument with the tool in front of it.
        const locked = !PLANS[mine].limits.tools.includes(tool.id);
        const mark = locked && (
          <Badge
            variant="brand"
            className="ml-1.5 px-1 py-0 text-[0.625rem] leading-4"
          >
            {t("plans.pro")}
          </Badge>
        );
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
            {mark}
            {underline}
          </Link>
        );
      })}
    </div>
  );
}
