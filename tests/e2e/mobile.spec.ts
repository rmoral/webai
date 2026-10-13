import { type Page } from "@playwright/test";

import { expect, test } from "./fixtures";

import { typeInto } from "./helpers";

// Phase 6 — the part of the acceptance checklist that only a browser can
// answer. Every one of these is a rule from 08-QA that reads as obvious and
// is broken by the next change nobody tested on a phone.

const PHONE = { width: 390, height: 844 };
const NARROW = { width: 480, height: 900 };

const PAGES = [
  "/",
  "/humanizador-de-texto-ia",
  "/detector-de-ia",
  "/precios",
  "/registro",
];

async function overflows(page: Page) {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  );
}

test.describe("at 390px", () => {
  test.use({ viewport: PHONE });

  for (const path of PAGES) {
    test(`${path} does not scroll sideways`, async ({ page }) => {
      await page.goto(path);
      // A horizontal scrollbar on a phone is the single most common way a
      // layout breaks, and it is invisible on the machine it was built on.
      expect(await overflows(page)).toBe(false);
    });
  }

  test("every button you press is at least 44px tall", async ({ page }) => {
    await page.goto("/precios");
    // The page's own calls to action. The header's "Crear cuenta" is the
    // design's 36px button beside a 40px menu, in a 56px bar (F1-04).
    const buttons = page.locator("main").getByRole("link", {
      name: /Crear cuenta|Elegir|Probar/,
    });
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  });

  test("the header is logo, one button and a menu", async ({ page }) => {
    await page.goto("/humanizador-de-texto-ia");
    const header = page.locator("header");
    const signup = header.getByRole("link", {
      name: "Crear cuenta",
      exact: true,
    });
    await expect(signup).toBeVisible();
    await expect(signup).toHaveAttribute("href", /next=/);
    // Language and sign-in moved into the menu.
    await expect(header.getByRole("link", { name: "Entrar" })).toBeHidden();
    await expect(
      header.getByRole("link", { name: "en", exact: true }),
    ).toBeHidden();

    const menu = header.getByRole("button", { name: "Menú", exact: true });
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    const sheet = page.locator("#marketing-menu");
    await expect(sheet.getByRole("link", { name: "Entrar" })).toBeVisible();
    await expect(sheet.getByRole("link", { name: "Precios" })).toBeVisible();
    await expect(
      sheet.getByRole("link", { name: "en", exact: true }),
    ).toBeVisible();

    await sheet.getByRole("link", { name: "Precios" }).click();
    await page.waitForURL(/\/precios$/);
    await expect(sheet).toHaveCount(0);
  });

  test("the run button is on screen before the result, above the banner", async ({
    page,
  }) => {
    // F1-03: tones, text, counter, button, then the result. The button used
    // to sit under the result panel, around 1000px down.
    await page.goto("/humanizador-de-texto-ia");
    const run = await page.getByTestId("run").boundingBox();
    const result = await page
      .getByText("El resultado aparecerá aquí")
      .boundingBox();
    expect(run!.y + run!.height).toBeLessThan(result!.y);
    // Clear of the cookie banner's 113px at the bottom of an 844 screen.
    expect(run!.y + run!.height).toBeLessThanOrEqual(PHONE.height - 113);
    expect(run!.height).toBe(48);
  });

  test("the paywall becomes a bottom sheet, not a centred box", async ({
    page,
  }) => {
    await page.route("**/api/ai/humanize", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/plain; charset=utf-8",
        headers: {
          "x-words-processed": "12",
          "x-words-limit": "300",
          "x-words-used": "300",
          "x-words-remaining": "0",
        },
        body: "Un resultado cualquiera, hecho con las palabras que quedaban.",
      }),
    );

    await page.goto("/humanizador-de-texto-ia");
    await typeInto(page, "Texto de entrada", "palabra ".repeat(40).trim());
    await page.getByRole("button", { name: "Humanizar" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const box = await dialog.boundingBox();
    const viewport = page.viewportSize()!;
    // Flush to the bottom and to both edges: a centred dialog on a phone
    // puts the primary action under nobody's thumb.
    expect(box!.y + box!.height).toBeCloseTo(viewport.height, -1);
    expect(box!.width).toBeCloseTo(viewport.width, -1);
    // And it never grows past the screen.
    expect(box!.height).toBeLessThanOrEqual(viewport.height);

    // F1-05: the trial button sits under the lead, above the fragment, in
    // reach without scrolling the sheet.
    const trial = await dialog
      .getByRole("button", { name: /Probar Ilimitado/ })
      .boundingBox();
    const fragment = await dialog
      .getByText("Un resultado cualquiera")
      .boundingBox();
    expect(trial!.y).toBeLessThan(fragment!.y);
    expect(trial!.y + trial!.height).toBeLessThan(viewport.height / 2);
  });
});

test.describe("at 480px", () => {
  test.use({ viewport: NARROW });

  test("the modal is still a sheet below the 520px threshold", async ({
    page,
  }) => {
    await page.goto("/parafrasear-texto");
    await typeInto(page, "Texto de entrada", "Un texto cualquiera.");
    await expect(page.getByRole("dialog")).toBeVisible();

    const box = await page.getByRole("dialog").boundingBox();
    expect(box!.y + box!.height).toBeCloseTo(NARROW.height, -1);
  });
});

test.describe("on a desktop", () => {
  test("the run button and the counter share the foot of the text column", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 800 });
    await page.goto("/humanizador-de-texto-ia");
    const run = await page.getByTestId("run").boundingBox();
    const count = await page.getByTestId("word-count").boundingBox();
    // One row: the counter's middle is within the button's height.
    const middle = count!.y + count!.height / 2;
    expect(middle).toBeGreaterThan(run!.y);
    expect(middle).toBeLessThan(run!.y + run!.height);
    // Starts above the 640 the brief sets for a laptop fold.
    expect(run!.y).toBeLessThan(640);
  });

  test("keyboard focus is visible on the things you press", async ({
    page,
  }) => {
    await page.goto("/precios");
    await page.keyboard.press("Tab");
    const outline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return null;
      const style = getComputedStyle(el);
      return {
        shadow: style.boxShadow,
        outline: style.outlineWidth,
        ring: style.getPropertyValue("--tw-ring-shadow"),
      };
    });
    // Something has to mark it. Tailwind draws the ring as a box-shadow, so
    // an outline of 0 is not by itself a failure.
    expect(outline).not.toBeNull();
    const marked =
      outline!.shadow !== "none" ||
      outline!.outline !== "0px" ||
      outline!.ring !== "";
    expect(marked).toBe(true);
  });
});
