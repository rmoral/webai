import type { Metadata } from "next";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";

import { ToolCta } from "@/components/marketing/article";
import { findPost, POSTS } from "@/content/blog";
import { getPathname, Link } from "@/lib/i18n/navigation";
import { SITE_ORIGIN, type Locale } from "@/lib/i18n/routing";

type Params = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return POSTS.map((post) => ({ locale: post.locale, slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = findPost(locale, slug);
  if (!post) return {};
  const href = { pathname: "/blog/[slug]" as const, params: { slug } };
  return {
    title: post.title,
    description: post.description,
    // No `languages`: an article exists in the language it was written in,
    // and pointing hreflang at a URL nobody wrote is worse than silence.
    alternates: { canonical: getPathname({ href, locale }) },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.published,
      modifiedTime: post.updated ?? post.published,
    },
  };
}

export default async function Article({ params }: Params) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = findPost(locale, slug);
  if (!post) notFound();

  const t = await getTranslations("blog");
  const format = await getFormatter();
  const url = new URL(
    getPathname({
      href: { pathname: "/blog/[slug]", params: { slug } },
      locale,
    }),
    SITE_ORIGIN,
  ).toString();

  // Our own serialised object, never user input.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.published,
    dateModified: post.updated ?? post.published,
    inLanguage: post.locale,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: "Verbalyx" },
    publisher: { "@type": "Organization", name: "Verbalyx" },
  };

  return (
    <main className="mx-auto max-w-[65rem] px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/blog"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        {t("back")}
      </Link>

      <article className="mt-6">
        <p className="text-muted-foreground text-xs">
          <time dateTime={post.published}>
            {format.dateTime(new Date(post.published), { dateStyle: "long" })}
          </time>
        </p>
        <h1 className="mt-2 max-w-[42rem] text-3xl font-bold tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <post.Body />
        <ToolCta tool={post.tool} />
      </article>
    </main>
  );
}
