import { type Page } from "@playwright/test";

import { expect, test } from "./fixtures";

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
    page.getByRole("heading", { name: /Crea tu cuenta gratis/ }),
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

  // The way out of the editor carries where it came from, which is both
  // how the reader gets back and how the page knows the line is true.
  await page.goto("/registro?next=%2Fhumanizador-de-texto-ia");
  await expect(page.getByText(/Tu texto sigue en el editor/)).toBeVisible();

  await page.goto("/humanizador-de-texto-ia");
  await expect(page.getByLabel("Texto de entrada")).toHaveValue(draft);
});

// The pricing card: one price, and a disclosure that agrees with it.

async function unlimitedCard(page: Page, query = "") {
  await page.goto(`/precios${query}`);
  return page.locator("section").filter({ hasText: "Ilimitado" }).first();
}

test("the cycle toggle moves the headline price, not a footnote", async ({
  page,
}) => {
  const card = await unlimitedCard(page);

  // Yearly is the default: the big number is the monthly equivalent and
  // the amount actually charged sits under it. The headline is asserted by
  // test id rather than by text, because the same figure also appears in
  // the billing line and the disclosure -- which is the point.
  await expect(card.getByTestId("plan-price")).toContainText(/14,99/);
  await expect(card.getByTestId("plan-total")).toContainText(/179,88/);

  await page.getByRole("radio", { name: "Mensual" }).click();

  // Monthly: one number, 29,99, and no yearly total. The row stays, empty,
  // so the cards do not jump under the cursor that is changing the cycle.
  await expect(card.getByTestId("plan-price")).toContainText(/29,99/);
  await expect(card.getByTestId("plan-total")).toHaveText("");
});

test("the page opens on the cycle the link asked for", async ({ page }) => {
  // The walls offer the monthly trial, so they link to that cycle by name
  // rather than dropping the reader on the yearly one.
  const card = await unlimitedCard(page, "?cycle=monthly");
  await expect(card.getByTestId("plan-price")).toContainText(/29,99/);
  await expect(
    card.getByRole("link", { name: "Probar 3 días gratis" }),
  ).toBeVisible();
});

test("the trial is offered on both cycles of Ilimitado", async ({ page }) => {
  const card = await unlimitedCard(page);

  // Yearly (F1-01): the same trial, and a note naming the whole year as
  // what it ends in. The box explaining why there was no trial is gone.
  await expect(
    card.getByRole("link", { name: "Probar 3 días gratis" }),
  ).toHaveAttribute("href", /cycle=yearly/);
  await expect(card.getByTestId("trial-disclosure")).toHaveCount(0);
  await expect(card.getByTestId("trial-note")).toContainText("179,88");

  await page.getByRole("radio", { name: "Mensual" }).click();

  await expect(
    card.getByRole("link", { name: "Probar 3 días gratis" }),
  ).toHaveAttribute("href", /cycle=monthly/);
  const monthlyNote = card.getByTestId("trial-note");
  await expect(monthlyNote).toContainText("Hoy $0,00");
  await expect(monthlyNote).toContainText("29,99, y después cada mes");
});

test("the trial is announced above the cards, on both cycles", async ({
  page,
}) => {
  await page.goto("/precios");
  const band = page.getByText(/Prueba Ilimitado 3 días gratis/);
  await expect(band).toBeVisible();
  await page.getByRole("radio", { name: "Mensual" }).click();
  await expect(band).toBeVisible();
  // C9's lines about the trial living on the monthly cycle are gone.
  await expect(page.getByText(/Prefieres probar antes/)).toHaveCount(0);
});

test("on a desktop: Gratis · Ilimitado · Pro, buttons on one line", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/precios");
  const cards = ["Gratis", "Ilimitado", "Pro"].map((name) =>
    page.getByRole("region", { name, exact: true }),
  );
  const boxes = await Promise.all(cards.map((card) => card.boundingBox()));
  expect(boxes[0]!.x).toBeLessThan(boxes[1]!.x);
  expect(boxes[1]!.x).toBeLessThan(boxes[2]!.x);

  // Filled, outlined, text: one recommendation, and all three at the same
  // height, 48 tall.
  const buttons = await Promise.all([
    cards[0].getByRole("link", { name: "Crear cuenta gratis" }).boundingBox(),
    cards[1].getByRole("link", { name: "Probar 3 días gratis" }).boundingBox(),
    cards[2].getByRole("link", { name: "Elegir Pro anual" }).boundingBox(),
  ]);
  for (const button of buttons) {
    expect(button!.height).toBe(48);
    expect(Math.abs(button!.y - buttons[1]!.y)).toBeLessThan(1);
  }
});

test("on a phone the comparison is one plan at a time, Ilimitado open", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/precios");
  // Ilimitado first in the stack, and open.
  const first = page.getByRole("region").first();
  await expect(first).toHaveAttribute("aria-label", "Ilimitado");
  const open = page.locator("details[open] summary");
  await expect(open).toHaveCount(1);
  await expect(open).toContainText("Ilimitado");
  await expect(page.getByRole("table")).toBeHidden();
});

test("one badge, and one filled button, on the whole page", async ({
  page,
}) => {
  // Three equally loud calls to action are three ways to ask the reader to
  // decide for us. The recommendation is named once and filled once, on
  // both cycles.
  for (const query of ["", "?cycle=monthly"]) {
    const card = await unlimitedCard(page, query);
    await expect(card.getByText("Más popular")).toBeVisible();
    await expect(page.getByText("Más popular")).toHaveCount(1);
    await expect(page.getByText("Prueba 3 días")).toHaveCount(0);
  }
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
  // Two new questions after "¿Cómo cancelo?", and the first one corrected
  // for the yearly trial.
  const questions = page.getByRole("term");
  await expect(questions).toHaveText([
    "¿Cuándo se me cobra?",
    "¿Cómo cancelo?",
    "¿Qué pasa cuando llego al límite diario?",
    "¿Puedo cambiar de plan?",
    "¿Qué pasa cuando termina la prueba?",
    "¿Las palabras caducan?",
    "¿Los precios llevan impuestos?",
    "¿Hacéis reembolsos?",
  ]);
  await expect(page.getByRole("definition").first()).toContainText(
    "En Ilimitado, mensual o anual, al terminar los 3 días",
  );
});

test("the confirmation page is behind a session", async ({ page }) => {
  // It reads the subscription row rather than the query string, so it
  // cannot be shown to somebody who has not paid.
  await page.goto("/pago/listo");
  await page.waitForURL(/\/login/);
});
