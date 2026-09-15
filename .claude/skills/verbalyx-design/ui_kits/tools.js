// Mirrors lib/ai/tools.ts. Hints are marketing-side one-liners.
export const TOOLS = [
  { id: "humanize", label: "Humanizador", hint: "Que suene a persona", path: "/humanizador-de-texto-ia", live: true, modes: ["academico", "neutro", "informal"] },
  { id: "detect", label: "Detector de IA", hint: "Mide antes de entregar", path: "/detector-de-ia", live: false, modes: [] },
  { id: "paraphrase", label: "Parafraseador", hint: "Seis registros", path: "/parafrasear-texto", live: false, modes: ["estandar", "fluido", "formal", "simple", "creativo", "academico"] },
  { id: "correct", label: "Corrector", hint: "Ortografía y gramática", path: "/corrector-ortografico-gramatical", live: false, modes: ["general", "academico"] },
];
