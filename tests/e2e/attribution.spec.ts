import { expect, test } from "@playwright/test";

// The click that paid for a visit, and the consent that decides whether it
// may be remembered. Deliberately uses the bare Playwright `test` rather
// than the fixture, which seeds a refusal (see fixtures.ts): the whole
// point here is what each answer does.

const LANDING = "/?gclid=e2e-click-123&utm_source=google&utm_campaign=e2e";

const stored = (page: import("@playwright/test").Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("vbx:attr") ?? "null"));

test("keeps nothing when advertising is refused", async ({ page }) => {
  await page.goto(LANDING);
  await page
    .getByTestId("consent-banner")
    .getByRole("button", { name: "Rechazar" })
    .click();
  await expect(page.getByTestId("consent-banner")).toHaveCount(0);

  // Not "stored and unused": not stored.
  expect(await stored(page)).toBeNull();
});

test("remembers the campaign past the page it arrived on", async ({ page }) => {
  await page.goto(LANDING);
  await page
    .getByTestId("consent-banner")
    .getByRole("button", { name: "Aceptar" })
    .click();
  await expect(page.getByTestId("consent-banner")).toHaveCount(0);

  expect(await stored(page)).toMatchObject({
    gclid: "e2e-click-123",
    utm_source: "google",
    utm_campaign: "e2e",
  });

  // The parameters are gone from the URL by the time anybody pays, and the
  // payment is what has to carry them.
  await page.goto("/precios");
  expect(await stored(page)).toMatchObject({ gclid: "e2e-click-123" });
});

test("forgets it when the consent is withdrawn", async ({ page }) => {
  await page.goto(LANDING);
  await page
    .getByTestId("consent-banner")
    .getByRole("button", { name: "Aceptar" })
    .click();
  await expect(page.getByTestId("consent-banner")).toHaveCount(0);
  expect(await stored(page)).not.toBeNull();

  // "You can change your choice at any time" has to mean the record goes
  // too, not just the future tags.
  await page.getByRole("button", { name: "Cookies" }).click();
  await page
    .getByTestId("consent-banner")
    .getByRole("button", { name: "Rechazar" })
    .click();
  await expect(page.getByTestId("consent-banner")).toHaveCount(0);

  expect(await stored(page)).toBeNull();
});
