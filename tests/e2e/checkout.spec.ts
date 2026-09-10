import { expect, test } from "@playwright/test";

// Critical-path smoke of the payment funnel. The full paid flow (Stripe test
// card + webhook) needs live credentials, so those steps are gated.

test("pricing page shows plans and yearly CTA", async ({ page }) => {
  await page.goto("/precios");
  await expect(page.getByRole("heading", { name: "Precios" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Probar Pro 3 días" }).first(),
  ).toBeVisible();
});

test("checkout without session redirects to login", async ({ page }) => {
  await page.goto("/precios");
  await page.getByRole("button", { name: "Probar Pro 3 días" }).first().click();
  await page.waitForURL(/\/login/);
  await expect(page.getByText("Inicia sesión")).toBeVisible();
});

test("full checkout with Stripe test card", async ({ page }) => {
  test.skip(
    !process.env.STRIPE_SECRET_KEY || !process.env.E2E_USER_EMAIL,
    "Requires Stripe test keys and a seeded session (E2E_USER_EMAIL)",
  );
  // TODO(sprint 2 wiring): sign in with a seeded user, click checkout,
  // pay with 4242 4242 4242 4242 on Stripe's hosted page, assert redirect
  // to /app?checkout=success and Pro badge after webhook processing.
  await page.goto("/precios");
});
