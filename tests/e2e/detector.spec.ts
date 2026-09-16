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

// Generated prose in a careful academic register. Every signal here reads
// human, so it lands in "bajo" -- which is exactly the case the result has
// to explain rather than let the reader misread.
const MACHINE_WELL_WRITTEN = `El debate sobre la periodización del
Renacimiento español ha estado condicionado por una tensión historiográfica
persistente. Menéndez Pelayo situó su inicio en la década de 1520,
vinculándolo a la difusión del erasmismo; Bataillon, medio siglo después,
matizó esa lectura al mostrar que la recepción de Erasmo fue más tardía y más
conflictiva de lo supuesto. La discusión no es meramente cronológica. Aceptar
una u otra fecha implica asumir qué se considera "renacentista": ¿la
circulación de textos clásicos, la reforma de la piedad, un determinado gusto
formal? Los estudios recientes sobre bibliotecas privadas sevillanas
complican aún más el cuadro, pues documentan la presencia de autores
italianos décadas antes de lo que admitía el consenso. Quizá el problema
resida en la propia categoría del Renacimiento, heredada de una tradición
crítica que buscaba en España un reflejo del modelo italiano.`;

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

  await expect(result.getByText(/no una probabilidad/)).toBeVisible();
  await expect(
    result.getByText(/sirve como prueba para acusar a nadie/),
  ).toBeVisible();
  // No "NN% generado por IA" claim in the result itself. The page prose
  // does quote that phrasing, on purpose, to argue against it.
  await expect(result.getByText(/\d+\s*%\s*(generado|de IA)/)).toHaveCount(0);
  // The disclaimer used to sit under a ring filled to the index, which is
  // the shape of a percentage gauge and outargued the caption. The finding
  // is the band; nothing in the result may be drawn as a 0-100 fill.
  await expect(result.locator('[style*="conic-gradient"]')).toHaveCount(0);
});

test("says what a low band does not mean", async ({ page }) => {
  // Measured: generation outside the assistant register trips none of these
  // signals and lands in "bajo". Reading that as "written by a person" is
  // the mistake the result has to head off, because it is the one a user
  // makes before concluding the tool is broken.
  const result = await analyse(page, MACHINE_WELL_WRITTEN);

  await expect(result.getByText(/Indicios bajos de escritura/)).toBeVisible();
  await expect(
    result.getByText(/no significa «lo escribió una persona»/),
  ).toBeVisible();
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

// Paraphraser and proofreader are paid-only (lib/billing/plans.ts FREE_TOOLS),
// so an anonymous visitor arriving from search must meet the paywall before
// writing, not a 403 after pressing the button.
for (const { path, name } of [
  { path: "/parafrasear-texto", name: "Parafraseador" },
  { path: "/corrector-ortografico-gramatical", name: "Corrector" },
]) {
  test(`${name}: shows the paywall up front to a free visitor`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(
      page.getByText(`${name} está en los planes de pago.`),
    ).toBeVisible();

    const run = page.getByRole("button", { name: "Requiere un plan de pago" });
    await expect(run).toBeVisible();
    await expect(run).toBeDisabled();

    // Typing must not enable it: the plan, not the input, is the gate.
    await page.getByLabel("Texto de entrada").fill("Un texto cualquiera.");
    await expect(run).toBeDisabled();
  });
}

test("the free tools stay usable without a plan", async ({ page }) => {
  for (const path of ["/humanizador-de-texto-ia", "/detector-de-ia"]) {
    await page.goto(path);
    await expect(
      page.getByRole("button", { name: "Requiere un plan de pago" }),
    ).toHaveCount(0);
  }
});
