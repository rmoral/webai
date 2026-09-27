import { describe, expect, it } from "vitest";

import { POSTS, findPost, postsFor } from "@/content/blog";
import { BLOG_LOCALES } from "@/content/blog/locales";
import { TOOLS } from "@/lib/ai/tools";
import { getPathname } from "@/lib/i18n/navigation";

// The blog's invariants, which are all SEO invariants: this is a section
// that exists to be indexed, and every one of these failures is invisible
// on the page and visible in Search Console weeks later.

describe("every article", () => {
  it.each(POSTS.map((post) => [post.slug, post] as const))(
    "%s holds together",
    (_slug, post) => {
      // A slug is a URL. An accent or a capital here comes back as
      // percent-encoding in the sitemap and as two URLs for one page.
      expect(post.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);

      // Titles and descriptions are what Google prints. Past these lengths
      // it truncates mid-sentence, and the layout still appends
      // " · Verbalyx" to the title.
      expect(post.title.length).toBeLessThanOrEqual(55);
      expect(post.description.length).toBeGreaterThanOrEqual(70);
      expect(post.description.length).toBeLessThanOrEqual(160);

      expect(post.published).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(post.published))).toBe(false);
      // A post dated tomorrow is a mistake, not a schedule: it is already
      // live and it is already in the sitemap.
      expect(Date.parse(post.published)).toBeLessThanOrEqual(Date.now());

      // The closing link is the reason the article exists. A tool whose
      // landing is not published would make it a link to a 404.
      expect(TOOLS[post.tool].landing).toBe(true);
    },
  );

  it("has a slug of its own", () => {
    const seen = POSTS.map((post) => `${post.locale}/${post.slug}`);
    expect(new Set(seen).size).toBe(seen.length);
  });

  it("is reachable at the URL the routing table builds", () => {
    for (const post of POSTS) {
      const path = getPathname({
        href: { pathname: "/blog/[slug]", params: { slug: post.slug } },
        locale: post.locale,
      });
      expect(path).toContain(post.slug);
      expect(findPost(post.locale, post.slug)).toBe(post);
    }
  });
});

describe("the index", () => {
  it("reads newest first", () => {
    const dates = POSTS.map((post) => post.published);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("has something to show in Spanish and nothing yet in English", () => {
    // Not a gap to be filled quietly: /en/blog answers 404 on purpose, and
    // this is the assertion that has to be changed when that stops being
    // true -- together with the hreflang the pages deliberately omit.
    expect(postsFor("es").length).toBeGreaterThan(0);
    expect(postsFor("en")).toEqual([]);
  });

  it("agrees with what the language switcher was told", () => {
    // The switcher cannot import the registry -- it is a client component,
    // and that would ship every article to every page -- so it reads a
    // hand-kept list. This is what stops the two from drifting: publish the
    // first English article and this fails until the switcher knows.
    const written = [...new Set(POSTS.map((post) => post.locale))].sort();
    expect([...BLOG_LOCALES].sort()).toEqual(written);
  });

  it("never offers a post in a language it was not written in", () => {
    for (const post of POSTS) {
      expect(
        findPost(post.locale === "es" ? "en" : "es", post.slug),
      ).toBeUndefined();
    }
  });
});
