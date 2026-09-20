import { expect, type Page } from "@playwright/test";

/**
 * Puts text in the editor and waits until React actually has it.
 *
 * A value set between the server HTML and hydration never reaches React
 * state: the box shows the text, the word counter still says zero, and
 * everything driven by the count -- the overflow notice, the run button,
 * the paywall -- behaves as if nothing had been typed. Against a dev
 * server compiling a route on its first request that window is wide.
 *
 * Retrying the fill is safe; retrying a click is not, because a second
 * click lands on the backdrop of whatever the first one opened.
 */
export async function typeInto(page: Page, label: string, text: string) {
  const box = page.getByLabel(label);
  await expect(async () => {
    await box.fill(text);
    await expect(page.getByTestId("word-count")).not.toHaveText(/^\s*0\b/);
  }).toPass({ timeout: 20_000 });
  return box;
}
