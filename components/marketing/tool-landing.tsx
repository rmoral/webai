import { getTranslations } from "next-intl/server";

import { ToolEditor } from "@/components/tools/tool-editor";
import { TOOLS, type ToolId } from "@/lib/ai/tools";
import { Link } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import { PLANS } from "@/lib/billing/plans";

// One landing for four tools. The pages used to be four near-identical files
// of about 150 lines each, which is how the detector's landing ended up
// describing an engine that had been replaced: nobody edits four copies.
// Everything specific to a tool is now copy in messages/<locale>.json, so
// adding a language adds no page and changing one changes one thing.

export interface ToolLandingProps {
  tool: ToolId;
  locale: Locale;
  /** The tool the closing line points at. */
  related: ToolId;
}

/**
 * Placeholders every landing may use, so the copy can quote real limits
 * instead of repeating numbers that go stale. Plan limits live in
 * lib/billing/plans.ts and are never written into a string by hand.
 */
const VALUES = {
  anonWords: PLANS.anonymous.limits.wordsPerDay ?? 0,
  anonRequest: PLANS.anonymous.limits.maxWordsPerRequest,
  freeWords: PLANS.free.limits.wordsPerDay ?? 0,
};

export async function ToolLanding({ tool, locale, related }: ToolLandingProps) {
  const t = await getTranslations(`landing.${tool}`);
  const shared = await getTranslations();

  const signals = t.raw("signals") as { term: string; description: string }[];
  const notes = t.raw("notes") as { title: string; body: string }[];
  // t.raw returns the string unformatted, so the FAQ is read back through
  // t() by index: that is what substitutes {anonWords} and friends.
  //
  // The cast is the price of keeping the FAQ an array. Typed keys cannot
  // express "entry 3 takes values and entry 1 does not", so TypeScript
  // collapses the argument type to `undefined` and rejects every call. The
  // keys themselves are still checked at runtime by next-intl, which throws
  // on a missing one.
  const fill = t as unknown as (
    key: string,
    values?: Record<string, string | number>,
  ) => string;
  const faq = (t.raw("faq") as unknown[]).map((_, i) => ({
    q: fill(`faq.${i}.q`, VALUES),
    a: fill(`faq.${i}.a`, VALUES),
  }));

  // Rendered as one graph so the FAQ and the application describe the same
  // page. The answers here are the same strings the visitor reads below —
  // a FAQ block that does not match the visible page is a manual action.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: `Verbalyx — ${shared(`tools.${tool}.name`)}`,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        inLanguage: locale,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };

  return (
    <main className="mx-auto max-w-[65rem] px-6 py-12">
      {/* Our own serialised object, never user input. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t("h1")}
      </h1>
      <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
        {t("intro")}
      </p>

      <div className="mt-8">
        <ToolEditor tool={tool} />
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold">{t("signalsTitle")}</h2>
        {/* A definition list rather than a paragraph with bold runs inside:
            the four items are terms with descriptions, and the markup that
            says so survives translation without rich-text placeholders. */}
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {signals.map(({ term, description }) => (
            <div key={term} className="rounded-xl border p-4">
              <dt className="font-medium">{term}</dt>
              <dd className="text-muted-foreground mt-1 text-sm leading-relaxed">
                {description}
              </dd>
            </div>
          ))}
        </dl>

        {notes.map(({ title, body }) => (
          <div key={title} className="mt-8">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">{body}</p>
          </div>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold">{shared("landing.faqTitle")}</h2>
        <div className="mt-6 space-y-6">
          {faq.map(({ q, a }) => (
            <div key={q}>
              <h3 className="font-medium">{q}</h3>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                {a}
              </p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-muted-foreground mt-16 text-sm">
        {t("outro.lead")}{" "}
        <Link href={TOOLS[related].path} className="underline">
          {t("outro.tool")}
        </Link>
        ,{" "}
        <Link href="/pricing" className="underline">
          {t("outro.pricing")}
        </Link>
        .
      </p>
    </main>
  );
}
