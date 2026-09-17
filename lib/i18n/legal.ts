import type { Locale } from "./routing";

// The legal documents are one route with four slugs, and the slug itself is
// part of the URL a person reads. /en/legal/aviso-legal would be sloppy, so
// each document carries its own slug per language and the page resolves the
// incoming slug back to the document id.

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
