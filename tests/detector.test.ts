import { describe, expect, it } from "vitest";

import * as F from "@/lib/ai/detector/fixtures";
import { forensicSignals } from "@/lib/ai/detector/forensic";
import { analyze } from "@/lib/ai/detector/pipeline";
import { aggregate, bandFor, saturate } from "@/lib/ai/detector/scoring";
import {
  asRaw,
  normalize,
  splitSentences,
  words,
} from "@/lib/ai/detector/segment";
import {
  BANDS,
  LEVEL_A_BUDGET,
  RELIABILITY,
  SIGNALS,
  TOTAL_BUDGET,
} from "@/lib/ai/detector/weights";

// Phase 1 of the architecture doc. The absolute scores are hand-calibrated
// against lib/ai/detector/fixtures.ts, so the assertions here are on bands,
// orderings and invariants -- never on a bare number that a legitimate
// recalibration would move. Where a number is pinned it is a threshold from
// weights.ts, so turning it is a deliberate edit in one place.

describe("segmentación", () => {
  it("corta frases en los terminadores del español", () => {
    expect(splitSentences(asRaw("Uno. Dos. Tres."))).toHaveLength(3);
  });

  it("mantiene enteras las frases con ¿? y ¡!", () => {
    const s = splitSentences(asRaw("¿Vienes? ¡Claro que sí! Nos vemos luego."));
    expect(s).toHaveLength(3);
    expect(s[0]).toBe("¿Vienes?");
  });

  it("no corta en las abreviaturas habituales", () => {
    expect(splitSentences(asRaw("Lo dijo el Dr. Ramírez ayer."))).toHaveLength(
      1,
    );
  });
});

describe("casos reales del corpus de calibración", () => {
  it("texto generado sin editar: rojo", () => {
    const r = analyze(F.GENERADO_SIN_EDITAR);
    expect(r.reliable).toBe(true);
    expect(r.band).toBe("rojo");
  });

  it("humano formal académico: verde, que es el falso positivo caro", () => {
    // El error que este producto no puede cometer. Ver la nota sobre
    // BANDS en weights.ts: el margen que da el corpus son diez puntos.
    const r = analyze(F.HUMANO_ACADEMICO);
    expect(r.band).toBe("verde");
    expect(r.score).toBeLessThan(BANDS.amarillo);
  });

  it("humano informal: verde", () => {
    expect(analyze(F.HUMANO_INFORMAL).band).toBe("verde");
  });

  it("español de México: verde", () => {
    expect(analyze(F.MEXICO).band).toBe("verde");
  });

  it("español de Argentina: verde", () => {
    expect(analyze(F.ARGENTINA).band).toBe("verde");
  });

  it("separa el generado de todo lo demás con margen utilizable", () => {
    const generado = analyze(F.GENERADO_SIN_EDITAR).score;
    for (const humano of [
      F.HUMANO_ACADEMICO,
      F.HUMANO_INFORMAL,
      F.MEXICO,
      F.ARGENTINA,
    ]) {
      expect(generado).toBeGreaterThan(analyze(humano).score + 20);
    }
  });

  it("no penaliza el español de América frente al peninsular", () => {
    // Un detector calibrado solo con español de España marca el voseo y el
    // léxico local. Estas dos muestras deben quedar por debajo del texto
    // académico peninsular, que es el humano más regular del corpus.
    const academico = analyze(F.HUMANO_ACADEMICO).score;
    expect(analyze(F.MEXICO).score).toBeLessThan(academico);
    expect(analyze(F.ARGENTINA).score).toBeLessThan(academico);
  });
});

describe("texto mixto", () => {
  // Caso normal: tres párrafos escritos y el cuarto generado. La Fase 1 no
  // lo caza en la banda del documento, y este test fija esa limitación en
  // lugar de dejarla como sorpresa en producción. Lo que sí hace es
  // localizarlo: las ventanas del bloque generado puntúan como el generado
  // puro, y son lo que la Fase 3 convertirá en mapa de calor.
  const r = analyze(F.MIXTO);

  it("localiza el bloque generado en las ventanas finales", () => {
    const mitad = Math.floor(r.windows.length / 2);
    const primeras = r.windows.slice(0, mitad).map((w) => w.score);
    const ultimas = r.windows.slice(mitad).map((w) => w.score);
    expect(Math.max(...ultimas)).toBeGreaterThan(Math.max(...primeras) + 20);
  });

  it("puntúa por encima del humano informal aunque no llegue a banda", () => {
    expect(r.score).toBeGreaterThan(analyze(F.HUMANO_INFORMAL).score);
  });
});

