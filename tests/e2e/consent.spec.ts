import { expect, test } from "@playwright/test";

// The banner itself, which is the one part of the site that has to be
// seen by somebody who has answered nothing. Every other spec seeds an
// answer (see fixtures.ts); this one deliberately does not.

test("asks once, and makes refusing exactly as easy as accepting", async ({
  page,
}) => {
  await page.goto("/");
  const banner = page.getByTestId("consent-banner");
  await expect(banner).toBeVisible();

  // Same size, same row, one click each. A banner where refusing costs
  // more than consenting is the one that gets fined, and the consent it
  // collects is not consent.
  const accept = banner.getByRole("button", { name: "Aceptar" });
  const reject = banner.getByRole("button", { name: "Rechazar" });
  const [a, r] = [await accept.boundingBox(), await reject.boundingBox()];
  expect(a?.height).toBe(r?.height);
  expect(Math.abs((a?.y ?? 0) - (r?.y ?? 0))).toBeLessThan(2);

  // And it says where the detail is.
  await expect(
    banner.getByRole("link", { name: /Política de cookies/ }),
  ).toHaveAttribute("href", /\/legal\/cookies/);

  await reject.click();
  await expect(banner).toHaveCount(0);

  // Answered once, answered for good: it does not come back on the next
  // page, nor on the next visit.
  await page.goto("/precios");
  await expect(page.getByTestId("consent-banner")).toHaveCount(0);
});

test("lets the two purposes be answered apart", async ({ page }) => {
  await page.goto("/");
  const banner = page.getByTestId("consent-banner");
  await banner.getByRole("button", { name: "Elegir" }).click();

  // Analytics yes, advertising no, which is a thing the cookie policy
  // says can be said.
  await banner.getByRole("button", { name: "Analítica" }).click();
  await banner.getByRole("button", { name: "Guardar" }).click();
  await expect(banner).toHaveCount(0);

  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("vbx:consent") ?? "null"),
  );
  expect(stored).toMatchObject({ analytics: true, ads: false });
});

test("the footer keeps the promise the policy makes", async ({ page }) => {
  await page.goto("/");
  await page
    .getByTestId("consent-banner")
    .getByRole("button", { name: "Rechazar" })
    .click();
  await expect(page.getByTestId("consent-banner")).toHaveCount(0);

  // "You can change your choice at any time." This is the any time.
  await page.getByRole("button", { name: "Cookies" }).click();
  await expect(page.getByTestId("consent-banner")).toBeVisible();
});
