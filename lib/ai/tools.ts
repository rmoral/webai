import type { PlanId } from "@/lib/billing/plans";

// Registry of AI tools. Adding a tool here is the only place where
// its name, limits and minimum plan are defined.

export type ToolId = "humanize" | "detect" | "paraphrase" | "correct";

export interface ToolDefinition {
  id: ToolId;
  /** UI name, in Spanish. */
  name: string;
  /** Marketing landing path. */
  path: string;
  /** Minimum plan required to use the tool at all. */
  minPlan: PlanId;
  /** Modes the tool accepts (empty = no modes). */
  modes: readonly string[];
}

export const TOOLS: Record<ToolId, ToolDefinition> = {
  humanize: {
    id: "humanize",
    name: "Humanizador",
    path: "/humanizador-de-texto-ia",
    minPlan: "anonymous",
    modes: ["academico", "neutro", "informal"],
  },
  detect: {
    id: "detect",
    name: "Detector de IA",
    path: "/detector-de-ia",
    minPlan: "anonymous",
    modes: [],
  },
  paraphrase: {
    id: "paraphrase",
    name: "Parafraseador",
    path: "/parafrasear-texto",
    minPlan: "anonymous",
    modes: ["estandar", "fluido", "formal", "simple", "creativo", "academico"],
  },
  correct: {
    id: "correct",
    name: "Corrector",
    path: "/corrector-ortografico-gramatical",
    minPlan: "anonymous",
    modes: ["general", "academico"],
  },
};

export function getTool(id: string): ToolDefinition | undefined {
  return TOOLS[id as ToolId];
}
