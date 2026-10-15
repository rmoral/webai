import { type Page } from "@playwright/test";

import { expect, test } from "./fixtures";

import { typeInto } from "./helpers";

// F2 · the corrector's own page: two modes in sight, and the result as a
// review of the reader's text, change by change.

const BEFORE =
  "En el mundo actual las redes sociales, plataformas como Instagram, son sobretodo una parte de la vida.";
const AFTER =
  "En el mundo actual, las redes sociales. Plataformas como Instagram, son sobre todo una parte de la vida.";

async function answer(page: Page) {
  const bodies: Record<string, unknown>[] = [];
  await page.route("**/api/ai/correct", (route) => {
    bodies.push(route.request().postDataJSON());
    return route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      headers: {
        "x-words-processed": "18",
        "x-uses-used": "1",
        "x-uses-limit": "2",
        "x-uses-remaining": "1",
      },
      body: AFTER,
    });
  });
  return bodies;
}

test("two modes, each explained, and the one picked is the one sent", async ({
  page,
}) => {
  const bodies = await answer(page);
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/corrector-ortografico-gramatical");

  const group = page.getByRole("radiogroup", { name: "Modo" }).first();
  await expect(group.getByRole("radio")).toHaveCount(2);
  await expect(group.getByRole("radio", { name: /General/ })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(
    group.getByText("Corrige lo que está mal y no toca lo demás."),
  ).toBeVisible();

  await group.getByRole("radio", { name: /Académico/ }).click();
  await typeInto(page, "Texto de entrada", BEFORE);
  await page.getByRole("button", { name: "Corregir" }).click();
  await expect(page.getByTestId("review-text")).toBeVisible();
  expect(bodies[0]).toMatchObject({ mode: "academico" });
});

test("each change is taken or left, and the copy keeps only what was kept", async ({
  page,
}) => {
  await answer(page);
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/corrector-ortografico-gramatical");
  await typeInto(page, "Texto de entrada", BEFORE);
  await page.getByRole("button", { name: "Corregir" }).click();

  // The text box is the review now: the reader's text, marked. It waits
  // for the diff, whose library loads on demand.
  const review = page.getByTestId("review-text");
  await expect(review).toBeVisible({ timeout: 15_000 });
  await expect(review.locator("del")).toHaveCount(2);
  await expect(review.locator("ins")).toHaveCount(3);
  await expect(page.getByText("Tu texto, con los cambios")).toBeVisible();

  await expect(page.getByText("3 cambios").first()).toBeVisible();
  const rows = page.getByTestId("change");
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0)).toContainText("∅");

  await rows.nth(0).getByRole("button", { name: "Aceptar" }).click();
  await expect(rows.nth(0)).toContainText("Aceptado");
  await expect(page.getByText("2 cambios").first()).toBeVisible();

  await rows.nth(2).getByRole("button", { name: "Ignorar" }).click();
  await expect(rows.nth(2)).toContainText("Ignorado");
  await expect(review).toContainText("sobretodo");
  await expect(review.locator("del")).toHaveCount(1);

  await page.getByRole("button", { name: "Aceptar todos" }).first().click();
  await expect(page.getByText("0 cambios").first()).toBeVisible();

  // To the detector with the text as kept: the ignored change put back.
  await page.getByRole("button", { name: "Comprobar con el detector" }).click();
  await expect(page).toHaveURL(/detector-de-ia/);
  await expect(page.getByLabel("Texto de entrada")).toHaveValue(
    AFTER.replace("sobre todo", "sobretodo"),
  );
});

test("«Editar texto» gives back the box with what was written", async ({
  page,
}) => {
  await answer(page);
  await page.goto("/corrector-ortografico-gramatical");
  await typeInto(page, "Texto de entrada", BEFORE);
  await page.getByRole("button", { name: "Corregir" }).click();
  await page.getByRole("button", { name: "Editar texto" }).click();
  const box = page.getByLabel("Texto de entrada");
  await expect(box).toHaveValue(BEFORE);
  await expect(box).toBeFocused();
});

test("on a phone: a segmented control, then text, list and button in that order", async ({
  page,
}) => {
  await answer(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/corrector-ortografico-gramatical");

  const segmented = page.getByRole("radiogroup", { name: "Modo" }).last();
  await expect(segmented.getByRole("radio")).toHaveCount(2);
  const height = (await segmented.getByRole("radio").first().boundingBox())!
    .height;
  expect(height).toBe(40);

  await typeInto(page, "Texto de entrada", BEFORE);
  await page.getByRole("button", { name: "Corregir" }).click();
  const text = (await page.getByTestId("review-text").boundingBox())!;
  const list = (await page.getByTestId("change").first().boundingBox())!;
  const run = (await page.getByTestId("run").boundingBox())!;
  expect(text.y).toBeLessThan(list.y);
  expect(list.y).toBeLessThan(run.y);
  await expect(
    page.getByText(/Esto son 100 palabras corregidas/),
  ).toBeVisible();
});
