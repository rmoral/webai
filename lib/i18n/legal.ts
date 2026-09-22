import type { Locale } from "./routing";

// The legal documents are one route with four slugs, and the slug itself is
// part of the URL a person reads. /en/legal/aviso-legal would be sloppy, so
// each document carries its own slug per language and the page resolves the
// incoming slug back to the document id.

/**
 * The version of the terms on screen, recorded with every consent to be
 * charged. Bump it whenever the legal copy changes in either language:
 * a dispute is answered with "these were the terms they accepted", and a
 * version that never moves cannot say which ones those were.
 *
 * It is also what the legal pages print as their last-updated date, so the
 * two can never drift apart.
 */
export const TERMS_VERSION = "2026-09-17";

export const LEGAL_DOCS = [
  "legalNotice",
  "terms",
  "privacy",
  "cookies",
] as const;

export type LegalDoc = (typeof LEGAL_DOCS)[number];

/**
 * Spanish slugs are the ones the site launched with and must not change:
 * they are indexed and linked.
 */
export const LEGAL_SLUGS: Record<Locale, Record<LegalDoc, string>> = {
  es: {
    legalNotice: "aviso-legal",
    terms: "terminos",
    privacy: "privacidad",
    cookies: "cookies",
  },
  en: {
    legalNotice: "legal-notice",
    terms: "terms",
    privacy: "privacy",
    cookies: "cookies",
  },
};

export function docForSlug(locale: Locale, slug: string): LegalDoc | undefined {
  const slugs = LEGAL_SLUGS[locale];
  return LEGAL_DOCS.find((doc) => slugs[doc] === slug);
}
