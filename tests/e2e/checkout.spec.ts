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
  await page.getByRole("link", { name: /Probar 3 días gratis/ }).click();
  await page.waitForURL(/\/login/);
  await expect(page.getByText("Inicia sesión")).toBeVisible();
});

test("trial checkout with a test card, without leaving the site", async ({
  page,
}) => {
  test.skip(
    !process.env.STRIPE_SECRET_KEY || !process.env.E2E_STORAGE_STATE,
    "Needs Stripe test keys and a signed-in storage state",
  );

  await page.goto("/precios");
  await page.getByRole("link", { name: /Probar 3 días gratis/ }).click();
  await page.waitForURL(/\/pago/);

  // The card field is Stripe's iframe, on our page. The host never sees the
  // number, and the customer never sees another domain.
  const card = page
    .frameLocator(
      'iframe[title*="payment"], iframe[name^="__privateStripeFrame"]',
    )
    .first();
  await card.getByPlaceholder("1234 1234 1234 1234").fill("4242424242424242");
  await card.getByPlaceholder("MM / AA").fill("12/34");
  await card.getByPlaceholder("CVC").fill("123");

  // The button stays disabled until the auto-renewal box is ticked.
  const pay = page.getByRole("button", { name: /Empezar la prueba/ });
  await expect(pay).toBeDisabled();
  await page.getByRole("checkbox").check();
  await pay.click();

  // The confirmation happens here, with the date of the first charge as the
  // largest thing on it. Nothing was charged.
  await expect(page.getByText("Prueba activa")).toBeVisible({
    timeout: 60_000,
  });
  await expect(page.getByText("Primer cobro")).toBeVisible();
  await expect(page.getByText("Hoy has pagado")).toBeVisible();
});

test("the home page offers the tool, and the upsell waits until it is earned", async ({
  page,
}) => {
  // The editor is the home page: no click between landing and first use.
  await page.goto("/");
  const box = page.getByLabel("Texto de entrada");
  await expect(box).toBeVisible();

  // Nothing is sold before anything is asked for. A standing banner under
  // an empty editor was the old funnel and it converted nobody: always
  // there, therefore never read.
  await expect(page.getByText("Ver planes")).toHaveCount(0);

  // It appears the moment the limit costs the visitor something -- here,
  // a paste past the per-request ceiling -- and that is the way to pricing.
  await box.fill(
    Array.from({ length: 400 }, (_, i) => `palabra${i}`).join(" "),
  );
  await expect(page.getByText(/Procesamos las primeras/)).toBeVisible();
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

test("the marketing header resolves the session instead of assuming", async ({
  page,
}) => {
  // The marketing pages are statically prerendered, so the header used to be
  // hardcoded and told signed-in visitors to create an account — on /precios,
  // where that costs money. It now resolves in the browser.
  await page.goto("/precios");
  const header = page.locator("header");

  // Signed out: the sign-in calls to action, and no account link.
  await expect(header.getByRole("link", { name: "Entrar" })).toBeVisible();
  await expect(
    header.getByRole("link", { name: "Crear cuenta gratis" }),
  ).toBeVisible();
  await expect(header.getByRole("link", { name: "Mi cuenta" })).toHaveCount(0);
});

test("a Stripe configuration refusal names itself instead of reading as an outage", async ({
  page,
}) => {
  // Stripe refusing a setting we never turned on is our problem and there
  // is nothing to retry, so the customer must not be told to come back in
  // a few minutes. The reference is how we learn which setting it was.
  await page.route("**/api/stripe/checkout", (route) =>
    route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({ error: "tax_not_configured" }),
    }),
  );

  // The top-up is the one thing still bought through a hosted session: it
  // is a single payment, not a subscription, so it never went through the
  // embedded flow.
  await page.goto("/precios");
  await page.getByRole("button", { name: "Comprar recarga" }).click();

  const error = page.getByText(/ref: tax_not_configured/);
  await expect(error).toBeVisible();
  await expect(error).toContainText("configuración nuestro");
  await expect(error).not.toContainText("Vuelve a intentarlo");
});

test("the history is behind a session and announces its plan gate", async ({
  page,
}) => {
  // The history holds user text, so the route must not be reachable without
  // a session. What a free account sees once signed in is the upsell, which
  // needs credentials and is covered by the gated test above.
  await page.goto("/app/historial");
  await page.waitForURL(/\/login/);
  await expect(page.getByText("Inicia sesión")).toBeVisible();
});

// Phase 3 — payment moved inside the site. These cover the parts that do
// not need a Stripe test account: where the buttons lead, and who is
// allowed through. Confirming a card is exercised by the gated test above.

test("the pricing plans lead to the embedded checkout, not off-site", async ({
  page,
}) => {
  await page.goto("/precios");

  for (const [name, query] of [
    ["Probar 3 días gratis", "plan=unlimited&cycle=monthly"],
    ["Ilimitado anual", "plan=unlimited&cycle=yearly"],
    ["Elegir Pro anual", "plan=pro&cycle=yearly"],
    ["Pro mensual", "plan=pro&cycle=monthly"],
  ] as const) {
    const link = page.getByRole("link", { name, exact: true });
    await expect(link).toBeVisible();
    // Same origin, and carrying the plan it was pressed on: the cycle is
    // decided here and must not be re-opened at the card field.
    const href = await link.getAttribute("href");
    expect(href).toContain("/pago");
    for (const part of query.split("&")) expect(href).toContain(part);
  }
});

test("checkout refuses to load without an account to bill", async ({
  page,
}) => {
  // Nobody can be charged without somewhere to attach the subscription, so
  // the page sends them to sign in rather than rendering a card field that
  // would fail on submit.
  await page.goto("/pago?plan=unlimited&cycle=monthly");
  await page.waitForURL(/\/login/);
  await expect(page.getByText("Inicia sesión")).toBeVisible();
});

test("the paywall sends a signed-out reader to sign in, not to a card", async ({
  page,
}) => {
  await page.route("**/api/ai/humanize", (route) =>
    route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({
        error: "quota_exceeded",
        message: "Has agotado tus palabras de hoy.",
        partialResult:
          "Un resultado cualquiera, lo bastante largo para partirlo.",
        visibleChars: 20,
        usedToday: 300,
        limitToday: 300,
      }),
    }),
  );

  await page.goto("/humanizador-de-texto-ia");
  await page.getByLabel("Texto de entrada").fill("Un texto cualquiera.");
  await page.getByRole("button", { name: "Humanizador" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole("button", { name: /Probar Ilimitado 3 días gratis/ })
    .click();
  await page.waitForURL(/\/login/);
});
