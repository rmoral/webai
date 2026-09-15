import { expect, test, type Page } from "@playwright/test";

// The detector runs entirely on our own server with no model call, so unlike
// the other tools this whole flow is exercisable in CI without any API key.

const FORMULAIC = `Es importante destacar que la lectura desempeña un papel
fundamental en el desarrollo personal. Además, la lectura permite ampliar el
vocabulario de forma significativa. Por otro lado, la lectura mejora la
capacidad de concentración de las personas. En este sentido, la lectura
resulta esencial para el crecimiento intelectual. Asimismo, la lectura
contribuye a desarrollar el pensamiento crítico de forma notable. Cabe
destacar que la lectura favorece la empatía entre las personas. Por lo tanto,
la lectura constituye una herramienta muy valiosa. En este sentido, la lectura
amplía la perspectiva cultural de quien la practica. De esta manera, la
lectura enriquece la vida cotidiana de forma constante. Cabe mencionar que la
lectura estimula la imaginación de manera considerable. En conclusión, la
lectura es fundamental para el desarrollo humano completo.`;

/** Runs the tool and returns the result panel, scoped so page prose that
 *  happens to use the same words cannot satisfy an assertion. */
async function analyse(page: Page, text: string) {
  await page.goto("/detector-de-ia");
  await page.getByLabel("Texto de entrada").fill(text);
  await page.getByRole("button", { name: "Detector de IA" }).click();
  const result = page.getByTestId("detector-result");
  await expect(result).toBeVisible({ timeout: 15_000 });
  return result;
}

test("analyses a pasted text and shows the four signals", async ({ page }) => {
  const result = await analyse(page, FORMULAIC);

  await expect(
    result.getByText(
      /Indicios (altos|moderados|bajos) de escritura automática/,
    ),
  ).toBeVisible();

  // Every signal is named, because the breakdown is the product.
  for (const label of [
    "Ritmo de las frases",
    "Conectores de relleno",
    "Repetición de estructuras",
    "Variedad de puntuación",
  ]) {
    await expect(result.getByText(label, { exact: true })).toBeVisible();
  }
});

test("never presents the result as a probability or as proof", async ({
  page,
}) => {
  // This is the guarantee the landing page makes and the one that matters
  // most: the tool gets pointed at students.
  const result = await analyse(page, FORMULAIC);

  await expect(
    result.getByText(/No es un porcentaje de probabilidad/),
  ).toBeVisible();
  await expect(
    result.getByText(/sirve como prueba para acusar a nadie/),
  ).toBeVisible();
  // No "NN% generado por IA" claim in the result itself. The page prose
  // does quote that phrasing, on purpose, to argue against it.
  await expect(result.getByText(/\d+\s*%\s*(generado|de IA)/)).toHaveCount(0);
});

test("refuses to score a sample too short to mean anything", async ({
  page,
}) => {
  const result = await analyse(page, "Un texto corto. Nada más.");

  await expect(
    result.getByText("Texto demasiado corto para analizarlo"),
  ).toBeVisible();
  await expect(result.getByText(/Indicios .* de escritura/)).toHaveCount(0);
});

test("gates the per-sentence breakdown behind the paid plans", async ({
  page,
}) => {
  const result = await analyse(page, FORMULAIC);

  await expect(
    result.getByText(/desglose frase por frase está disponible/),
  ).toBeVisible();
  await expect(
    result.getByText("Frase por frase", { exact: true }),
  ).toHaveCount(0);
});
