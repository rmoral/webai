import type { Metadata } from "next";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";

import { TRIAL } from "@/lib/billing/plans";
import {
  docForSlug,
  LEGAL_DOCS,
  LEGAL_SLUGS,
  TERMS_VERSION,
  type LegalDoc,
} from "@/lib/i18n/legal";
import { routing, type Locale } from "@/lib/i18n/routing";

// Minimal legal documents for a Florida LLC selling to Spanish- and
// English-speaking consumers. Governing law is Florida, but the service is
// also directed at Spain and LATAM, so EU/EEA/UK consumers keep their
// mandatory rights and the GDPR applies to them extraterritorially — hence
// the dedicated sections.
//
// PENDING before going live: a US consumer-law review of the subscription
// flow, a registered DMCA agent, and a decision on binding arbitration
// (deliberately not included here). See PLAN_DESARROLLO_WRITE_AI.md §6.
//
// One route, four documents, two languages. The slug is localised (see
// lib/i18n/legal.ts) so nobody reads /en/legal/aviso-legal; the text lives
// in messages/<locale>.json because it is content, and the company's own
// details stay here because they are one fact, not a translation.

const COMPANY = {
  name: "YBB SOLUTIONS, LLC",
  address:
    "7345 W Sand Lake Road, Ste 210, Office 1877, Orlando, Florida, United States",
  legalEmail: "legal@verbalyx.ai",
  contactEmail: "contact@verbalyx.ai",
};

type Params = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    LEGAL_DOCS.map((doc) => ({ locale, slug: LEGAL_SLUGS[locale][doc] })),
  );
}

async function resolve(params: Params["params"]) {
  const { locale, slug } = await params;
  const doc = docForSlug(locale, slug);
  return { locale, doc };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, doc } = await resolve(params);
  if (!doc) return {};
  const t = await getTranslations({ locale, namespace: `legal.${doc}` });

  // Not indexed, but still publicly reachable: Stripe requires a terms URL
  // that anyone can open, and these pages are linked from every footer.
  return { title: t("title"), robots: { index: false } };
}

export default async function LegalPage({ params }: Params) {
  const { locale, doc } = await resolve(params);
  if (!doc) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("legal");
  const values = {
    company: COMPANY.name,
    jurisdiction: t("jurisdiction"),
    address: COMPANY.address,
    legalEmail: COMPANY.legalEmail,
    contactEmail: COMPANY.contactEmail,
    trialDays: TRIAL.days,
  };

  // Same reason as the landings: typed keys cannot express "this entry takes
  // values and that one does not", so the sections are counted with raw()
  // and read back through t() to be formatted.
  const fill = t as unknown as (
    key: string,
    values?: Record<string, string | number>,
  ) => string;
  const count = (t.raw(`${doc}.sections`) as unknown[]).length;
  const sections = Array.from({ length: count }, (_, i) => ({
    heading: fill(`${doc}.sections.${i}.heading`, values),
    body: fill(`${doc}.sections.${i}.body`, values),
  }));

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">
        {t(`${doc satisfies LegalDoc}.title`)}
      </h1>
      <div className="mt-8 space-y-8">
        {sections.map(({ heading, body }) => (
          <section key={heading}>
            <h2 className="text-lg font-semibold">{heading}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {body}
            </p>
          </section>
        ))}
      </div>
      {/* The same constant that is written into every consent record, so
          the date a customer read here is the version we can prove. */}
      <p className="text-muted-foreground mt-12 text-xs">
        {t("updated", {
          date: (await getFormatter({ locale })).dateTime(
            new Date(TERMS_VERSION),
            { day: "numeric", month: "long", year: "numeric" },
          ),
        })}
      </p>
    </main>
  );
}