describe("umbral de fiabilidad", () => {
  it("responde gris por debajo del mínimo de palabras, sin banda de color", () => {
    const r = analyze(F.CORTO);
    expect(r.band).toBe("gris");
    expect(r.reliable).toBe(false);
    expect(r.reason).toBe("texto_corto");
    expect(r.words).toBeLessThan(RELIABILITY.minWords);
  });

  it("no inventa un número ni ventanas para una muestra corta", () => {
    const r = analyze(F.CORTO);
    expect(r.score).toBe(0);
    expect(r.windows).toEqual([]);
  });

  it("sigue reportando la evidencia forense, que no depende de la longitud", () => {
    // Un carácter invisible lo es a cualquier longitud. Lo que se retira es
    // la estadística de ritmo, no el hallazgo.
    const r = analyze("Un texto corto​ con un carácter invisible dentro.");
    expect(r.band).toBe("gris");
    expect(r.signals.some((s) => s.id === "caracteres_invisibles")).toBe(true);
    expect(r.signals.every((s) => s.level === "A")).toBe(true);
  });

  it("también responde gris si hay palabras pero faltan frases", () => {
    const unaSola = `${"palabra ".repeat(RELIABILITY.minWords + 10)}.`;
    const r = analyze(unaSola);
    expect(r.band).toBe("gris");
    expect(r.reason).toBe("frases_insuficientes");
  });
});

describe("captura forense sobre el texto en bruto", () => {
  // El orden del pipeline es una propiedad de tipos (forensicSignals solo
  // acepta RawText), pero lo que garantiza el contrato es este test: si
  // alguien normaliza antes, estos artefactos desaparecen y esto se cae.
  const conArtefactos = `Texto con raya espaciada — así, comillas curvas “así”,
un carácter invisible​, espacio duro aquí y **negrita de Markdown**.
Segunda frase para que haya algo que medir en el documento completo.`;

  it("ve la raya espaciada, las comillas curvas y el Markdown superviviente", () => {
    const wordCount = words(normalize(asRaw(conArtefactos))).length;
    const ids = forensicSignals(asRaw(conArtefactos), wordCount).map(
      (s) => s.id,
    );
    expect(ids).toContain("raya_espaciada");
    expect(ids).toContain("comillas_curvas");
    expect(ids).toContain("markdown_superviviente");
    expect(ids).toContain("caracteres_invisibles");
    expect(ids).toContain("espacios_especiales");
  });

  it("no ve nada de eso una vez normalizado el texto", () => {
    const limpio = normalize(asRaw(conArtefactos));
    const encontrado = forensicSignals(
      asRaw(limpio),
      words(limpio).length,
    ).filter((s) =>
      [
        "caracteres_invisibles",
        "espacios_especiales",
        "comillas_curvas",
      ].includes(s.id),
    );
    expect(encontrado).toEqual([]);
  });

  it("acompaña cada hallazgo con una explicación en español y su recuento", () => {
    const wordCount = words(normalize(asRaw(conArtefactos))).length;
    for (const s of forensicSignals(asRaw(conArtefactos), wordCount)) {
      expect(s.explanation.length).toBeGreaterThan(20);
      expect(s.count).toBeGreaterThan(0);
      expect(s.density).toBeGreaterThan(0);
    }
  });

  it("no dispara sobre texto humano limpio", () => {
    const r = analyze(F.HUMANO_INFORMAL);
    expect(r.signals.filter((s) => s.level === "A")).toEqual([]);
  });
});

describe("invariantes de puntuación", () => {
  it("el nivel A no puede pasar del 30 % de la puntuación", () => {
    expect(LEVEL_A_BUDGET / TOTAL_BUDGET).toBeLessThanOrEqual(0.3);
    const presupuestoA = Object.values(SIGNALS)
      .filter((s) => s.level === "A")
      .reduce((acc, s) => acc + s.weight, 0);
    expect(presupuestoA).toBeLessThanOrEqual(LEVEL_A_BUDGET);
  });

  it("los pesos declarados suman exactamente el presupuesto total", () => {
    const total = Object.values(SIGNALS).reduce((acc, s) => acc + s.weight, 0);
    expect(total).toBe(TOTAL_BUDGET);
  });

  it("ni el peor texto forense posible llega a banda roja por sí solo", () => {
    // Un texto lleno de artefactos y con ritmo humano no puede ser acusado
    // por los artefactos. La saturación al 100 % de todo el nivel A da 30.
    expect((LEVEL_A_BUDGET / TOTAL_BUDGET) * 100).toBeLessThan(BANDS.rojo);
  });

  it("la puntuación satura: no es lineal en el recuento", () => {
    // Cuatro rayas espaciadas valen bastante más que una y ni de lejos
    // cuatro veces más (doc de arquitectura §3.4).
    expect(saturate(4, 4)).toBeGreaterThan(saturate(1, 4));
    expect(saturate(4, 4)).toBeLessThan(saturate(1, 4) * 4);
    // Asíntota: se acerca a 1 y no lo alcanza. Muy arriba la resta cae por
    // debajo de la precisión del doble, así que se comprueba donde importa.
    expect(saturate(40, 4)).toBeLessThan(1);
    expect(saturate(0, 4)).toBe(0);
  });

  it("cada paso igual de densidad aporta menos que el anterior", () => {
    const paso = (n: number) => saturate(n + 4, 4) - saturate(n, 4);
    expect(paso(4)).toBeLessThan(paso(0));
    expect(paso(8)).toBeLessThan(paso(4));
  });

  it("la densidad, no el recuento, es lo que satura", () => {
    // Cuatro artefactos en 200 palabras y cuatro en 4.000 no son el mismo
    // hallazgo. El texto largo debe puntuar más bajo con el mismo recuento.
    const corto = `${F.HUMANO_INFORMAL}\nUna frase — con raya espaciada dentro.`;
    const largo = `${F.HUMANO_INFORMAL}\n${F.MEXICO}\n${F.ARGENTINA}\nUna frase — con raya espaciada dentro.`;
    const den = (t: string) =>
      analyze(t).signals.find((s) => s.id === "raya_espaciada")!.saturated;
    expect(den(largo)).toBeLessThan(den(corto));
  });
});

