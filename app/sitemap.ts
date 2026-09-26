import type { MetadataRoute } from "next";

import { TOOLS } from "@/lib/ai/tools";
import { postsFor } from "@/content/blog";
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

const url = (href: Href, locale: Locale) =>
  new URL(getPathname({ href, locale }), SITE_ORIGIN).toString();

/**
 * The blog, which is the one part of the site that is not symmetric.
 *
 * An article exists in the language it was written in, so these URLs carry
 * no `alternates`: hreflang has to name a page that exists, and there are
 * no English articles yet. The list comes from content/blog, the same one
 * the index and the footer read, so a draft that is not published cannot
 * appear here.
 */
function blogPages(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) => {
    const posts = postsFor(locale);
    if (posts.length === 0) return [];
    const newest = new Date(posts[0].updated ?? posts[0].published);
    return [
      {
        url: url("/blog", locale),
        lastModified: newest,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      },
      ...posts.map((post) => ({
        url: url(
          { pathname: "/blog/[slug]", params: { slug: post.slug } },
          locale,
        ),
        lastModified: new Date(post.updated ?? post.published),
        // An article is rewritten when it is wrong, not on a schedule.
        changeFrequency: "yearly" as const,
        priority: 0.7,
      })),
    ];
  });
}

/** The legal pages are deliberately left out: they are noindex. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PUBLIC_PAGES.flatMap((href) =>
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
    ),
    ...blogPages(),
  ];
}
