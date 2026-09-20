import { expect, test, type Page } from "@playwright/test";

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
  const box = page.getByLabel(label);
  await expect(box).toBeVisible();
  await box.fill(LONG_TEXT);
  return box;
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
  // still runs and no modal has taken over the page.
  await expect(page.getByRole("button", { name: "Humanizador" })).toBeEnabled();
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
  await expect(
    page.getByRole("button", { name: "AI humanizer" }),
  ).toBeEnabled();
});

// Wall B — the daily allowance is spent and the result exists anyway.
//
// Reaching it for real needs Redis, a spent quota and an API key, so the
// refusal is served here instead. What is under test is the browser half:
// the result is the user's own text, the beginning of it is legible, the
// rest is withheld from sight and from screen readers, and dismissing it
// means dismissing it.

const VISIBLE = "Esta es la parte que sí puede leer quien ha llegado al tope.";
const WITHHELD = "Y esta es la que queda detrás de la oferta, sin excepción.";

async function refuseWithResult(page: Page) {
  await page.route("**/api/ai/humanize", (route) =>
    route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({
        error: "quota_exceeded",
        message: "Has agotado tus palabras de hoy.",
        partialResult: `${VISIBLE} ${WITHHELD}`,
        visibleChars: VISIBLE.length,
        usedToday: 300,
        limitToday: 300,
      }),
    }),
  );
}

async function hitTheWall(page: Page) {
  await page.goto("/humanizador-de-texto-ia");
  await page.getByLabel("Texto de entrada").fill("Un texto cualquiera.");
  await page.getByRole("button", { name: "Humanizador" }).click();
  return page.getByRole("dialog");
}

test("shows the reader their own result, half of it withheld", async ({
  page,
}) => {
  await refuseWithResult(page);
  const dialog = await hitTheWall(page);

  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("300 / 300 palabras de hoy")).toBeVisible();
  // The good news first, then the limit.
  await expect(dialog.getByText("Tu texto está humanizado")).toBeVisible();
  await expect(dialog.getByText(VISIBLE)).toBeVisible();

  // The withheld half is blurred, which is a picture. Without aria-hidden a
  // screen reader reads the answer straight out and the wall is not there.
  await expect(dialog.getByText(WITHHELD)).toHaveAttribute(
    "aria-hidden",
    "true",
  );
});

test("states the date and the amount before asking for a card", async ({
  page,
}) => {
  await refuseWithResult(page);
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
  await refuseWithResult(page);
  const dialog = await hitTheWall(page);

  await expect(
    dialog.getByRole("link", { name: /Crear cuenta gratis/ }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: /Probar Ilimitado 3 días gratis/ }),
  ).toBeVisible();
});

test("closes on Escape and does not come back in the same session", async ({
  page,
}) => {
  await refuseWithResult(page);
  const dialog = await hitTheWall(page);
  await expect(dialog).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);

  // Dismissed once is dismissed for the session: a wall that reappears
  // after the reader closed it stops being an offer.
  await page.getByRole("button", { name: "Humanizador" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

// Wall C — a paid tool opened by somebody who cannot run it.

test("names what is still free before it names the price", async ({ page }) => {
  await page.goto("/parafrasear-texto");

  // Not on arrival: these pages are the SEO asset and a modal over content
  // reached from a search result is an intrusive interstitial.
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByLabel("Texto de entrada").click();
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
  await page.getByLabel("Texto de entrada").click();
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
  await page.getByLabel("Texto de entrada").click();
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
  await page.getByLabel("Texto de entrada").fill("Un texto cualquiera.");
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
