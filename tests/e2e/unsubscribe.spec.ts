import { config } from "dotenv";

import { expect, test } from "./fixtures";

// The page that stops the onboarding emails. It is the one flow in the
// product that somebody arrives at from an inbox, months later, with no
// session -- and the one whose failure is a complaint to a regulator rather
// than a bug report.

// The token is signed with the same secret the server uses, so the test has
// to read the same file the dev server does.
config({ path: ".env.local", quiet: true });

const USER = "33333333-3333-4333-8333-333333333333";

async function tokenFor(userId: string): Promise<string | null> {
  if (!process.env.IP_HASH_SECRET) return null;
  const { optOutToken } = await import("@/lib/email/optout");
  return optOutToken(userId);
}

test("asks before it does anything, then confirms", async ({ page }) => {
  const token = await tokenFor(USER);
  test.skip(!token, "IP_HASH_SECRET is not set in this environment");

  await page.goto(`/baja-emails?t=${encodeURIComponent(token!)}`);

  // Asking is the point: some email clients fetch every link in a message
  // to build a preview, and a page that acted on load would unsubscribe
  // people who never clicked.
  const confirm = page.getByRole("button", { name: /darme de baja/i });
  await expect(confirm).toBeVisible();

  // And it says what keeps arriving, so nobody thinks they have switched off
  // the warning before a charge.
  await expect(page.locator("main")).toContainText(/confirmaciones de pago/i);

  // The click itself is not asserted here: confirming writes a row, and this
  // container has no database to write to -- the action correctly lands on
  // its own error state instead. What the signature gate does before any
  // write is covered in tests/onboarding.test.ts.
});

test("shows the state a confirmed unsubscribe lands on", async ({ page }) => {
  // Reached by the action's redirect. Asserted directly because what matters
  // is that the page says the billing notices keep coming -- somebody who
  // reads "done" and assumes they have switched off a charge warning is the
  // failure this page exists to avoid.
  await page.goto("/baja-emails?done=1");
  await expect(page.locator("main h1")).toContainText(/no volveremos/i);
  await expect(page.locator("main")).toContainText(/facturación/i);
});

test("says so plainly when the link is broken", async ({ page }) => {
  // Half a token, which is what a mail client that wraps a long line
  // produces. The answer has to name the way out rather than a 400.
  await page.goto("/baja-emails?t=nope");
  await expect(page.locator("main h1")).toContainText(/no es válido/i);
  await expect(page.locator("main")).toContainText("hola@verbalyx.ai");

  await page.goto("/baja-emails");
  await expect(page.locator("main h1")).toContainText(/no es válido/i);
});

test("is not offered to search engines", async ({ page }) => {
  await page.goto("/baja-emails?t=nope");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );

  const robots = await page.request.get("/robots.txt");
  expect(await robots.text()).toContain("/baja-emails");
});
