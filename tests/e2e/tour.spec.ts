import { expect, test } from "@playwright/test";

import { CONSENT_KEY, CONSENT_VERSION } from "@/lib/analytics/consent";

import { typeInto } from "./helpers";

// The three first-visit hints. Deliberately the bare Playwright `test`
// rather than the fixture, which seeds them as already seen (see
// fixtures.ts) -- a first visit is the whole subject here.
//
// The banner is still answered, because a cookie bar over the editor is a
// different spec's problem.

const LONG =
  "Este es un texto de prueba con suficientes palabras para que el contador no marque cero y el editor considere que hay algo que procesar.";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({ key, version }) => {
      try {
        localStorage.setItem(
          key,
          JSON.stringify({
            v: version,
            analytics: false,
            ads: false,
            at: Date.now(),
          }),
        );
      } catch {
        // The banner will show; these assertions do not depend on it.
      }
    },
    { key: CONSENT_KEY, version: CONSENT_VERSION },
  );
});

test("comes one at a time, in order", async ({ page }) => {
  await page.goto("/parafrasear-texto");

  // Empty box: the first hint, and only the first.
  await expect(page.getByTestId("tour-1")).toBeVisible();
  await expect(page.getByTestId("tour-2")).toHaveCount(0);
  await expect(page.getByTestId("tour-3")).toHaveCount(0);

  await typeInto(page, "Texto de entrada", LONG);

  // Text in the box: the register, and the first one is gone.
  await expect(page.getByTestId("tour-2")).toBeVisible();
  await expect(page.getByTestId("tour-1")).toHaveCount(0);
});

test("never touches what somebody wrote", async ({ page }) => {
  // The rule this exists to keep. The detector has no registers, so it goes
  // from the first hint to the third, and it runs without an AI key.
  await page.goto("/detector-de-ia");
  await expect(page.getByTestId("tour-1")).toBeVisible();

  const box = await typeInto(page, "Texto de entrada", LONG);
  // No register row on this tool, so no hint about one.
  await expect(page.getByTestId("tour-2")).toHaveCount(0);

  await page.getByTestId("run").click();
  await expect(page.getByTestId("detector-result")).toBeVisible({
    timeout: 15_000,
  });

  await expect(page.getByTestId("tour-3")).toBeVisible();
  // And the text is exactly as it was left.
  await expect(box).toHaveValue(LONG);

  await page.getByRole("button", { name: "Cerrar las pistas" }).click();
  await expect(page.getByTestId("tour-3")).toHaveCount(0);
  await expect(box).toHaveValue(LONG);
});

test("closing one closes the lot, for good", async ({ page }) => {
  await page.goto("/parafrasear-texto");
  await page.getByRole("button", { name: "Cerrar las pistas" }).click();
  await expect(page.getByTestId("tour-1")).toHaveCount(0);

  // Not on the next tool, and not on the next visit.
  await page.goto("/humanizador-de-texto-ia");
  await expect(page.getByTestId("tour-1")).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId("tour-1")).toHaveCount(0);
});

test("fits a phone without covering the box", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/parafrasear-texto");

  const hint = page.getByTestId("tour-1");
  await expect(hint).toBeVisible();

  // In the flow, not over the editor: the box has to be fully clickable
  // with the hint on screen, which is the whole reason this is not a modal.
  const box = page.getByLabel("Texto de entrada");
  const [hintBox, inputBox] = [
    await hint.boundingBox(),
    await box.boundingBox(),
  ];
  expect(hintBox!.y + hintBox!.height).toBeLessThanOrEqual(inputBox!.y + 1);
  expect(hintBox!.width).toBeLessThanOrEqual(390);
});
