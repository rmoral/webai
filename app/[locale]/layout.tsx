import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";

import { AnalyticsProvider } from "@/components/analytics-provider";
import {
  HTML_LANG,
  SITE_ORIGIN,
  routing,
  type Locale,
} from "@/lib/i18n/routing";

// The root layout lives here rather than at app/layout.tsx because the
// language is a route segment: <html lang> cannot be decided above it.
// Everything outside this tree is a route handler, which needs no layout.

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });

  return {
    // Always set: every page's canonical and hreflang are relative paths
    // (see alternatesFor), and without a base Next resolves them against
    // the deployment host -- so the canonicals named a *.vercel.app URL
    // while the sitemap named the real site.
    metadataBase: new URL(SITE_ORIGIN),
    title: { default: t("title"), template: `%s · Verbalyx` },
    description: t("description"),
    // No `alternates` here on purpose: metadata is inherited, so a canonical
    // set on the layout would make every page under it claim to be the home
    // page. Each indexable page declares its own pair.
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Opts every page under this layout into static rendering; without it
  // reading the locale forces every marketing page dynamic, and they are
  // the pages that have to be fast and free to serve.
  setRequestLocale(locale);

  return (
    <html lang={HTML_LANG[locale]}>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
