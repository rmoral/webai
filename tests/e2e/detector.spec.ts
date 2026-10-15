import { type Page } from "@playwright/test";

import { expect, test } from "./fixtures";

import { typeInto } from "./helpers";

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
  await typeInto(page, "Texto de entrada", text);
  await page.getByRole("button", { name: "Analizar texto" }).click();
  const result = page.getByTestId("detector-result");
  await expect(result).toBeVisible({ timeout: 15_000 });
  return result;
}

/** The same flow on the English landing, at its own URL. */
async function analyseEnglish(page: Page, text: string) {
  await page.goto("/en/ai-detector");
  await typeInto(page, "Text to process", text);
  await page.getByRole("button", { name: "Analyse text" }).click();
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

  // The gate is now a lock answered in place (wall D) rather than a line of
  // prose: the reader keeps the result they are looking at on screen.
  const lock = result.getByRole("button", {
    name: "Ver el desglose por pasajes",
  });
  await expect(lock).toBeVisible();
  await expect(
    result.getByText("Dónde se concentran los indicios", { exact: true }),
  ).toHaveCount(0);

  await lock.click();
  await expect(
    page.getByRole("dialog").getByText(/desglose por pasajes está disponible/),
  ).toBeVisible();
});

// The paraphraser and the corrector run without an account now (F2-01):
// a hundred words a run, two runs a day. Arriving from search, the reader
// meets the tool, not a wall.
for (const { path, tool, verb, name } of [
  {
    path: "/parafrasear-texto",
    tool: "paraphrase",
    verb: "Parafrasear",
    name: "Parafraseador",
  },
  {
    path: "/corrector-ortografico-gramatical",
    tool: "correct",
    verb: "Corregir",
    name: "Corrector",
  },
]) {
  test(`${name}: runs without an account`, async ({ page }) => {
    await page.route(`**/api/ai/${tool}`, (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/plain; charset=utf-8",
        headers: {
          "x-words-processed": "3",
          "x-uses-used": "1",
          "x-uses-limit": "2",
          "x-uses-remaining": "1",
        },
        body: "Un resultado corriente.",
      }),
    );
    await page.goto(path);
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await typeInto(page, "Texto de entrada", "Un texto cualquiera.");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button", { name: verb }).click();
    // The corrector shows its result as a review of the text (F2-09).
    await expect(
      tool === "correct"
        ? page.getByTestId("review-text")
        : page.getByText("Un resultado corriente."),
    ).toBeVisible();
    // The run is counted where the limit is shown.
    await expect(page.getByTestId("word-count")).toContainText("1/2 usos hoy");
  });
}

