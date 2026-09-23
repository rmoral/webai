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
    page.getByText(`Procesaremos las primeras ${CEILING} palabras`),
  ).toBeVisible();
  // The size of the paste, so the reader can see what was left out rather
  // than guessing, and the promise that it is still theirs.
  await expect(page.getByText(`de las ${PASTED} que has pegado`)).toBeVisible();
  await expect(
    page.getByText(/El resto queda atenuado y sigue en el editor/),
  ).toBeVisible();
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

  // The way out of a per-request ceiling is a bigger plan, and only that:
  // a free account stops at the same number of words per run, so offering
  // one here would be offering something that changes nothing.
  const strip = page.getByTestId("limit-notice");
  await expect(strip).toHaveAttribute("data-kind", "overflow");
  await expect(strip.getByRole("link", { name: "Ver planes" })).toBeVisible();
  await expect(
    strip.getByRole("link", { name: /Crear cuenta gratis/ }),
  ).toHaveCount(0);

  // And the cost of pressing it, before it is pressed.
  await expect(page.getByTestId("run-cost")).toContainText(
    `${PASTED} palabras`,
  );
  await expect(page.getByTestId("run-cost")).toContainText(
    `se procesarán ${CEILING}`,
  );
  // The counter names the cut rather than only the total.
  await expect(page.getByTestId("word-count")).toContainText(
    `máx. ${CEILING} en esta petición`,
  );
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
    page.getByText(`We will process the first ${CEILING} words`),
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

test("a spent allowance is answered by the strip, not by a red banner", async ({
  page,
}) => {
  // The limit is not an error. A 429 sets the balance to zero, which
  // raises the same amber strip the reader would have seen before
  // pressing -- and it carries the way out that costs them least.
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

  // Nothing was generated, so there is no wall to show -- only the strip.
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const strip = page.getByTestId("limit-notice");
  await expect(strip).toHaveAttribute("data-kind", "exhausted");
  await expect(strip).toContainText("Has usado tus 300 palabras de hoy.");
  await expect(strip).toContainText("Tu texto se queda aquí, tal cual.");
  await expect(
    strip.getByRole("link", { name: /Crear cuenta gratis/ }),
  ).toBeVisible();

  // And the run button stops offering a click that ends in a refusal.
  await expect(
    page.getByRole("button", { name: "Sin palabras hoy" }),
  ).toBeDisabled();
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
  // after the reader closed it stops being an offer. What is left in the
  // flow says what happened.
  await expect(page.getByText(/Faltan 28 palabras de tu texto/)).toBeVisible();

  // And there is no second run to make: the answer left the balance at
  // zero, so the button says so instead of offering a click that ends in
  // a refusal.
  await expect(page.getByTestId("run")).toBeDisabled();
  await expect(page.getByTestId("run")).toHaveText("Sin palabras hoy");
  await expect(page.getByTestId("limit-notice")).toHaveAttribute(
    "data-kind",
    "exhausted",
  );
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
  await expect(page.getByTestId("run-cost")).toContainText("te quedan 300 hoy");

  await page
    .getByRole("button", { name: "Humanizador" })
    .click({ timeout: 20_000 });
  await expect(page.getByText("Un resultado corriente.")).toBeVisible();

  // The response said 296, and the page says 296 -- no navigation between.
  await expect(page.getByTestId("run-cost")).toContainText("te quedan 296 hoy");
});