describe("agregación por ventanas", () => {
  it("un pico aislado cuesta mucho menos que un texto uniformemente regular", () => {
    // La diferencia entre un bloque generado y un tramo de frases humanas
    // inusualmente parejas no la da la altura del pico, sino cuánto del
    // texto se lee así. Ver la nota sobre AGGREGATION en weights.ts.
    const uniforme = Array(12).fill(48);
    const pico = [0, 0, 50, 48, 44, 0, 0, 0, 0, 0, 0, 0];
    expect(aggregate(uniforme)).toBeGreaterThan(aggregate(pico) + 20);
  });

  it("no ignora el tercio alto: un mixto puntúa por encima de su media", () => {
    const mixto = [0, 0, 0, 0, 0, 0, 48, 48, 48];
    const media = mixto.reduce((a, b) => a + b, 0) / mixto.length;
    expect(aggregate(mixto)).toBeGreaterThan(media);
  });

  it("devuelve cero sin ventanas", () => {
    expect(aggregate([])).toBe(0);
  });
});

describe("bandas", () => {
  it("mapea el índice sobre los umbrales de weights.ts", () => {
    expect(bandFor(BANDS.rojo)).toBe("rojo");
    expect(bandFor(BANDS.amarillo)).toBe("amarillo");
    expect(bandFor(BANDS.amarillo - 1)).toBe("verde");
    expect(bandFor(0)).toBe("verde");
  });

  it("es asimétrica: justo por debajo del umbral se baja de banda", () => {
    expect(bandFor(BANDS.rojo - 1)).toBe("amarillo");
  });
});

describe("contrato del resultado", () => {
  const r = analyze(F.GENERADO_SIN_EDITAR);

  it("expone versión y fase, para que el cliente sepa qué está leyendo", () => {
    expect(r.phase).toBe(1);
    expect(r.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("no expone porcentaje calibrado ni mapa por frase en la fase 1", () => {
    // Los dos campos existen en el tipo y llegan en las fases 2 y 3. Que
    // estén ausentes aquí es lo que permite añadirlos sin romper nada.
    expect(r.calibrated).toBeUndefined();
    expect(r.sentences).toBeUndefined();
  });

  it("ordena las señales por contribución, de mayor a menor", () => {
    const contribuciones = r.signals.map((s) => s.contribution);
    expect([...contribuciones].sort((a, b) => b - a)).toEqual(contribuciones);
  });

  it("da a cada señal identificador, peso, recuento, densidad y explicación", () => {
    for (const s of r.signals) {
      expect(SIGNALS[s.id]).toBeDefined();
      expect(s.weight).toBe(SIGNALS[s.id].weight);
      expect(s.label.length).toBeGreaterThan(0);
      expect(s.explanation.length).toBeGreaterThan(20);
      expect(Number.isFinite(s.density)).toBe(true);
      expect(s.saturated).toBeGreaterThanOrEqual(0);
      expect(s.saturated).toBeLessThanOrEqual(1);
      expect(s.contribution).toBeCloseTo(s.weight * s.saturated, 6);
    }
  });

  it("cada ventana lleva su rango de frases y su propia banda", () => {
    for (const w of r.windows) {
      const [desde, hasta] = w.sentenceRange;
      expect(desde).toBeGreaterThanOrEqual(0);
      expect(hasta).toBeGreaterThanOrEqual(desde);
      expect(hasta).toBeLessThan(r.sentenceCount);
      expect(w.band).toBe(bandFor(w.score));
    }
  });
});

describe("entradas degeneradas", () => {
  it("no revienta con nada, con signos sueltos ni con espacios", () => {
    for (const entrada of ["", "a", "...", "     x     ", "¿?", "​​"]) {
      const r = analyze(entrada);
      expect(Number.isFinite(r.score)).toBe(true);
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.band).toBe("gris");
    }
  });
});
