import { expect, test, type Page } from "@playwright/test";

import { typeInto } from "./helpers";

// Wall A — the paste is longer than the plan accepts.
//
// It needs no API key and no account: the notice is decided by the word
// count in the box, before anything is sent. What it has to prove is that
// the ceiling stops being a refusal. Until this change an over-long paste
// came back as a 413 and the visitor was left holding nothing, which is the
// commonest way somebody meets the limit for the first time.

const CEILING = 300;
const PASTED = 812;

/** A paste of exactly `PASTED` words, so both figures in the notice are checkable. */
const LONG_TEXT = Array.from(
  { length: PASTED },
  (_, i) => `palabra${i + 1}`,
).join(" ");

async function paste(page: Page, path: string, label: string) {
  await page.goto(path);
  return typeInto(page, label, LONG_TEXT);
}

test("names both figures and both paid ceilings, without interrupting", async ({
  page,
}) => {
  await paste(page, "/humanizador-de-texto-ia", "Texto de entrada");

  await expect(
    page.getByText(`Procesamos las primeras ${CEILING} palabras`),
  ).toBeVisible();
  // The size of the paste, so the reader can see what was left out rather
  // than guessing.
  await expect(page.getByText(`de las ${PASTED} que has pegado`)).toBeVisible();
  // Both paid ceilings, so they can tell which plan answers this text
  // without opening the pricing page. Spanish does not group four-digit
  // numbers, and these render the same way on the pricing page.
  await expect(page.getByText("Pro amplía el límite a 3000")).toBeVisible();
  await expect(page.getByText("Ilimitado, a 8000")).toBeVisible();

  // Amber is a ceiling, not an error, so nothing is blocked: the button
  // still runs and no modal has taken over the page. The wait is the
  // anti-bot check, which the button now waits for (C3), not the ceiling.
  await expect(page.getByRole("button", { name: "Humanizador" })).toBeEnabled({
    timeout: 15_000,
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("dims the overflow without hiding it from the textarea", async ({
  page,
}) => {
  const box = await paste(page, "/humanizador-de-texto-ia", "Texto de entrada");

  // The whole paste stays in the field. The dimming marks what will not be
  // processed; it must never silently delete the reader's words.
  await expect(box).toHaveValue(LONG_TEXT);
  await expect(page.getByText(`${PASTED} palabras`).first()).toBeVisible();
});

test("says the same thing in English", async ({ page }) => {
  await paste(page, "/en/ai-humanizer", "Text to process");

  await expect(
    page.getByText(`We process the first ${CEILING} words`),
  ).toBeVisible();
  await expect(page.getByText(`of the ${PASTED} you pasted`)).toBeVisible();
  await expect(page.getByRole("button", { name: "AI humanizer" })).toBeEnabled({
    timeout: 15_000,
  });
});

// Wall B — the allowance covered only part of what was asked for.
//
// Reaching it for real needs Redis, a spent quota and an API key, so the
// server's half is served here instead: a normal answer, short, with the
// headers that say how many words were paid for. What is under test is the
// browser half -- that the reader keeps the result they paid for, that the
// blur hides nothing because there is nothing to hide, and that closing
// the wall closes the wall and not the work.

const DONE =
  "Esta es la parte que sí se ha procesado, con las palabras que quedaban.";
/** Forty words pasted, of which the stubbed answer pays for twelve. */
const OVER_QUOTA_PASTE = "palabra ".repeat(40).trim();

/** The server answers with the 12 words it could afford of the 40 asked for. */
async function partialAnswer(page: Page) {
  await page.route("**/api/ai/humanize", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      headers: {
        "x-words-processed": "12",
        "x-words-limit": "300",
        "x-words-used": "300",
        "x-words-remaining": "0",
      },
      body: DONE,
    }),
  );
}

async function hitTheWall(page: Page) {
  await page.goto("/humanizador-de-texto-ia");
  await typeInto(page, "Texto de entrada", OVER_QUOTA_PASTE);
  await page.getByRole("button", { name: "Humanizador" }).click();
  return page.getByRole("dialog");
}

test("shows what was done and counts what was not", async ({ page }) => {
  await partialAnswer(page);
  const dialog = await hitTheWall(page);

  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("300 / 300 palabras de hoy")).toBeVisible();
  await expect(
    dialog.getByText("Hemos procesado las palabras que te quedaban"),
  ).toBeVisible();
  await expect(dialog.getByText(DONE)).toBeVisible();
  // 40 pasted, 12 paid for.
  await expect(
    dialog.getByText("Faltan 28 palabras de tu texto."),
  ).toBeVisible();
});

test("the blur hides filler, because there is nothing real to hide", async ({
  page,
}) => {
  // The withheld half used to be the real result: generated for a request
  // that had just been refused, sent to the browser and covered with a CSS
  // filter, so it read straight out of the inspector. Now the server never
  // writes those words, and what is blurred is shapes.
  await partialAnswer(page);
  const dialog = await hitTheWall(page);

  const blurred = dialog.locator("[aria-hidden='true'].blur-\\[4\\.5px\\]");
  await expect(blurred).toHaveAttribute("aria-hidden", "true");

  // Nothing in the dialog beyond what was actually processed comes from
  // the server: the whole body carries the answer once and no more.
  const html = await dialog.innerHTML();
  const occurrences = html.split(DONE).length - 1;
  expect(occurrences).toBe(1);
});

test("states the date and the amount before asking for a card", async ({
  page,
}) => {
  await partialAnswer(page);
  const dialog = await hitTheWall(page);

  // The disclosure is part of the wall, at reading size and in the flow.
  // It is the single thing that keeps this out of a chargeback.
  await expect(dialog.getByText(/Hoy no se te cobra nada/)).toBeVisible();
  // \s, because Intl puts a non-breaking space before the symbol.
  await expect(dialog.getByText(/29,99\s*US\$\/mes/)).toBeVisible();
  await expect(dialog.getByText(/dos clics/).first()).toBeVisible();
});

test("offers an anonymous reader the free account, not only the card", async ({
  page,
}) => {
  await partialAnswer(page);
  const dialog = await hitTheWall(page);

  await expect(
    dialog.getByRole("link", { name: /Crear cuenta gratis/ }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: /Probar Ilimitado 3 días gratis/ }),
  ).toBeVisible();
});

