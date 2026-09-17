"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import { Link, usePathname } from "@/lib/i18n/navigation";
import { docForSlug, LEGAL_SLUGS } from "@/lib/i18n/legal";
import { LOCALE_LABELS, routing, type Locale } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Switches language without leaving the page.
 *
 * `usePathname` here is next-intl's, so it returns the INTERNAL pathname
 * ("/detect", not "/detector-de-ia"). Passing that to a locale-aware Link is
 * what turns /detector-de-ia into /en/ai-detector rather than dropping the
 * visitor on the English home page -- which is the usual way a language
 * switcher quietly loses people.
 *
 * Nothing is auto-detected or remembered across visits on purpose: sending a
 * Spanish speaker to /en because their browser header says so breaks
 * indexing and surprises the visitor. This is the way across.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();
  const params = useParams();
  const active = useLocale();
  const t = useTranslations("nav");

  // The legal slug is content, not a route parameter that carries across:
  // /legal/terminos has to become /en/legal/terms, not /en/legal/terminos.
  function paramsFor(locale: Locale) {
    if (pathname !== "/legal/[slug]") return params;
    const doc = docForSlug(active, String(params.slug));
    return doc ? { ...params, slug: LEGAL_SLUGS[locale][doc] } : params;
  }

  // TypeScript cannot pair a pathname union with the params that pathname
  // takes, so the pair is asserted here. What keeps it honest is that the
  // pathname and the params both come from the route being rendered.
  const hrefFor = (locale: Locale) =>
    ({ pathname, params: paramsFor(locale) }) as Parameters<
      typeof Link
    >[0]["href"];

  return (
    <nav
      aria-label={t("language")}
      className={cn("flex items-center", className)}
    >
      {routing.locales.map((locale, i) => (
        <span key={locale} className="flex items-center">
          {i > 0 && (
            <span aria-hidden className="text-muted-foreground/40 px-1 text-xs">
              /
            </span>
          )}
          <Link
            href={hrefFor(locale)}
            locale={locale}
            hrefLang={locale}
            aria-current={locale === active ? "true" : undefined}
            className={cn(
              "px-1 text-xs font-medium uppercase transition-colors",
              locale === active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            title={LOCALE_LABELS[locale]}
          >
            {locale}
          </Link>
        </span>
      ))}
    </nav>
  );
}
