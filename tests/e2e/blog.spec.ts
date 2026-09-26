import { expect, test } from "./fixtures";

// The blog is a section that exists to be indexed and to send readers to a
// tool. Both halves are checked here: that the pages are really there and
// really static, and that the article ends in a working link.

test("the index lists the articles and they open", async ({ page }) => {
  const response = await page.goto("/blog");
  expect(response?.status()).toBe(200);

  const articles = page.locator("main article");
  await expect(articles).toHaveCount(3);

  // Newest first, which is what content/blog sorts for.
  const first = articles.first();
  await expect(first.locator("time")).toHaveCount(1);
  await first.getByRole("link").click();

  // A client-side navigation: the URL changes after the click resolves.
  await page.waitForURL(/\/blog\/[a-z0-9-]+$/);
  await expect(page.locator("main h1")).toBeVisible();
});

test("an article says which page it is and ends where it should", async ({
  page,
}) => {
  await page.goto("/blog/como-humanizar-un-texto-de-ia");

  await expect(page.locator("main h1")).toHaveText(
    "Cómo humanizar un texto de IA",
  );

  // Canonical and no hreflang: the article exists in Spanish only, and
  // pointing at an English URL nobody wrote is worse than saying nothing.
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/blog\/como-humanizar-un-texto-de-ia$/,
  );
  await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);

  // Article structured data, so it can appear as one.
  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  expect(JSON.parse(jsonLd ?? "{}")).toMatchObject({ "@type": "Article" });

  // The reason the article exists: a link to the tool it argues for.
  await page.getByRole("link", { name: /Abrir el .*[Hh]umanizador/ }).click();
  await page.waitForURL("**/humanizador-de-texto-ia");
});

test("a slug nobody wrote is a 404, in either language", async ({ page }) => {
  for (const path of [
    "/blog/no-existe",
    "/en/blog/como-humanizar-un-texto-de-ia",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
  }
});

test("the language switcher never offers the 404", async ({ page }) => {
  // It resolves the internal pathname against the other locale, which for
  // /blog would be /en/blog -- a page that does not exist. On the blog it
  // has to land on the English home instead.
  await page.goto("/blog/como-humanizar-un-texto-de-ia");
  await expect(
    page.getByRole("navigation", { name: "Idioma" }).getByRole("link", {
      name: "en",
    }),
  ).toHaveAttribute("href", "/en");
});

test("English has no blog yet, and does not pretend to", async ({ page }) => {
  // An index with nothing on it is a thin page, and a footer link to it
  // would be a link to a 404 on every page of the site.
  const response = await page.goto("/en/blog");
  expect(response?.status()).toBe(404);

  await page.goto("/en");
  await expect(
    page.locator("footer").getByRole("link", { name: "Blog" }),
  ).toHaveCount(0);

  await page.goto("/");
  await expect(
    page.locator("footer").getByRole("link", { name: "Blog" }),
  ).toHaveCount(1);
});