test("closing it keeps the result, and keeps offering the way out", async ({
  page,
}) => {
  // The one thing this wall must not do. Escape was the only way to close
  // it, and closing it deleted the words the reader had just waited for.
  await partialAnswer(page);
  const dialog = await hitTheWall(page);
  await expect(dialog).toBeVisible();

  await dialog.getByRole("button", { name: "Cerrar" }).click();
  await expect(dialog).toHaveCount(0);

  // The work survives, in the panel where it was.
  await expect(page.getByText(DONE)).toBeVisible();
  // And the offer survives too, in the flow rather than over it.
  await expect(page.getByText(/Faltan 28 palabras de tu texto/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Crear cuenta gratis/ }).first(),
  ).toBeVisible();
});

test("the exhausted banner offers an account, not only a price", async ({
  page,
}) => {
  // The second attempt used to end in a red banner whose only link was to
  // pricing -- offered to a reader whose next step costs nothing. Both
  // inline notices now carry the same way out, chosen by who is reading.
  await page.route("**/api/ai/humanize", (route) =>
    route.fulfill({
      status: 429,
      contentType: "application/json",
      headers: { "x-words-processed": "0" },
      body: JSON.stringify({
        error: "quota_exceeded",
        message: "Has agotado tus palabras de hoy.",
        used: 300,
        limit: 300,
      }),
    }),
  );

  await page.goto("/humanizador-de-texto-ia");
  await typeInto(page, "Texto de entrada", "Un texto cualquiera.");
  await page.getByRole("button", { name: "Humanizador" }).click();

  // Nothing was generated, so there is no wall to show -- only the notice.
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("Has agotado tu límite.")).toBeVisible();
  const account = page.getByRole("link", { name: /Crear cuenta gratis/ });
  await expect(account.first()).toBeVisible();
});

test("closes on Escape, on a click outside, and stays closed", async ({
  page,
}) => {
  await partialAnswer(page);
  const dialog = await hitTheWall(page);
  await expect(dialog).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);

  // Dismissed once is dismissed for the session: a wall that reappears
  // after the reader closed it stops being an offer. The second run still
  // says what happened, in line.
  await page.getByRole("button", { name: "Humanizador" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText(/Faltan 28 palabras de tu texto/)).toBeVisible();
});