test("the free tools stay usable without a plan", async ({ page }) => {
  for (const path of ["/humanizador-de-texto-ia", "/detector-de-ia"]) {
    await page.goto(path);
    await typeInto(page, "Texto de entrada", "Un texto cualquiera.");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
});

// Generated English, pasted unedited: assistant register, Markdown heading,
// spaced em dash. Kept in step with lib/ai/detector/fixtures.ts.
const GENERATED_EN = `**The Role of Artificial Intelligence in Modern Organisations**

Artificial intelligence has fundamentally transformed the way organisations approach their internal processes. In today's rapidly evolving landscape, it is essential to understand how these tools can be integrated effectively into existing workflows. Companies that have embarked on this journey report substantial improvements in their operational productivity.

Furthermore, it is important to note that technological adoption does not depend solely on the available infrastructure. In this regard, staff training plays a crucial role in the success of any initiative. Moreover, it is worth mentioning that organisations investing in capability building achieve better long-term outcomes. This finding is echoed across the leading sector studies of recent years.

Similarly, organisational culture significantly influences the acceptance of new tools. It is essential that leaders understand the expectations of their teams before initiating any deployment. Therefore, internal communication becomes a key aspect of the technological adoption process. It is equally relevant to establish clear indicators from the outset.

It should be noted that resistance to change constitutes one of the most frequent obstacles. Organisations must address this issue with specific support strategies. In this way, an orderly transition towards new ways of working is facilitated. Experience demonstrates that supported projects achieve notably higher adoption rates.

In conclusion, digital transformation requires a comprehensive approach that combines technology, people and processes in a balanced manner. Organisations that understand this will obtain a sustainable competitive advantage over time — and that advantage will prove difficult for their direct competitors to replicate.`;

// Careful second-language English: the writer this category of tool has a
// documented record of wrongly accusing.
const NON_NATIVE_EN = `In this essay I will discuss the impact of remote work on the productivity of software teams. This topic is important because many companies have changed their policies after the pandemic, and the results are not the same for every organisation.

First, it is necessary to define what we mean by productivity. Some studies measure the number of features delivered in a period. Other studies measure the quality of the code and the number of defects that reach production. These two definitions can give opposite results for the same team.

Second, the evidence about remote work is mixed. A study from 2023 found that developers working from home closed more tickets than their colleagues in the office. However, the same study found that the time to review a pull request increased by almost forty per cent. This suggests that individual productivity and team productivity are not the same thing.

Third, the context of the company is very important. Teams that were already distributed before the change adapted faster than teams that were not. In my own experience working in two companies, the difference was very clear. The first company had documentation for every process and the transition was smooth. The second company depended on informal conversations and the transition was difficult.

In conclusion, the impact of remote work depends on how we measure productivity and on the situation of each company. More research is necessary before we can give a general recommendation.`;

test("the English detector answers in English, at its own URL", async ({
  page,
}) => {
  const result = await analyseEnglish(page, GENERATED_EN);

  await expect(
    result.getByText("Clear indications of machine writing"),
  ).toBeVisible();
  await expect(result.getByText("What we measured")).toBeVisible();
  await expect(result.getByText("Sentence length variation")).toBeVisible();
  // Nothing Spanish leaked through the shared engine.
  await expect(result.getByText(/indicios/)).toHaveCount(0);
});

test("does not flag careful non-native English", async ({ page }) => {
  // The measurement that motivated CORROBORATION: this text reads as
  // machine-like as the generated one on every rhythm signal. Flagging it is
  // the documented harm, and it is what /en/ai-detector promises not to do.
  const result = await analyseEnglish(page, NON_NATIVE_EN);

  await expect(
    result.getByText("No indications of machine writing"),
  ).toBeVisible();
  await expect(
    result.getByText(/does not mean "a person wrote this"/),
  ).toBeVisible();
});

test("analyses the first words of a long text only when asked to", async ({
  request,
}) => {
  // F2-03, server side. Without `truncate` a text over the ceiling is
  // refused as before; with it, the first 300 words are analysed and the
  // result says how many.
  const text = Array.from({ length: 831 }, (_, i) =>
    i % 12 === 11 ? `palabra${i}.` : `palabra${i}`,
  ).join(" ");
  const refused = await request.post("/api/ai/detect", {
    data: { text, locale: "es" },
  });
  expect(refused.status()).toBe(413);

  const cut = await request.post("/api/ai/detect", {
    data: { text, locale: "es", truncate: true },
  });
  expect(cut.status()).toBe(200);
  expect(cut.headers()["x-words-processed"]).toBe("300");
});

test("from the verdict: why there is no percentage, and the next step", async ({
  page,
}) => {
  // F2-04 and F2-06.
  const result = await analyse(page, GENERADO);
  await expect(
    result.getByText(/Otros detectores dan un porcentaje/),
  ).toBeVisible();
  await expect(result.getByRole("link", { name: "Por qué →" })).toHaveAttribute(
    "href",
    "#por-que-no-porcentaje",
  );
  await expect(page.locator("#por-que-no-porcentaje")).toContainText(
    "Por qué no verás un porcentaje",
  );

  // Another text: the box is emptied, on purpose, and has the focus.
  await result.getByRole("button", { name: "Analizar otro texto" }).click();
  const box = page.getByLabel("Texto de entrada");
  await expect(box).toHaveValue("");
  await expect(box).toBeFocused();

  // The humanizer, with the same text in its box.
  const again = await analyse(page, GENERADO);
  await again.getByRole("button", { name: "Humanizar este texto" }).click();
  await expect(page).toHaveURL(/humanizador-de-texto-ia/);
  await expect(page.getByLabel("Texto de entrada")).toHaveValue(GENERADO);
});
