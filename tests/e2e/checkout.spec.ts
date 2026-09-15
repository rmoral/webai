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

test("the home page offers the tool and routes the upsell to pricing", async ({
  page,
}) => {
  // The editor is the home page: no click between landing and first use.
  await page.goto("/");
  await expect(page.getByLabel("Texto de entrada")).toBeVisible();

  // Anonymous visitors are not on a paid plan, so the upsell is present and
  // is the entry point to the funnel.
  const upsell = page.getByText("¿Textos más largos?");
  await expect(upsell).toBeVisible();
  await page.getByRole("link", { name: "Ver planes" }).first().click();
  await page.waitForURL(/\/precios/);
  await expect(page.getByRole("heading", { name: "Precios" })).toBeVisible();
});

test("footer tool links resolve instead of 404ing", async ({ page }) => {
  // The footer groups are SEO infrastructure: a dead link there costs more
  // than a missing one.
  await page.goto("/precios");
  const detector = page.getByRole("link", { name: "Detector de IA" }).last();
  await expect(detector).toBeVisible();
  await detector.click();
  await page.waitForURL(/\/detector-de-ia/);
  await expect(
    page.getByRole("heading", { name: "Detector de IA en español" }),
  ).toBeVisible();
});

test("the legal pages identify the operating company and its jurisdiction", async ({
  page,
}) => {
  // Stripe review and US auto-renewal laws both look for these: who is
  // charging, under which law, and how to cancel.
  await page.goto("/legal/aviso-legal");
  await expect(page.getByText("YBB SOLUTIONS, LLC").first()).toBeVisible();
  await expect(page.getByText(/Orlando, Florida/).first()).toBeVisible();

  await page.goto("/legal/terminos");
  await expect(
    page.getByRole("heading", { name: "Ley aplicable y jurisdicción" }),
  ).toBeVisible();
  await expect(page.getByText(/leyes del estado de Florida/)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Cancelación" }),
  ).toBeVisible();
  await expect(page.getByText(/sin llamar por teléfono/)).toBeVisible();

  // EU consumers are the target market, so their mandatory rights survive.
  await expect(
    page.getByRole("heading", { name: /Consumidores en la UE/ }),
  ).toBeVisible();
});