// Wall C — a paid tool opened by somebody who cannot run it.

test("names what is still free before it names the price", async ({ page }) => {
  await page.goto("/parafrasear-texto");

  // Not on arrival: these pages are the SEO asset and a modal over content
  // reached from a search result is an intrusive interstitial.
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await typeInto(page, "Texto de entrada", "Un texto cualquiera.");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await expect(dialog.getByText("Plan de pago")).toBeVisible();
  await expect(
    dialog.getByText("El parafraseador está en los planes de pago"),
  ).toBeVisible();
  // The line that keeps this an offer instead of a shut door.
  await expect(
    dialog.getByText(/El humanizador y el detector siguen siendo gratis/),
  ).toBeVisible();
  // A CTA that starts a trial carries the disclosure, wherever it appears.
  await expect(dialog.getByText(/Hoy no se te cobra nada/)).toBeVisible();
});

test("leaves the tool page usable after the tool wall is closed", async ({
  page,
}) => {
  await page.goto("/parafrasear-texto");
  await typeInto(page, "Texto de entrada", "Un texto cualquiera.");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // Dismissing must not leave a blank page: the landing copy and the editor
  // are still there, and the button still says why it cannot run.
  await expect(page.getByLabel("Texto de entrada")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Requiere un plan de pago" }),
  ).toBeVisible();

  // Same session, same trigger: it does not come back.
  await page.reload();
  await typeInto(page, "Texto de entrada", "Otro texto cualquiera.");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

// Wall D — a locked feature, answered where it sits.

test("answers the locked breakdown in place, with no charge behind it", async ({
  page,
}) => {
  await page.route("**/api/ai/detect", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        version: "2.0.0",
        phase: 1,
        locale: "es",
        words: 240,
        sentenceCount: 12,
        paragraphCount: 3,
        band: "verde",
        score: 12,
        reliable: true,
        signals: [],
        windows: [],
      }),
    }),
  );

  await page.goto("/detector-de-ia");
  await typeInto(page, "Texto de entrada", "Un texto cualquiera.");
  await page.getByRole("button", { name: "Detector de IA" }).click();

  const lock = page.getByRole("button", {
    name: "Ver el desglose por pasajes",
  });
  await expect(lock).toBeVisible();
  await lock.click();

  const popover = page.getByRole("dialog");
  await expect(popover).toBeVisible();
  await expect(
    popover.getByText(
      "El desglose por pasajes está disponible en los planes de pago.",
    ),
  ).toBeVisible();
  await expect(
    popover.getByRole("link", { name: "Desbloquear con Pro" }),
  ).toBeVisible();

  // The lightest wall in the set: its only action goes to pricing and
  // starts no charge, so it carries no disclosure.
  await expect(popover.getByText(/Hoy no se te cobra nada/)).toHaveCount(0);

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

// C6 — one allowance, one number.
//
// There were three counters and they disagreed in public: the header read
// a server render that never refreshed, the wall read the last response,
// and the account page summed a different table. What this holds is that
// the editor's figure comes from the response and moves without a reload.

test("the words left come from the response, and move without a reload", async ({
  page,
}) => {
  await page.route("**/api/usage", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        used: 0,
        limit: 300,
        remaining: 300,
        metered: true,
        timezone: "Europe/Madrid",
      }),
    }),
  );
  await page.route("**/api/ai/humanize", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      headers: {
        "x-words-processed": "4",
        "x-words-limit": "300",
        "x-words-used": "4",
        "x-words-remaining": "296",
      },
      body: "Un resultado corriente.",
    }),
  );

  await page.goto("/humanizador-de-texto-ia");
  await typeInto(page, "Texto de entrada", "cuatro palabras de prueba");

  // Known before the button is pressed, not after the words are spent.
  await expect(page.getByTestId("word-count")).toContainText("te quedan 300");

  await page
    .getByRole("button", { name: "Humanizador" })
    .click({ timeout: 20_000 });
  await expect(page.getByText("Un resultado corriente.")).toBeVisible();

  // The response said 296, and the page says 296 -- no navigation between.
  await expect(page.getByTestId("word-count")).toContainText("te quedan 296");
});
