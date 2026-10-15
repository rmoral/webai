import { type Page } from "@playwright/test";

import { expect, test } from "./fixtures";

import { typeInto } from "./helpers";

// F2 · the paraphraser's own page: six registers in sight, the result
// before the original on a phone, and a way on from it.

/** Answers the paraphraser, keeping what each request asked for. */
async function answer(page: Page) {
  const bodies: Record<string, unknown>[] = [];
  await page.route("**/api/ai/paraphrase", (route) => {
    bodies.push(route.request().postDataJSON());
    return route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      headers: {
        "x-words-processed": "3",
        "x-uses-used": "1",
        "x-uses-limit": "2",
        "x-uses-remaining": "1",
      },
      body: "Un resultado distinto.",
    });
  });
  return bodies;
}

test("all six registers are in sight, each one described", async ({ page }) => {
  const bodies = await answer(page);
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/parafrasear-texto");

  const group = page.getByRole("radiogroup", { name: "Registro" });
  await expect(group.getByRole("radio")).toHaveCount(6);
  const standard = group.getByRole("radio", { name: "Estándar" });
  await expect(standard).toHaveAttribute("aria-checked", "true");
  const described = page.getByTestId("register-description");
  await expect(described).toContainText("Estándar. Reescritura equilibrada");

  // Arrows move the choice, as in any radio group.
  await standard.focus();
  await page.keyboard.press("ArrowRight");
  await expect(group.getByRole("radio", { name: "Fluido" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(described).toContainText(
    "Fluido. Prioriza que se lea bien en voz alta.",
  );

  await group.getByRole("radio", { name: "Académico" }).click();
  await typeInto(page, "Texto de entrada", "Un texto cualquiera.");
  await page.getByRole("button", { name: "Parafrasear" }).click();
  await expect(page.getByText("Un resultado distinto.")).toBeVisible();
  expect(bodies[0]).toMatchObject({ mode: "academico" });
});

test("on a phone: a dropdown, then the result first and a way on", async ({
  page,
}) => {
  const bodies = await answer(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/parafrasear-texto");

  await page
    .getByRole("combobox", { name: "Registro" })
    .selectOption("creativo");
  await typeInto(page, "Texto de entrada", "Un texto cualquiera.");
  await page.getByRole("button", { name: "Parafrasear" }).click();
  await expect(page.getByText("Un resultado distinto.")).toBeVisible();
  expect(bodies[0]).toMatchObject({ mode: "creativo" });

  // The result above the original, each with its label. Measured
  // together, in page coordinates: the page scrolls smoothly to the
  // result, and reads taken one after another would straddle the scroll.
  const [resultTop, yoursTop, boxTop] = await page.evaluate(() => {
    const top = (el: Element | null | undefined) =>
      el!.getBoundingClientRect().top + window.scrollY;
    const byText = (text: string) =>
      [...document.querySelectorAll("p")].find(
        (p) => p.textContent?.trim().toLowerCase() === text,
      );
    return [
      top(byText("resultado")),
      top(byText("tu texto")),
      top(document.querySelector('textarea[aria-label="Texto de entrada"]')),
    ];
  });
  expect(resultTop).toBeLessThan(yoursTop);
  expect(yoursTop).toBeLessThan(boxTop);

  // The note names a run's words and links to the trial on /precios.
  await expect(page.getByText(/Esto son 100 palabras/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Probar 3 días gratis" }),
  ).toHaveAttribute("href", /\/precios\?cycle=monthly#ilimitado$/);

  // On to the detector, with the result in its box.
  await page.getByRole("button", { name: "Comprobar con el detector" }).click();
  await expect(page).toHaveURL(/detector-de-ia/);
  await expect(page.getByLabel("Texto de entrada")).toHaveValue(
    "Un resultado distinto.",
  );
});
