import { expect, test, type Page } from "@playwright/test";

import { typeInto } from "./helpers";

// Phase 4 — the screens the funnel runs through.
//
// Two of the five problems in the design brief live here: the pricing card
// that showed one price and disclosed another, and a sign-up page that gave
// nobody a reason to create an account.

test("sign-up is its own page, and says what you get", async ({ page }) => {
  await page.goto("/registro");

  // The title carries the benefit, not the action. "Sign in" tells someone
  // who just pressed "create a free account" nothing about where they are.
  await expect(
    page.getByRole("heading", { name: /Tu cuenta gratis/ }),
  ).toBeVisible();
  await expect(page.getByText("Sin contraseña y sin tarjeta")).toBeVisible();
  await expect(page.getByText(/De 300 a 500 palabras al día/)).toBeVisible();

  // No passwords, no name, no "what will you use it for": every field here
  // costs conversion and none of them does any work.
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await expect(page.locator("input")).toHaveCount(1);

  await expect(
    page.getByRole("link", { name: /¿Ya tienes cuenta\?/ }),
  ).toBeVisible();
});

test("signing in is a different page, cross-linked both ways", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Vuelve a tu cuenta" }),
  ).toBeVisible();

  // No benefits block here: somebody signing in already decided.
  await expect(page.getByText(/De 300 a 500 palabras al día/)).toHaveCount(0);

  await page.getByRole("link", { name: /¿Aún no tienes cuenta\?/ }).click();
  await page.waitForURL(/\/registro/);
});

test("every route into sign-up lands on sign-up", async ({ page }) => {
  // The footer and the free plan's button both said "create a free account"
  // and both went to /login.
  await page.goto("/precios");
  const fromPricing = page
    .getByRole("link", { name: "Crear cuenta gratis" })
    .first();
  await expect(fromPricing).toHaveAttribute("href", /\/registro/);
});

test("the editor keeps the text across a trip to sign-up", async ({ page }) => {
  // The most avoidable leak in the funnel: the paywall sends somebody to
  // create an account and the text they came to rewrite is gone.
  const draft = "Un borrador que no se debe perder al registrarse.";
  await page.goto("/humanizador-de-texto-ia");
  await typeInto(page, "Texto de entrada", draft);

  await page.goto("/registro");
  await expect(page.getByText(/Tu texto sigue en el editor/)).toBeVisible();

  await page.goto("/humanizador-de-texto-ia");
  await expect(page.getByLabel("Texto de entrada")).toHaveValue(draft);
});

// The pricing card: one price, and a disclosure that agrees with it.

async function unlimitedCard(page: Page) {
  await page.goto("/precios");
  return page.locator("section").filter({ hasText: "Ilimitado" }).first();
}

test("the cycle toggle moves the headline price, not a footnote", async ({
  page,
}) => {
  const card = await unlimitedCard(page);

  // Monthly is the default: one number, 29,99, and no yearly total beside
  // it. The headline is asserted by test id rather than by text, because
  // the same figure also appears in the billing line and the disclosure --
  // which is the point.
  await expect(card.getByTestId("plan-price")).toContainText(/29,99/);
  await expect(card.getByTestId("plan-total")).toHaveCount(0);

  await page.getByRole("radio", { name: "Anual" }).click();

  // Yearly: the big number becomes the monthly equivalent and the amount
  // actually charged appears under it. One price per card either way; two
  // competing prices is what this page used to show.
  await expect(card.getByTestId("plan-price")).toContainText(/14,99/);
  await expect(card.getByTestId("plan-total")).toContainText(/179,88/);
});

test("the trial is offered on the monthly cycle and nowhere else", async ({
  page,
}) => {
  const card = await unlimitedCard(page);

  // Monthly: badge, trial button, and a disclosure naming the same figure
  // the button will eventually charge.
  await expect(card.getByText("Prueba 3 días")).toBeVisible();
  await expect(
    card.getByRole("link", { name: "Probar 3 días gratis" }),
  ).toBeVisible();
  const monthlyNote = card.getByTestId("trial-disclosure");
  await expect(monthlyNote).toContainText("Hoy no se te cobra nada");
  await expect(monthlyNote).toContainText("29,99");

  await page.getByRole("radio", { name: "Anual" }).click();

  // Yearly: no badge, no trial, and a disclosure that says why rather than
  // staying quiet about it.
  await expect(card.getByText("Prueba 3 días")).toHaveCount(0);
  await expect(
    card.getByRole("link", { name: "Elegir Ilimitado anual" }),
  ).toBeVisible();
  const yearlyNote = card.getByTestId("trial-disclosure");
  await expect(yearlyNote).toContainText("No lleva prueba gratuita");
  await expect(yearlyNote).toContainText("179,88");
});

test("promises two clicks to cancel above the table, not after it", async ({
  page,
}) => {
  await page.goto("/precios");
  await expect(page.getByText(/Cancela online en dos clics/)).toBeVisible();

  // The comparison table and the billing FAQ, with no figure typed by hand:
  // every cell comes from the plan catalogue.
  await expect(
    page.getByRole("heading", { name: "Qué incluye cada plan" }),
  ).toBeVisible();
  await expect(
    page.getByRole("rowheader", { name: "Palabras al día" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Preguntas sobre la facturación" }),
  ).toBeVisible();
  await expect(page.getByText("¿Cuándo se me cobra?")).toBeVisible();
  await expect(page.getByText("¿Cómo cancelo?")).toBeVisible();
});

test("the confirmation page is behind a session", async ({ page }) => {
  // It reads the subscription row rather than the query string, so it
  // cannot be shown to somebody who has not paid.
  await page.goto("/pago/listo");
  await page.waitForURL(/\/login/);
});