test("the locked tool button keeps answering after the wall is closed", async ({
  page,
}) => {
  // C11. The modal shows once per tool per session; after that the button
  // whose only job was to open it did nothing at all -- a dead control on
  // the one screen where the reader is asking to buy.
  await page.goto("/parafrasear-texto");
  await typeInto(page, "Texto de entrada", "Un texto cualquiera.");

  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(modal).toHaveCount(0);

  // Pressed again, it answers with the compact form instead of nothing.
  await page.getByRole("button", { name: "Requiere un plan de pago" }).click();
  const popover = page.getByRole("dialog");
  await expect(popover).toBeVisible();
  await expect(
    popover.getByText("El parafraseador está en los planes de pago"),
  ).toBeVisible();

  // And it is still an offer, with a way out of it.
  await expect(
    popover.getByRole("button", { name: /Probar Ilimitado 3 días gratis/ }),
  ).toBeVisible();
  await popover.getByRole("button", { name: "Cerrar" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

// D3 · the states the reader meets before pressing anything.
//
// One strip at a time, and the one that binds. The balance is served from
// /api/usage, which is what the editor asks once there are words in the
// box: reaching these for real would need Redis and a spent quota.

/** Answers /api/usage with a balance, as the server would. */
async function balance(page: Page, remaining: number, limit = 300) {
  await page.route("**/api/usage", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        used: limit - remaining,
        limit,
        remaining,
        metered: true,
        timezone: "Europe/Madrid",
      }),
    }),
  );
}

test("with a partial balance it promises what it can do, and no more", async ({
  page,
}) => {
  // The example from the brief: 923 pasted, 200 left.
  await balance(page, 200);
  await page.goto("/humanizador-de-texto-ia");
  await typeInto(page, "Texto de entrada", LONG_TEXT);

  const strip = page.getByTestId("limit-notice");
  await expect(strip).toHaveAttribute("data-kind", "partial");
  await expect(strip).toContainText("Te quedan 200 palabras hoy.");
  await expect(strip).toContainText(
    `Procesaremos las primeras 200 de las ${PASTED}`,
  );
  // The binding limit is named, and only that one: the per-request
  // ceiling of 300 is not what stops this run.
  await expect(strip).not.toContainText("Procesaremos las primeras 300");

  await expect(page.getByTestId("run-cost")).toContainText("se procesarán 200");
  await expect(page.getByTestId("run-cost")).toContainText("te quedan 200");

  // The text is untouched, before and after.
  await expect(page.getByLabel("Texto de entrada")).toHaveValue(LONG_TEXT);
});

test("the detector refuses a partial run instead of scoring a fragment", async ({
  page,
}) => {
  // A score over part of a text is a wrong answer about the whole of it,
  // so the button does not offer a run that would produce one.
  await balance(page, 200);
  await page.goto("/detector-de-ia");
  await typeInto(
    page,
    "Texto de entrada",
    Array.from({ length: 280 }, (_, i) => `palabra${i + 1}`).join(" "),
  );

  const strip = page.getByTestId("limit-notice");
  await expect(strip).toHaveAttribute("data-kind", "detector");
  await expect(strip).toContainText("El detector necesita el texto entero.");
  await expect(strip).toContainText("daría un resultado equivocado");

  await expect(page.getByTestId("run")).toBeDisabled();
  await expect(page.getByTestId("run-cost")).toContainText("necesita 280");
  await expect(page.getByTestId("run-cost")).toContainText("te quedan 200");
});

test("the detector says so when the text is longer than one request", async ({
  page,
}) => {
  // Above the per-request ceiling the server refuses too (413), rather
  // than silently scoring the first 300 words of 812.
  await balance(page, 300);
  await page.goto("/detector-de-ia");
  await typeInto(page, "Texto de entrada", LONG_TEXT);

  const strip = page.getByTestId("limit-notice");
  await expect(strip).toHaveAttribute("data-kind", "detectorTooLong");
  await expect(strip).toContainText(`Tiene ${PASTED} palabras`);
  await expect(strip).toContainText(`tu plan analiza hasta ${CEILING}`);
  await expect(page.getByTestId("run")).toBeDisabled();
});

test("nothing is dimmed when nothing will be processed", async ({ page }) => {
  await balance(page, 0);
  await page.goto("/humanizador-de-texto-ia");
  await typeInto(page, "Texto de entrada", LONG_TEXT);

  const strip = page.getByTestId("limit-notice");
  await expect(strip).toHaveAttribute("data-kind", "exhausted");
  // The whole text is legible: dimming marks a cut, and there is no cut.
  await expect(page.getByLabel("Texto de entrada")).toHaveValue(LONG_TEXT);
  await expect(page.getByTestId("run-cost")).toContainText(
    "no te quedan palabras hoy",
  );
});

