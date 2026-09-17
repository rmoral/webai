import { expect, test, type Page } from "@playwright/test";

// The routing is the part of this that is invisible until it is wrong: a
// missing hreflang pair or a switcher that drops people on the home page
// costs traffic silently, and nothing else in the suite would notice.

const PAIRS = [
  { es: "/", en: "/en" },
  { es: "/detector-de-ia", en: "/en/ai-detector" },
  { es: "/humanizador-de-texto-ia", en: "/en/ai-humanizer" },
  { es: "/parafrasear-texto", en: "/en/paraphrasing-tool" },
  { es: "/corrector-ortografico-gramatical", en: "/en/grammar-checker" },
  { es: "/precios", en: "/en/pricing" },
];

test("every page declares its counterpart in the other language", async ({
  page,
}) => {
  for (const pair of PAIRS) {
    for (const [locale, path] of Object.entries(pair)) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);

      await expect(page.locator("html"), path).toHaveAttribute("lang", locale);

      // Both alternates plus x-default, and they must point at the pair.
      const alternates = page.locator('link[rel="alternate"]');
      await expect(alternates, path).toHaveCount(3);
      for (const [tag, target] of [
        ["es", pair.es],
        ["en", pair.en],
        ["x-default", pair.es],
      ]) {
        const href = await page
          .locator(`link[rel="alternate"][hreflang="${tag}"]`)
          .getAttribute("href");
        expect(href, `${path} → ${tag}`).toContain(target);
      }
    }
  }
});

test("the English slugs are search terms, not translated routes", async ({
  page,
}) => {
  // /en/detector-de-ia would be an English page at a Spanish URL, which is
  // the whole reason the routing table exists.
  const response = await page.goto("/en/detector-de-ia");
  expect(new URL(page.url()).pathname).toBe("/en/ai-detector");
  expect(response?.status()).toBe(200);
});

/**
 * The header resolves the session in the browser, so its buttons only appear
 * once the page has hydrated. Waiting for one is how we know a click will be
 * handled rather than swallowed by React replacing the DOM underneath it --
 * which is what a click fired within milliseconds of load actually hits.
 */
async function hydrated(page: Page, signIn: string) {
  await expect(page.getByRole("link", { name: signIn }).first()).toBeVisible();
}

test("the switcher keeps you on the same page", async ({ page }) => {
  await page.goto("/parafrasear-texto");
  await hydrated(page, "Entrar");
  await page.getByRole("link", { name: "en", exact: true }).click();
  await page.waitForURL(/\/en\/paraphrasing-tool$/);
  await expect(page.locator("h1")).toHaveText("Paraphrasing tool");

  await hydrated(page, "Sign in");
  await page.getByRole("link", { name: "es", exact: true }).click();
  await page.waitForURL(/\/parafrasear-texto$/);
});

test("the legal slug crosses languages instead of being carried over", async ({
  page,
}) => {
  await page.goto("/legal/terminos");
  await hydrated(page, "Entrar");
  await page.getByRole("link", { name: "en", exact: true }).click();
  await page.waitForURL(/\/en\/legal\/terms$/);
  await expect(page.locator("h1")).toHaveText("Terms of service");
});

test("the sitemap lists both languages and pairs them", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();

  for (const pair of PAIRS) {
    expect(xml).toContain(`<loc>`);
    expect(xml).toContain(`${pair.en}<`);
  }
  expect(xml).toContain('hreflang="x-default"');
});

test("robots keeps crawlers out of the private areas", async ({ request }) => {
  const txt = await (await request.get("/robots.txt")).text();

  expect(txt).toContain("Sitemap:");
  for (const path of ["/app", "/en/app", "/admin", "/api/"]) {
    expect(txt, path).toContain(`Disallow: ${path}`);
  }
});

test("a missing page answers in the language it was reached from", async ({
  page,
}) => {
  await page.goto("/en/does-not-exist");
  await expect(page.getByText("This page does not exist")).toBeVisible();

  await page.goto("/no-existe");
  await expect(page.getByText("Esta página no existe")).toBeVisible();
});
