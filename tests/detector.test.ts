import { describe, expect, it } from "vitest";
import { createTranslator } from "next-intl";

import * as F from "@/lib/ai/detector/fixtures";
import { forensicSignals } from "@/lib/ai/detector/forensic";
import { analyze } from "@/lib/ai/detector/pipeline";
import { aggregate, bandFor, saturate } from "@/lib/ai/detector/scoring";
import {
  asRaw,
  normalize,
  splitSentences,
  syllables,
  words,
} from "@/lib/ai/detector/segment";
import {
  applies,
  BANDS,
  budgetFor,
  CORROBORATION,
  LEVEL_A_SHARE,
  RELIABILITY,
  SIGNALS,
  type SignalId,
} from "@/lib/ai/detector/weights";
import { routing, type Locale } from "@/lib/i18n/routing";
import en from "@/messages/en.json";
import es from "@/messages/es.json";

// Phase 1 of the architecture doc, now in two languages. The absolute scores
// are hand-calibrated against lib/ai/detector/fixtures.ts, so the assertions
// here are on bands, orderings and invariants -- never on a bare number that
// a legitimate recalibration would move. Where a number is pinned it is a
// threshold from weights.ts, so turning it is a deliberate edit in one place.

const locales = routing.locales;

describe("segmentación", () => {
  it("corta frases en los terminadores del español", () => {
    expect(splitSentences("Uno. Dos. Tres.", "es")).toHaveLength(3);
  });

  it("mantiene enteras las frases con ¿? y ¡!", () => {
    const s = splitSentences("¿Vienes? ¡Claro que sí! Nos vemos luego.", "es");
    expect(s).toHaveLength(3);
    expect(s[0]).toBe("¿Vienes?");
  });

  it("no corta en las abreviaturas de cada idioma", () => {
    expect(splitSentences("Lo dijo el Dr. Ramírez ayer.", "es")).toHaveLength(
      1,
    );
    // The English list is not the Spanish one: "e.g." and "p. ej." break
    // each other's text into fragments, and a fragment counted as a sentence
    // corrupts every rhythm measure downstream.
    expect(splitSentences("Ask Mr. Smith about it.", "en")).toHaveLength(1);
    expect(
      splitSentences("Several forms, e.g. the short one, apply here.", "en"),
    ).toHaveLength(1);
  });

  it("no sabe cortar detrás de una abreviatura que cierra frase", () => {
    // "at 4 p.m. Bring the file" stays one sentence: the guard cannot tell
    // that full stop from the one in "Mr. Smith", and no capitalisation rule
    // separates them either. Pinned rather than left as a surprise -- it
    // slightly lowers the sentence count on texts full of abbreviations,
    // which nudges the rhythm measures toward longer sentences.
    expect(
      splitSentences("It arrives at 4 p.m. Bring the file.", "en"),
    ).toHaveLength(1);
  });

  it("cuenta sílabas con la regla de cada idioma", () => {
    // Spanish spelling is close to phonetic; English is not, and counting
    // vowel groups there gives "make" two syllables.
    expect(syllables("casa", "es")).toBe(2);
    expect(syllables("make", "en")).toBe(1);
    expect(syllables("table", "en")).toBe(2);
    expect(syllables("running", "en")).toBe(2);
  });
});

describe("corpus de calibración · español", () => {
  it("texto generado sin editar: rojo", () => {
    const r = analyze(F.GENERADO_SIN_EDITAR, "es");
    expect(r.reliable).toBe(true);
    expect(r.band).toBe("rojo");
  });

  for (const [name, text] of [
    ["humano formal académico", F.HUMANO_ACADEMICO],
    ["humano informal", F.HUMANO_INFORMAL],
    ["español de México", F.MEXICO],
    ["español de Argentina", F.ARGENTINA],
    ["español no nativo", F.NO_NATIVO],
  ] as const) {
    it(`${name}: verde`, () => {
      const r = analyze(text, "es");
      expect(r.band).toBe("verde");
      expect(r.score).toBeLessThan(BANDS.es.amarillo);
    });
  }

  it("separa el generado de todo lo demás con margen utilizable", () => {
    const generado = analyze(F.GENERADO_SIN_EDITAR, "es").score;
    for (const humano of [
      F.HUMANO_ACADEMICO,
      F.HUMANO_INFORMAL,
      F.MEXICO,
      F.ARGENTINA,
      F.NO_NATIVO,
    ]) {
      expect(generado).toBeGreaterThan(analyze(humano, "es").score + 15);
    }
  });

  it("no penaliza el español de América frente al peninsular", () => {
    const academico = analyze(F.HUMANO_ACADEMICO, "es").score;
    expect(analyze(F.MEXICO, "es").score).toBeLessThan(academico);
    expect(analyze(F.ARGENTINA, "es").score).toBeLessThan(academico);
  });
});

