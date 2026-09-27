import type { Metadata } from "next";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";

import { postsFor } from "@/content/blog";
import { getPathname, Link } from "@/lib/i18n/navigation";
import { routing, type Locale } from "@/lib/i18n/routing";

type Params = { params: Promise<{ locale: Locale }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    // Canonical only, deliberately without `languages`: hreflang has to
    // point at a page that exists, and the other language has no blog yet.
    // Declaring the pair anyway is how a 404 ends up in Search Console as
    // an alternate of a page that ranks.
    alternates: { canonical: getPathname({ href: "/blog", locale }) },
  };
}

export default async function BlogIndex({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);

  const posts = postsFor(locale);
  // Nothing written in this language yet. A 404 is the honest answer: an
  // index with no articles is a thin page, and Google reads a site by the
  // worst pages it can find as much as by the best.
  if (posts.length === 0) notFound();

  const t = await getTranslations("blog");
  const format = await getFormatter();

  return (
    <main className="mx-auto max-w-[65rem] px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t("title")}
      </h1>
      <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
        {t("intro")}
      </p>

      <div className="mt-10 flex flex-col gap-4">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="hover:border-brand/40 rounded-xl border p-6 transition-colors"
          >
            <p className="text-muted-foreground text-xs">
              <time dateTime={post.published}>
                {format.dateTime(new Date(post.published), {
                  dateStyle: "long",
                })}
              </time>
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              <Link
                href={{
                  pathname: "/blog/[slug]",
                  params: { slug: post.slug },
                }}
                className="hover:text-brand"
              >
                {post.title}
              </Link>
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {post.description}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
