import type { Locale } from "@/lib/i18n/routing";

/**
 * The languages the blog exists in.
 *
 * A separate module from the registry on purpose: the language switcher is a
 * client component, and importing the registry there would pull every
 * article's JSX into the browser bundle of every page on the site. This is
 * the one fact the client needs.
 *
 * Kept honest by tests/blog.test.ts, which compares it against the articles
 * that actually exist -- so publishing the first English post cannot leave
 * the switcher pointing at a 404.
 */
export const BLOG_LOCALES: readonly Locale[] = ["es"];
