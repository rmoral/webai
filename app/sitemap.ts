import type { MetadataRoute } from "next";

import { TOOLS } from "@/lib/ai/tools";
import { getPathname } from "@/lib/i18n/navigation";
import { SITE_ORIGIN, routing, type Locale } from "@/lib/i18n/routing";

// There was no sitemap at all before this. A bilingual site without one --
// and without the alternates below -- leaves Google to guess which of
// /detector-de-ia and /en/ai-detector is the page, and it usually guesses by
// picking one and dropping the other.
//
// Every URL is derived from the routing table, so a route that gets added or
// renamed cannot be left out of here by forgetting.

type Href = Parameters<typeof getPathname>[0]["href"];

const PUBLIC_PAGES: Href[] = [
  "/",
  ...Object.values(TOOLS)
    .filter((tool) => tool.landing)
    .map((tool) => tool.path),
  "/pricing",
];

/** The legal pages are deliberately left out: they are noindex. */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (href: Href, locale: Locale) =>
    new URL(getPathname({ href, locale }), SITE_ORIGIN).toString();

  return PUBLIC_PAGES.flatMap((href) =>
    routing.locales.map((locale) => ({
      url: url(href, locale),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: href === "/" ? 1 : 0.8,
      // The pair of URLs has to declare each other here as well as in the
      // page's own metadata; Search Console reads the sitemap first.
      alternates: {
        languages: Object.fromEntries([
          ...routing.locales.map((other) => [other, url(href, other)]),
          ["x-default", url(href, routing.defaultLocale)],
        ]),
      },
    })),
  );
}
