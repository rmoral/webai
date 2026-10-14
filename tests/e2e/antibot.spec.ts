import { type Page } from "@playwright/test";

import { expect, test } from "./fixtures";

import { typeInto } from "./helpers";

// C3 — the anti-bot check must never be the first thing a visitor sees.
//
// Turnstile resolves a few hundred milliseconds after the page does, and
// the run button used to be live for the whole of that gap: the first
// click of the visit answered "Verificación anti-bot fallida", with no way
// to retry. What these tests hold is the gap itself, and the recovery.
//
// Cloudflare's script is replaced by a stub of the two calls the editor
// actually uses -- render() and reset(), each answering with a token. The
// widget's own behaviour is Cloudflare's to test; ours is what the editor
// does while waiting for it, which is what broke. It also means the suite
// needs no network and no site key of its own.

const ERROR = "Verificación anti-bot fallida";

/** Replaces the Turnstile script with one that answers after `delayMs`. */
async function stubTurnstile(page: Page, delayMs: number) {
  const state = { requested: false };
  await page.route("**/challenges.cloudflare.com/**", async (route) => {
    state.requested = true;
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: `
        (() => {
          let issued = 0;
          let opts = null;
          const answer = () => {
            const current = opts;
            setTimeout(() => current && current.callback("stub-token-" + ++issued), ${delayMs});
          };
          window.turnstile = {
            render(el, options) {
              opts = options;
              el.setAttribute("data-testid", "antibot");
              answer();
              return "stub-widget";
            },
            reset() { answer(); },
          };
        })();
      `,
    });
  });
  return state;
}

/**
 * Whether this build asks for Turnstile at all. Without a site key the
 * editor never loads the script, and there is no gap to test.
 */
async function usesTurnstile(page: Page, state: { requested: boolean }) {
  for (let i = 0; i < 20 && !state.requested; i++)
    await page.waitForTimeout(150);
  return state.requested;
}

test("the button waits for the token instead of failing on the first click", async ({
  page,
}) => {
  // Two seconds of waiting, which is what a slow connection does on its own.
  const state = await stubTurnstile(page, 2_000);
  await page.goto("/humanizador-de-texto-ia");
  await typeInto(page, "Texto de entrada", "Un texto cualquiera para probar.");

  test.skip(
    !(await usesTurnstile(page, state)),
    "This build carries no Turnstile site key",
  );

  // Pressed before the token: the verb stays, with a spinner, and the
  // request goes out once the token lands (F2). Not a refusal, and not a
  // button greyed out with "Verificando…".
  let sent = "";
  await page.route("**/api/ai/humanize", async (route) => {
    sent =
      (route.request().postDataJSON() as { turnstileToken?: string })
        .turnstileToken ?? "";
    await route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      body: "Un resultado corriente.",
    });
  });
  const run = page.getByRole("button", { name: "Humanizar" });
  await expect(run).toBeEnabled();
  await run.click();
  await expect(run).toHaveAttribute("aria-busy", "true");
  await expect(page.getByText("Un resultado corriente.")).toBeVisible({
    timeout: 20_000,
  });
  expect(sent).toMatch(/^stub-token-/);
  await expect(page.getByText(ERROR)).toHaveCount(0);
});

test("a failed check recovers on its own, without the reader doing anything", async ({
  page,
}) => {
  // The commonest anti-bot failure is a token already spent or expired,
  // which is nothing the reader can act on: the first attempt is refused
  // and the second has to go through in silence.
  const state = await stubTurnstile(page, 50);

  let attempts = 0;
  await page.route("**/api/ai/humanize", async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ error: "captcha_failed", message: ERROR }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      headers: { "x-words-remaining": "240" },
      body: "Un resultado corriente, devuelto al segundo intento.",
    });
  });

  await page.goto("/humanizador-de-texto-ia");
  await typeInto(page, "Texto de entrada", "Un texto cualquiera para probar.");

  test.skip(
    !(await usesTurnstile(page, state)),
    "This build carries no Turnstile site key",
  );

  await page
    .getByRole("button", { name: "Humanizar" })
    .click({ timeout: 20_000 });

  await expect(
    page.getByText("Un resultado corriente, devuelto al segundo intento."),
  ).toBeVisible({ timeout: 20_000 });
  // The refusal happened, and the reader never learned about it.
  expect(attempts).toBe(2);
  await expect(page.getByText(ERROR)).toHaveCount(0);
});

test("when Cloudflare wants a click, the widget shows in the result panel", async ({
  page,
}) => {
  // The widget is `interaction-only`, so nothing shows unless Cloudflare
  // asks. When it does, it appears in the empty result panel, and never
  // as a row inserted under the button (F2-12).
  const state = { requested: false };
  await page.route("**/challenges.cloudflare.com/**", async (route) => {
    state.requested = true;
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: `
        window.turnstile = {
          render(el, options) {
            el.setAttribute("data-testid", "antibot");
            el.style.height = "65px";
            options["before-interactive-callback"]();
            return "stub-widget";
          },
          reset() {},
        };
      `,
    });
  });
  await page.goto("/humanizador-de-texto-ia");
  await typeInto(page, "Texto de entrada", "Un texto cualquiera para probar.");
  test.skip(
    !(await usesTurnstile(page, state)),
    "This build carries no Turnstile site key",
  );

  const before = await page.getByTestId("run").boundingBox();
  await expect(page.getByTestId("antibot")).toBeVisible();
  const run = await page.getByTestId("run").boundingBox();
  // The button did not move: nothing was inserted above or beside it.
  expect(run!.y).toBe(before!.y);
  // And the widget is in the result column, to the right on a desktop.
  const widget = await page.getByTestId("antibot").boundingBox();
  expect(widget!.x).toBeGreaterThan(run!.x + run!.width);
});