describe("corpus de calibración · inglés", () => {
  it("texto generado sin editar: rojo", () => {
    const r = analyze(F.GENERATED_UNEDITED, "en");
    expect(r.reliable).toBe(true);
    expect(r.band).toBe("rojo");
  });

  for (const [name, text] of [
    ["academic", F.ACADEMIC_FORMAL],
    ["informal", F.INFORMAL],
    ["non-native", F.NON_NATIVE],
  ] as const) {
    it(`${name}: verde`, () => {
      const r = analyze(text, "en");
      expect(r.band).toBe("verde");
      expect(r.score).toBeLessThan(BANDS.en.amarillo);
    });
  }

  it("mide el inglés con sus propias anclas, no con las españolas", () => {
    // English sentences run shorter and vary less. Measured against the
    // Spanish anchors, ordinary English prose reads as machine-like.
    const asEnglish = analyze(F.ACADEMIC_FORMAL, "en").score;
    const asSpanish = analyze(F.ACADEMIC_FORMAL, "es").score;
    expect(asSpanish).toBeGreaterThan(asEnglish);
  });

  it("no mide la señal de apertura ¿ ¡ en inglés", () => {
    expect(applies("apertura_interrogacion_perfecta", "es")).toBe(true);
    expect(applies("apertura_interrogacion_perfecta", "en")).toBe(false);
  });
});

