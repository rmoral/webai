import { defineRouting } from "next-intl/routing";

// The single source of truth for which languages exist and what every route
// is called in each of them.
//
// Spanish keeps the bare paths it launched with. Moving it under /es would
// mean redirecting every URL already indexed, and symmetry is not worth
// that, so `localePrefix` is "as-needed": Spanish is unprefixed, English
// lives under /en.
//
// The keys below are INTERNAL pathnames -- they mirror the folder names
// under app/[locale] and never appear in a URL. The values are what the
// visitor sees. English slugs are the terms people actually search for, not
// translations of the Spanish ones: that is the whole point of having them.

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
  // Sending a Spanish speaker to /en because their browser says so breaks
  // indexing and surprises the visitor. The switcher in the header is the
  // way across.
  localeDetection: false,
  pathnames: {
    "/": "/",

    "/humanize": {
      es: "/humanizador-de-texto-ia",
      en: "/ai-humanizer",
    },
    "/detect": {
      es: "/detector-de-ia",
      en: "/ai-detector",
    },
    "/paraphrase": {
      es: "/parafrasear-texto",
      en: "/paraphrasing-tool",
    },
    "/correct": {
      es: "/corrector-ortografico-gramatical",
      en: "/grammar-checker",
    },

    "/pricing": {
      es: "/precios",
      en: "/pricing",
    },

    // The second door to payment, for people arriving from pricing. The
    // other door is the paywall, which pays in a modal over the editor and
    // never comes here. Kept out of the sitemap and disallowed in robots:
    // it is a step in a flow, not a page.
    "/checkout": {
      es: "/pago",
      en: "/checkout",
    },

    // One route, four documents. The slug itself is localised through
    // LEGAL_SLUGS in lib/i18n/legal.ts rather than through four folders.
    "/legal/[slug]": "/legal/[slug]",

    "/login": "/login",
    "/auth/finish": "/auth/finish",

    "/app": "/app",
    "/app/history": {
      es: "/app/historial",
      en: "/app/history",
    },
    "/app/history/[id]": {
      es: "/app/historial/[id]",
      en: "/app/history/[id]",
    },
    "/app/account": {
      es: "/app/cuenta",
      en: "/app/account",
    },

    // Internal panel: same path in both languages on purpose.
    "/admin": "/admin",
  },
});

export type Locale = (typeof routing.locales)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  es: "Español",
  en: "English",
};

/** BCP 47 tags, for `lang`, `hreflang` and number formatting. */
export const HTML_LANG: Record<Locale, string> = {
  es: "es",
  en: "en",
};

export function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

/**
 * Reads the locale off the front of a pathname, and returns the rest of the
 * path with the prefix removed. Spanish is unprefixed, so a path with no
 * known prefix is Spanish.
 *
 * Used by the middleware and by the API, which lives outside the [locale]
 * tree and has only a URL to go on.
 */
export function splitLocale(pathname: string): {
  locale: Locale;
  rest: string;
} {
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue;
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return { locale, rest: pathname.slice(locale.length + 1) || "/" };
    }
  }
  return { locale: routing.defaultLocale, rest: pathname };
}

/**
 * The localised path for a route, without going through next-intl's
 * navigation helpers.
 *
 * Those helpers are built on React client hooks, so importing them drags
 * `next/navigation` into anything that renders outside a request -- an
 * email, a cron, a test. The routing table above is the source of truth
 * either way; this only reads it and applies the `as-needed` prefix rule.
 *
 * Use `Link` and `getPathname` from lib/i18n/navigation inside the app.
 * This is for the places that have no request to read.
 */
export function pathFor(href: keyof typeof routing.pathnames, locale: Locale) {
  const entry = routing.pathnames[href];
  const path = typeof entry === "string" ? entry : entry[locale];
  return locale === routing.defaultLocale ? path : `/${locale}${path}`;
}
