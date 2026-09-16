import { describe, expect, it } from "vitest";

import { analyze, bandFor, splitSentences } from "@/lib/ai/detector/features";

// Prose with irregular rhythm, varied punctuation and no formulaic filler.
const HUMAN = `Llegué tarde. El tren, que salía a las siete, se había ido sin
mí y en la estación no quedaba nadie salvo un hombre que barría el andén con
una parsimonia casi ofensiva. ¿Qué se hace en un sitio así a esas horas?
Nada. Me senté. Saqué el cuaderno —el pequeño, el de tapas rojas— y escribí
tres líneas que al día siguiente me parecieron ridículas; las taché todas.
Luego vino el frío, que en marzo todavía muerde, y con el frío una idea:
podía volver andando. Eran once kilómetros. Los hice en dos horas y media y
llegué con las botas empapadas, pero llegué. Mi madre no preguntó nada;
sirvió la cena y puso el telediario, que era su manera de preguntarlo todo.
Comí despacio. Aquella noche soñé con andenes vacíos y con un hombre que
barría sin parar, y al despertarme seguía teniendo los pies helados.`;

// Flat rhythm, formulaic connectives, plain punctuation.
const MACHINE = `Es importante destacar que la lectura desempeña un papel
fundamental en el desarrollo personal. Además, la lectura permite ampliar el
vocabulario de forma significativa. Por otro lado, la lectura mejora la
capacidad de concentración de las personas. En este sentido, la lectura
resulta esencial para el crecimiento intelectual. Asimismo, la lectura
contribuye a desarrollar el pensamiento crítico de forma notable. Cabe
destacar que la lectura favorece la empatía entre las personas. Por lo tanto,
la lectura constituye una herramienta muy valiosa. En este sentido, la lectura
amplía la perspectiva cultural de quien la practica. De esta manera, la lectura
enriquece la vida cotidiana de forma constante. Cabe mencionar que la lectura
estimula la imaginación de manera considerable. Por otra parte, la lectura
fortalece la memoria de quienes la practican. En conclusión, la lectura
es fundamental para el desarrollo humano completo.`;

describe("splitSentences", () => {
  it("splits on Spanish terminators", () => {
    expect(splitSentences("Uno. Dos. Tres.")).toHaveLength(3);
  });

  it("keeps ¿? and ¡! sentences whole", () => {
    const s = splitSentences("¿Vienes? ¡Claro que sí! Nos vemos luego.");
    expect(s).toHaveLength(3);
    expect(s[0]).toBe("¿Vienes?");
  });

  it("does not split on common abbreviations", () => {
    expect(splitSentences("Lo dijo el Dr. Ramírez ayer.")).toHaveLength(1);
  });
});

describe("bandFor", () => {
  it("maps the index onto the three bands", () => {
    expect(bandFor(10)).toBe("bajo");
    expect(bandFor(50)).toBe("medio");
    expect(bandFor(80)).toBe("alto");
  });

  it("errs toward 'bajo' rather than risking a false accusation", () => {
    expect(bandFor(44)).toBe("bajo");
    expect(bandFor(74)).toBe("medio");
  });
});

describe("analyze", () => {
  it("scores formulaic text above human prose", () => {
    // The absolute values are not a probability and are not asserted; what
    // has to hold is the ordering.
    expect(analyze(MACHINE).index).toBeGreaterThan(analyze(HUMAN).index);
  });

  it("flags every signal in the direction expected for machine text", () => {
    const machine = analyze(MACHINE);
    const human = analyze(HUMAN);
    for (const id of ["uniformidad", "conectores", "puntuacion"] as const) {
      const m = machine.signals.find((s) => s.id === id)!.score;
      const h = human.signals.find((s) => s.id === id)!.score;
      expect(m, `signal ${id}`).toBeGreaterThan(h);
    }
  });

  it("returns all four signals with bounded scores and a detail string", () => {
    const { signals } = analyze(HUMAN);
    expect(signals).toHaveLength(4);
    for (const s of signals) {
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqual(1);
      expect(s.detail.length).toBeGreaterThan(0);
    }
  });

  it("marks short samples unreliable so the UI cannot show a band", () => {
    expect(analyze("Un texto muy corto. Nada más.").reliable).toBe(false);
    expect(analyze(MACHINE).reliable).toBe(true);
    expect(analyze(HUMAN).reliable).toBe(true);
  });

  it("withholds the per-sentence breakdown unless asked for it", () => {
    expect(analyze(MACHINE).sentences).toBeUndefined();
    expect(analyze(MACHINE, { withSentences: true }).sentences?.length).toBe(
      splitSentences(MACHINE).length,
    );
  });

  it("does not produce a per-sentence breakdown for unreliable samples", () => {
    expect(
      analyze("Corto.", { withSentences: true }).sentences,
    ).toBeUndefined();
  });

  it("survives degenerate input without throwing", () => {
    for (const input of ["a", "...", "     x     ", "¿?"]) {
      const r = analyze(input);
      expect(Number.isFinite(r.index)).toBe(true);
      expect(r.index).toBeGreaterThanOrEqual(0);
      expect(r.index).toBeLessThanOrEqual(100);
    }
  });
});

// Generated prose that does not use the assistant register: a careful
// academic voice, with varied sentence lengths and rich punctuation. Every
// signal this engine measures reads human here.
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

describe("what these signals cannot see", () => {
  it("reads generated prose outside the assistant register as human", () => {
    // Measured, not assumed: this text is generated, and the engine puts it
    // in "bajo". It is here so the limitation is a fact in the suite rather
    // than a surprise in production, and so that raising sensitivity has to
    // be a deliberate decision that updates this test.
    //
    // The signals recognise the formulaic chatbot voice. Narrative,
    // commercial and careful academic generation do not trip them: the
    // rhythm varies, the filler connectives are absent and the punctuation
    // is rich. Closing this gap needs a different method, not new thresholds.
    const result = analyze(MACHINE_WELL_WRITTEN);
    expect(result.reliable).toBe(true);
    expect(result.band).toBe("bajo");
  });

  it("still separates the register it was built for", () => {
    // The engine is not broken; its coverage is narrow. Keeping both facts
    // pinned stops a fix for one from quietly undoing the other.
    expect(analyze(MACHINE).index).toBeGreaterThan(
      analyze(MACHINE_WELL_WRITTEN).index + 40,
    );
  });
});
