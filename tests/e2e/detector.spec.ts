import { expect, test, type Page } from "@playwright/test";

// The detector runs entirely on our own server with no model call, so unlike
// the other tools this whole flow is exercisable in CI without any API key.

// Pasted straight out of a chat: assistant register, Markdown heading, spaced
// em dash. Above the 200-word floor, because below it the engine refuses.
const GENERADO = `**La transformación digital en las organizaciones**

La inteligencia artificial ha transformado profundamente la manera en que las
organizaciones abordan sus procesos internos. En la actualidad, resulta
fundamental comprender cómo estas herramientas pueden integrarse de forma
efectiva en los flujos de trabajo existentes. Las empresas que han iniciado
este camino reportan mejoras sustanciales en su productividad operativa.

Por otro lado, es importante destacar que la adopción tecnológica no depende
únicamente de la infraestructura disponible. En este sentido, la formación del
personal desempeña un papel crucial en el éxito de cualquier iniciativa.
Además, cabe señalar que las empresas que invierten en capacitación obtienen
mejores resultados a largo plazo. Este hallazgo se repite en los principales
estudios sectoriales de los últimos años.

Asimismo, la cultura organizacional influye de manera significativa en la
aceptación de nuevas herramientas. Es esencial que los responsables comprendan
las expectativas de sus equipos antes de iniciar cualquier despliegue. Por lo
tanto, la comunicación interna se convierte en un aspecto clave del proceso de
adopción tecnológica. Resulta igualmente relevante establecer indicadores
claros desde el primer momento.

Cabe destacar que la resistencia al cambio constituye uno de los obstáculos
más frecuentes. Las organizaciones deben abordar esta cuestión con estrategias
específicas de acompañamiento. De esta manera, se facilita una transición
ordenada hacia los nuevos modelos de trabajo. La experiencia demuestra que los
proyectos acompañados obtienen tasas de adopción notablemente superiores.

En conclusión, la transformación digital requiere un enfoque integral que
combine tecnología, personas y procesos de manera equilibrada. Las
organizaciones que lo entiendan así obtendrán una ventaja competitiva
sostenible en el tiempo — y esa ventaja será difícil de replicar por parte de
sus competidores directos.`;

// Formal academic Spanish: the false positive this tool must not produce.
// Pinned here as well as in tests/detector.test.ts because the engine landing
// it in verde and the result page saying what verde does not mean are two
// separate promises, and both have to hold in the browser.
const ACADEMICO = `El debate sobre la periodización del Renacimiento español
ha estado condicionado por una tensión historiográfica persistente. Menéndez
Pelayo situó su inicio en la década de 1520, vinculándolo a la difusión del
erasmismo; Bataillon, medio siglo después, matizó esa lectura al mostrar que
la recepción de Erasmo fue más tardía y más conflictiva de lo supuesto.

La discusión no es meramente cronológica. Aceptar una u otra fecha implica
asumir qué se considera "renacentista": ¿la circulación de textos clásicos, la
reforma de la piedad, un determinado gusto formal? Los estudios recientes
sobre bibliotecas privadas sevillanas complican aún más el cuadro, pues
documentan la presencia de autores italianos décadas antes de lo que admitía
el consenso.

Quizá el problema resida en la propia categoría, heredada de una tradición
crítica que buscaba en España un reflejo del modelo italiano. Si abandonamos
esa expectativa, la pregunta por la fecha pierde buena parte de su urgencia.
Lo que queda es una historia de recepciones desiguales, de lecturas parciales,
de apropiaciones locales que no se dejan ordenar en un esquema único. Así lo
han señalado, con matices distintos, Rico y Gómez Moreno.

Conviene añadir una cautela. La documentación conservada privilegia a los
lectores acomodados, que son quienes dejaban inventarios; de la lectura
popular sabemos poco y lo poco que sabemos procede de fuentes indirectas, casi
siempre judiciales. Cualquier periodización construida sobre ese material
hereda ese sesgo. No es un argumento para renunciar a periodizar, pero sí para
hacerlo con menos confianza de la que suele exhibirse en los manuales al uso.`;

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

test("puts an unedited generated text in the top band and names the evidence", async ({
  page,
}) => {
  const result = await analyse(page, GENERADO);

  await expect(
    result.getByText("Hay indicios claros de escritura automática"),
  ).toBeVisible();

  // The evidence list is the product: a band with nothing under it is an
  // accusation without a reason.
  await expect(result.getByText("Qué hemos medido")).toBeVisible();
  // The rhythm signal carries most of the weight, and the em dash is the
  // artefact a paste from a chat leaves behind: both have to be named.
  await expect(
    result.getByText("Variación de longitud de frase"),
  ).toBeVisible();
  await expect(result.getByText("Restos de Markdown")).toBeVisible();
});

test("never presents the result as a probability or as proof", async ({
  page,
}) => {
  // This is the guarantee the landing page makes and the one that matters
  // most: the tool gets pointed at students.
  const result = await analyse(page, GENERADO);

  await expect(
    result.getByText(/sirve como prueba para acusar a nadie/),
  ).toBeVisible();
  await expect(result.getByText(/No damos un porcentaje/)).toBeVisible();

  // No number on a 0-100 scale anywhere in the result, in any shape. It used
  // to be a ring filled to the index, then an "índice interno NN/100"; both
  // read as a percentage whatever the caption said.
  await expect(result.locator('[style*="conic-gradient"]')).toHaveCount(0);
  await expect(result.getByText(/\d+\s*\/\s*100/)).toHaveCount(0);
  await expect(result.getByText(/\d+\s*%\s*(generado|de IA)/)).toHaveCount(0);
});

test("leaves formal academic prose in the bottom band and says what that does not mean", async ({
  page,
}) => {
  // The expensive error. Reading "sin indicios" as "written by a person" is
  // the other mistake the result has to head off, because it is the one a
  // user makes just before concluding the tool is broken.
  const result = await analyse(page, ACADEMICO);

  await expect(
    result.getByText("No hay indicios de escritura automática"),
  ).toBeVisible();
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
  await expect(
    result.getByText(/indicios de escritura automática/),
  ).toHaveCount(0);
});

test("gates the passage breakdown behind the paid plans", async ({ page }) => {
  const result = await analyse(page, GENERADO);

  await expect(
    result.getByText(/desglose por pasajes está disponible/),
  ).toBeVisible();
  await expect(
    result.getByText("Dónde se concentran los indicios", { exact: true }),
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
