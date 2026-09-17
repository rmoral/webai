import type { Metadata } from "next";

import { getPathname } from "./navigation";
import { routing, type Locale } from "./routing";

type Href = Parameters<typeof getPathname>[0]["href"];

/**
 * The hreflang block for a page, derived from the routing table so it can
 * never disagree with the actual URLs.
 *
 * Two languages pointing at each other is the whole job: without it Google
 * reads /detector-de-ia and /en/ai-detector as unrelated pages competing for
 * the same site, and picks one.
 *
 * `x-default` goes to Spanish, which is where the product started and what
 * a visitor with no matching language should land on.
 */
export function alternatesFor(
  href: Href,
  locale: Locale,
): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const other of routing.locales) {
    languages[other] = getPathname({ href, locale: other });
  }

  return {
    canonical: getPathname({ href, locale }),
    languages: {
      ...languages,
      "x-default": getPathname({ href, locale: routing.defaultLocale }),
    },
  };
}