test("the paid tools say so in the tab strip, before the wall does", async ({
  page,
}) => {
  // C11. Wall C opened on the first attempt to use one of these, with
  // nothing beforehand to suggest it was coming: the reader picked a tool,
  // wrote, pressed, and only then found out it was not theirs.
  await page.goto("/humanizador-de-texto-ia");
  const tabs = page.getByRole("tablist");

  const paraphrase = tabs.getByRole("tab", { name: /Parafraseador/ });
  await expect(paraphrase).toContainText("Pro");
  await expect(tabs.getByRole("tab", { name: /Corrector/ })).toContainText(
    "Pro",
  );

  // And nothing on the two that are free: a mark on every tab is a mark on
  // none of them.
  await expect(
    tabs.getByRole("tab", { name: /Humanizador/ }),
  ).not.toContainText("Pro");
  await expect(tabs.getByRole("tab", { name: /Detector/ })).not.toContainText(
    "Pro",
  );

  // Still a link. The wall is a better argument with the tool in front of
  // the reader than with a dead tab.
  await expect(paraphrase).toHaveAttribute("href", /parafrasear/);
});

test("a locked tool never spends a request to be told no", async ({ page }) => {
  // C11's other half: no button is left live if it leads to a 403 we can
  // already predict. The run button on a tool outside the plan opens the
  // wall instead of asking the server a question whose answer we know.
  const asked: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/ai/")) asked.push(request.url());
  });

  await page.goto("/parafrasear-texto");
  await typeInto(page, "Texto de entrada", "Un texto cualquiera.");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Requiere un plan de pago" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();

  expect(asked).toEqual([]);
});

// D5 · the one offer that answers a result instead of a refusal.

const ASKED = "palabra ".repeat(20).trim();
const RESULT = "Este es el resultado, entero y sin nada retenido.";

/** A clean answer: everything asked for, paid for, with words to spare. */
async function fullAnswer(page: Page) {
  await page.route("**/api/ai/humanize", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      headers: {
        "x-words-processed": "20",
        "x-words-limit": "300",
        "x-words-used": "20",
        "x-words-remaining": "280",
      },
      body: RESULT,
    }),
  );
}

async function firstResult(page: Page) {
  await fullAnswer(page);
  await page.goto("/humanizador-de-texto-ia");
  await typeInto(page, "Texto de entrada", ASKED);
  await page.getByTestId("run").click();
  return page.getByTestId("signup-invite");
}

test("invites an anonymous reader once the result is on screen", async ({
  page,
}) => {
  const invite = await firstResult(page);
  await expect(invite).toBeVisible();

  // The two figures, from the plan catalogue, so the offer is an amount
  // and not an adjective.
  await expect(invite).toContainText("500 palabras al día");
  await expect(invite).toContainText("no 300");
  // What the reader is about to lose, answered before they can ask it.
  await expect(invite).toContainText("Este resultado se queda aquí");

  // Not a modal, and not over the result: the text they came for is still
  // the thing on screen.
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText(RESULT)).toBeVisible();

  // The offer carries where to come back to.
  await expect(
    invite.getByRole("link", { name: "Crear cuenta gratis" }),
  ).toHaveAttribute("href", /\/registro\?next=/);
});

test("turned down once, it stays down", async ({ page }) => {
  const invite = await firstResult(page);
  await invite.getByRole("button", { name: "Ahora no" }).click();

  // It says where the offer went rather than vanishing without a word.
  await expect(page.getByText(/no volveremos a mostrarlo/)).toBeVisible();

  // And the next run does not bring it back -- not in this visit and, by
  // localStorage rather than sessionStorage, not tomorrow either.
  await page.getByTestId("run").click();
  await expect(page.getByText(RESULT)).toBeVisible();
  await expect(page.getByTestId("signup-invite")).toHaveCount(0);
  await expect(page.getByText(/no volveremos a mostrarlo/)).toHaveCount(0);
});
