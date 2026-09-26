import type { ToolId } from "@/lib/ai/tools";
import type { Locale } from "@/lib/i18n/routing";

import { post as humanizar } from "./es/como-humanizar-un-texto-de-ia";
import { post as detectores } from "./es/que-detectan-los-detectores-de-ia";
import { post as parafrasear } from "./es/parafrasear-sin-plagiar";

// The blog, as one list.
//
// Articles are TSX rather than MDX because MDX would be a dependency and
// CLAUDE.md asks first, and because these pages are read far more often
// than they are written: as components they are Server Components with no
// parser, no runtime and no client JS, which is what lets a post that has
// to rank load in one request.
//
// Each post is a module exporting `post`, imported statically here. A file
// nobody imports is a file nobody publishes -- there is no directory scan,
// so a draft is simply a file left out of this list.

export interface Post {
  /** The URL segment. Its language is the language of the article. */
  slug: string;
  locale: Locale;
  /** The <h1> and, with the layout's template, the <title>. */
  title: string;
  /** The meta description and the text on the index card. */
  description: string;
  /** ISO date, yyyy-mm-dd. */
  published: string;
  updated?: string;
  /**
   * The tool the article exists to send the reader to.
   *
   * Every post has one. A blog that ranks and sends nobody anywhere is a
   * cost, and the link has to be the article's own conclusion rather than
   * a banner bolted to the end of it.
   */
  tool: ToolId;
  Body: React.ComponentType;
}

/**
 * Newest first, which is the order the index reads in.
 *
 * English is deliberately empty. A translated blog is ten more articles,
 * not a switch, and an index page with nothing on it is worse for the
 * language than no index at all -- so /en/blog 404s until there is
 * something to put on it, and the sitemap and the footer follow the same
 * rule from the same list.
 */
export const POSTS: Post[] = [humanizar, detectores, parafrasear].sort((a, b) =>
  b.published.localeCompare(a.published),
);

export function postsFor(locale: Locale): Post[] {
  return POSTS.filter((post) => post.locale === locale);
}

export function findPost(locale: Locale, slug: string): Post | undefined {
  return POSTS.find((post) => post.locale === locale && post.slug === slug);
}