describe("la escritura no nativa no se acusa", () => {
  // The whole reason CORROBORATION exists. Careful second-language writing
  // measures the same as generated text on every rhythm signal, in both
  // languages -- 0,307 against 0,281 in Spanish, 0.297 against 0.290 in
  // English. Without the rule both landed in the yellow band, which is the
  // documented harm this category of tool causes.
  const cases = [
    ["es", F.NO_NATIVO, F.GENERADO_SIN_EDITAR],
    ["en", F.NON_NATIVE, F.GENERATED_UNEDITED],
  ] as const;

  for (const [locale, nonNative, generated] of cases) {
    it(`${locale}: el ritmo por sí solo no saca de verde`, () => {
      const r = analyze(nonNative, locale);
      expect(r.corroborated).toBe(false);
      expect(r.band).toBe("verde");
    });

    it(`${locale}: pero el ritmo sí se mide y se reporta`, () => {
      // Capping the band is not hiding the measurement: the evidence list
      // still says what was found, which is the honest half of the answer.
      const rhythm = analyze(nonNative, locale).signals.filter(
        (s) => s.level === "B" && s.contribution > 0,
      );
      expect(rhythm.length).toBeGreaterThan(0);
    });

    it(`${locale}: el generado sí tiene con qué corroborar`, () => {
      const r = analyze(generated, locale);
      expect(r.corroborated).toBe(true);
      expect(r.band).not.toBe("verde");
    });
  }

  it("un texto con solo los artefactos de un procesador no corrobora", () => {
    // Twenty curly apostrophes in 250 English words come to about six
    // points. If that were enough, every document written in Word would
    // unlock the band and the rule would protect nobody.
    const word = F.NON_NATIVE.replace(/'/g, "’");
    expect(analyze(word, "en").corroborated).toBe(false);
  });
});

describe("texto mixto", () => {
  // Written opening, generated close. Phase 1 does not catch it in the
  // document band -- with no paste residue it cannot corroborate -- and this
  // test fixes that limitation rather than leaving it a surprise. What it
  // does do is locate it, which is what the paid passage breakdown shows.
  for (const [locale, text] of [
    ["es", F.MIXTO],
    ["en", F.MIXED],
  ] as const) {
    it(`${locale}: localiza el bloque generado en las ventanas finales`, () => {
      const r = analyze(text, locale);
      const half = Math.floor(r.windows.length / 2);
      const first = r.windows.slice(0, half).map((w) => w.score);
      const last = r.windows.slice(half).map((w) => w.score);
      expect(Math.max(...last)).toBeGreaterThan(Math.max(...first) + 15);
    });

    it(`${locale}: puntúa por encima de la escritura informal`, () => {
      const informal = locale === "es" ? F.HUMANO_INFORMAL : F.INFORMAL;
      expect(analyze(text, locale).score).toBeGreaterThan(
        analyze(informal, locale).score,
      );
    });
  }
});

describe("umbral de fiabilidad", () => {
  for (const [locale, short] of [
    ["es", F.CORTO],
    ["en", F.SHORT],
  ] as const) {
    it(`${locale}: responde gris sin banda de color`, () => {
      const r = analyze(short, locale);
      expect(r.band).toBe("gris");
      expect(r.reliable).toBe(false);
      expect(r.reason).toBe("texto_corto");
      expect(r.words).toBeLessThan(RELIABILITY.minWords);
      expect(r.score).toBe(0);
      expect(r.windows).toEqual([]);
    });
  }

  it("sigue reportando la evidencia forense, que no depende de la longitud", () => {
    const r = analyze("Un texto corto​ con un carácter invisible.", "es");
    expect(r.band).toBe("gris");
    expect(r.signals.some((s) => s.id === "caracteres_invisibles")).toBe(true);
    expect(r.signals.every((s) => s.level === "A")).toBe(true);
  });

  it("también responde gris si hay palabras pero faltan frases", () => {
    const r = analyze(`${"palabra ".repeat(RELIABILITY.minWords + 10)}.`, "es");
    expect(r.band).toBe("gris");
    expect(r.reason).toBe("frases_insuficientes");
  });
});

describe("captura forense sobre el texto en bruto", () => {
  // The pipeline order is a type property (forensicSignals only accepts
  // RawText), but what guarantees the contract is this test: normalise first
  // and these artefacts are gone.
  const dirty = `Texto con raya espaciada — así, comillas curvas “así”,
un carácter invisible​, espacio duro aquí y **negrita de Markdown**.
Segunda frase para que haya algo que medir en el documento completo.`;

  it("ve los artefactos, en ambos idiomas", () => {
    for (const locale of locales) {
      const wordCount = words(normalize(asRaw(dirty))).length;
      const ids = forensicSignals(asRaw(dirty), wordCount, locale).map(
        (s) => s.id,
      );
      for (const id of [
        "raya_espaciada",
        "comillas_curvas",
        "markdown_superviviente",
        "caracteres_invisibles",
        "espacios_especiales",
      ]) {
        expect(ids, `${id} in ${locale}`).toContain(id);
      }
    }
  });

  it("no ve nada de eso una vez normalizado el texto", () => {
    const clean = normalize(asRaw(dirty));
    const found = forensicSignals(
      asRaw(clean),
      words(clean).length,
      "es",
    ).filter((s) =>
      (
        [
          "caracteres_invisibles",
          "espacios_especiales",
          "comillas_curvas",
        ] as string[]
      ).includes(s.id),
    );
    expect(found).toEqual([]);
  });

  it("pesa el mismo artefacto distinto en cada idioma", () => {
    // A spaced em dash is alien to a Spanish keyboard and ordinary British
    // punctuation. Same count, different meaning, and the anchors say so.
    const wordCount = words(normalize(asRaw(dirty))).length;
    const forId = (locale: Locale) =>
      forensicSignals(asRaw(dirty), wordCount, locale).find(
        (s) => s.id === "raya_espaciada",
      )!;
    expect(forId("es").contribution).toBeGreaterThan(forId("en").contribution);

    // At the density that actually decides a band -- one or two dashes in a
    // real text, not a fragment -- the gap is the three-to-one the anchors
    // describe. Both saturate at absurd densities, which is the point of
    // saturating, so the ratio only shows where it matters.
    const es = SIGNALS.raya_espaciada.d50.es!;
    const en = SIGNALS.raya_espaciada.d50.en!;
    expect(saturate(4, es) / saturate(4, en)).toBeGreaterThan(2);
  });

  it("no dispara sobre texto humano limpio", () => {
    expect(
      analyze(F.NO_NATIVO, "es").signals.filter((s) => s.level === "A"),
    ).toEqual([]);
  });
});

describe("invariantes de puntuación", () => {
  it("el nivel A no puede pasar del 30 % del presupuesto, en ningún idioma", () => {
    for (const locale of locales) {
      const levelA = (Object.keys(SIGNALS) as SignalId[])
        .filter((id) => applies(id, locale) && SIGNALS[id].level === "A")
        .reduce((total, id) => total + SIGNALS[id].weight, 0);
      expect(levelA / budgetFor(locale), locale).toBeLessThanOrEqual(
        LEVEL_A_SHARE,
      );
    }
  });

  it("ni el peor texto forense posible llega a banda roja por sí solo", () => {
    for (const locale of locales) {
      expect(LEVEL_A_SHARE * 100, locale).toBeLessThan(BANDS[locale].rojo);
    }
  });

  it("el presupuesto inglés es menor porque una señal no aplica", () => {
    expect(budgetFor("en")).toBeLessThan(budgetFor("es"));
    expect(budgetFor("es") - budgetFor("en")).toBe(
      SIGNALS.apertura_interrogacion_perfecta.weight,
    );
  });

  it("la puntuación satura: no es lineal en el recuento", () => {
    expect(saturate(4, 4)).toBeGreaterThan(saturate(1, 4));
    expect(saturate(4, 4)).toBeLessThan(saturate(1, 4) * 4);
    expect(saturate(40, 4)).toBeLessThan(1);
    expect(saturate(0, 4)).toBe(0);
  });

  it("cada paso igual de densidad aporta menos que el anterior", () => {
    const step = (n: number) => saturate(n + 4, 4) - saturate(n, 4);
    expect(step(4)).toBeLessThan(step(0));
    expect(step(8)).toBeLessThan(step(4));
  });

  it("la densidad, no el recuento, es lo que satura", () => {
    const short = `${F.HUMANO_INFORMAL}\nUna frase — con raya espaciada.`;
    const long = `${F.HUMANO_INFORMAL}\n${F.MEXICO}\n${F.ARGENTINA}\nUna frase — con raya espaciada.`;
    const value = (t: string) =>
      analyze(t, "es").signals.find((s) => s.id === "raya_espaciada")!
        .saturated;
    expect(value(long)).toBeLessThan(value(short));
  });
});

describe("agregación por ventanas", () => {
  it("un pico aislado cuesta mucho menos que un texto uniformemente regular", () => {
    const uniform = Array(12).fill(48);
    const spike = [0, 0, 50, 48, 44, 0, 0, 0, 0, 0, 0, 0];
    expect(aggregate(uniform)).toBeGreaterThan(aggregate(spike) + 20);
  });

  it("no ignora el tercio alto: un mixto puntúa por encima de su media", () => {
    const mixed = [0, 0, 0, 0, 0, 0, 48, 48, 48];
    const mean = mixed.reduce((a, b) => a + b, 0) / mixed.length;
    expect(aggregate(mixed)).toBeGreaterThan(mean);
  });

  it("devuelve cero sin ventanas", () => {
    expect(aggregate([])).toBe(0);
  });
});

describe("bandas", () => {
  it("mapea el índice sobre los umbrales de cada idioma", () => {
    for (const locale of locales) {
      const { amarillo, rojo } = BANDS[locale];
      expect(bandFor(rojo, locale)).toBe("rojo");
      expect(bandFor(amarillo, locale)).toBe("amarillo");
      expect(bandFor(amarillo - 1, locale)).toBe("verde");
      expect(bandFor(rojo - 1, locale)).toBe("amarillo");
      expect(bandFor(0, locale)).toBe("verde");
    }
  });

  it("el tope por falta de corroboración cae justo debajo de amarillo", () => {
    for (const locale of locales) {
      expect(bandFor(BANDS[locale].amarillo - 1, locale)).toBe("verde");
    }
    expect(CORROBORATION).toBeGreaterThan(0);
  });
});

describe("contrato del resultado", () => {
  const r = analyze(F.GENERADO_SIN_EDITAR, "es");

  it("expone versión, fase e idioma medido", () => {
    expect(r.phase).toBe(1);
    expect(r.locale).toBe("es");
    expect(r.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("no expone porcentaje calibrado ni mapa por frase en la fase 1", () => {
    expect(r.calibrated).toBeUndefined();
    expect(r.sentences).toBeUndefined();
  });

  it("ordena las señales por contribución, de mayor a menor", () => {
    const contributions = r.signals.map((s) => s.contribution);
    expect([...contributions].sort((a, b) => b - a)).toEqual(contributions);
  });

  it("da a cada señal identificador, peso, densidad y valores", () => {
    for (const s of r.signals) {
      expect(SIGNALS[s.id]).toBeDefined();
      expect(s.weight).toBe(SIGNALS[s.id].weight);
      expect(Number.isFinite(s.density)).toBe(true);
      expect(s.saturated).toBeGreaterThanOrEqual(0);
      expect(s.saturated).toBeLessThanOrEqual(1);
      expect(s.contribution).toBeCloseTo(s.weight * s.saturated, 6);
      expect(s.values).toBeTypeOf("object");
    }
  });

  it("no lleva texto: la explicación es una clave más sus medidas", () => {
    // The engine used to build Spanish sentences itself, which is why a
    // second language would have meant a second engine. `samples` are
    // excerpts of the user's own text and are meant to carry it.
    for (const s of r.signals) {
      const measured = { ...s, samples: undefined };
      expect(JSON.stringify(measured), s.id).not.toMatch(/[áéíóúñ]/);
    }
  });

  it("cada ventana lleva su rango de frases y su propia banda", () => {
    for (const w of r.windows) {
      const [from, to] = w.sentenceRange;
      expect(from).toBeGreaterThanOrEqual(0);
      expect(to).toBeGreaterThanOrEqual(from);
      expect(to).toBeLessThan(r.sentenceCount);
      expect(w.band).toBe(bandFor(w.score, "es"));
    }
  });
});

describe("las señales se pueden redactar en los dos idiomas", () => {
  // Every signal the engine can emit must have a label and an explanation in
  // both catalogues, and the explanation must accept the values the engine
  // actually sends. A missing one renders a raw key path at the user.
  const catalogues = { es, en };

  for (const locale of locales) {
    it(`${locale}: cada señal tiene etiqueta y explicación redactables`, () => {
      const t = createTranslator({
        locale,
        messages: catalogues[locale],
        namespace: "detectorSignals",
      }) as unknown as (
        key: string,
        values?: Record<string, string | number>,
      ) => string;

      const fixture =
        locale === "es" ? F.GENERADO_SIN_EDITAR : F.GENERATED_UNEDITED;
      const emitted = analyze(fixture, locale).signals;
      expect(emitted.length).toBeGreaterThan(3);

      for (const signal of emitted) {
        expect(t(`${signal.id}.label`).length, signal.id).toBeGreaterThan(3);
        const text = t(`${signal.id}.explanation`, signal.values);
        expect(text.length, signal.id).toBeGreaterThan(20);
        // An unresolved placeholder is how a missing value shows up.
        expect(text, signal.id).not.toMatch(/\{\w+\}/);
      }
    });
  }
});

describe("entradas degeneradas", () => {
  it("no revienta con nada, con signos sueltos ni con espacios", () => {
    for (const locale of locales) {
      for (const input of ["", "a", "...", "     x     ", "¿?", "​"]) {
        const r = analyze(input, locale);
        expect(Number.isFinite(r.score)).toBe(true);
        expect(r.score).toBeGreaterThanOrEqual(0);
        expect(r.band).toBe("gris");
      }
    }
  });
});
