import { getTranslations } from "next-intl/server";

import { TOOLS, type ToolId } from "@/lib/ai/tools";
import { Link } from "@/lib/i18n/navigation";

// The chrome an article is read in, and the two things every article ends
// with: the tool it argues for, and the tools it did not.

/**
 * Typography for prose written as plain HTML inside an article.
 *
 * Descendant selectors rather than a component per tag, and rather than the
 * typography plugin, which would be a dependency for one page type. What it
 * buys: an article is written as `<h2>` and `<p>`, so the file reads as the
 * text it is and nothing in it has to know about the design.
 */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={[
        "mt-8 max-w-[42rem] text-base/7",
        "[&>p]:mt-5",
        "[&>h2]:mt-12 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:tracking-tight",
        "[&>h3]:mt-8 [&>h3]:text-lg [&>h3]:font-semibold",
        "[&>ul]:mt-5 [&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pl-6",
        "[&>ol]:mt-5 [&>ol]:list-decimal [&>ol]:space-y-2 [&>ol]:pl-6",
        "[&_strong]:font-semibold",
        "[&_a]:decoration-brand/40 [&_a]:underline [&_a]:underline-offset-2",
        "[&_a:hover]:decoration-brand",
        "[&>blockquote]:border-brand/30 [&>blockquote]:text-muted-foreground",
        "[&>blockquote]:mt-5 [&>blockquote]:border-l-2 [&>blockquote]:pl-4",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/**
 * The article's conclusion, as a link to the thing it has been describing.
 *
 * Deliberately not a banner: an article that ranks and sends nobody
 * anywhere is a cost, and a reader who has read this far has earned a
 * sentence rather than an advertisement. The tool's name and path come from
 * TOOLS, so a renamed route cannot leave a dead link behind.
 */
export async function ToolCta({ tool }: { tool: ToolId }) {
  const t = await getTranslations("blog");
  const shared = await getTranslations();
  const name = shared(`tools.${tool}.name`);

  return (
    <aside className="border-brand/20 bg-brand/5 mt-12 max-w-[42rem] rounded-xl border p-6">
      <p className="font-medium">{t("ctaTitle", { tool: name })}</p>
      <p className="text-muted-foreground mt-1 text-sm">{t("ctaBody")}</p>
      <Link
        href={TOOLS[tool].path}
        className="text-brand mt-4 inline-flex text-sm font-medium underline underline-offset-4"
      >
        {t("ctaLink", { tool: name })}
      </Link>
    </aside>
  );
}
