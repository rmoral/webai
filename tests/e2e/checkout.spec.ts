import { expect, test } from "@playwright/test";

// Payment funnel. The steps that need a real Stripe test-mode account are
// gated on credentials; everything before the hand-off to Stripe runs in CI.

test("pricing page shows the three plans and the top-up", async ({ page }) => {
  await page.goto("/precios");
  await expect(page.getByRole("heading", { name: "Precios" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gratis" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pro" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Ilimitado/ })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Recarga de palabras" }),
  ).toBeVisible();
});

test("the trial discloses charge date and amount before payment", async ({
  page,
}) => {
  // Required by ROSCA and the state auto-renewal laws (study §6.1).
  await page.goto("/precios");
  const disclosure = page.getByTestId("trial-disclosure");
  await expect(disclosure).toBeVisible();
  await expect(disclosure).toContainText("Hoy no se te cobra nada");
  await expect(disclosure).toContainText("29,99");
  await expect(disclosure).toContainText("cancelar");
});

test("checkout without a session sends the visitor to login", async ({
  page,
}) => {
  await page.goto("/precios");
  await page.getByRole("button", { name: /Probar 3 días gratis/ }).click();
  await page.waitForURL(/\/login/);
  await expect(page.getByText("Inicia sesión")).toBeVisible();
});

test("trial checkout through Stripe with a test card", async ({ page }) => {
  test.skip(
    !process.env.STRIPE_SECRET_KEY || !process.env.E2E_STORAGE_STATE,
    "Needs Stripe test keys and a signed-in storage state",
  );

  await page.goto("/precios");
  await page.getByRole("button", { name: /Probar 3 días gratis/ }).click();

  // Stripe-hosted Checkout.
  await page.waitForURL(/checkout\.stripe\.com/);
  await page.getByPlaceholder("1234 1234 1234 1234").fill("4242424242424242");
  await page.getByPlaceholder("MM / AA").fill("12/34");
  await page.getByPlaceholder("CVC").fill("123");
  await page.getByTestId("hosted-payment-submit-button").click();

  // Back on the app; the webhook promotes the account to Ilimitado.
  await page.waitForURL(/\/app\?checkout=success/, { timeout: 60_000 });
  await expect(page.getByText(/Ilimitado/)).toBeVisible({ timeout: 30_000 });
});
