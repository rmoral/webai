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
  /**
   * Mode preselected in the UI. Declared rather than derived from the
   * order of `modes`, which only ever matched the humanizer by accident.
   */
  defaultMode?: string;
  /**
   * Whether the tool has a working endpoint. The UI reads this to disable
   * tabs and cards, so "is it built yet?" is answered in exactly one place.
   */
  live: boolean;
  /**
   * Whether the marketing landing for this tool is published. A tool can
   * have a landing before it has an endpoint, so navigation links to a real
   * page instead of a 404.
   */
  landing: boolean;
}

export const TOOLS: Record<ToolId, ToolDefinition> = {
  humanize: {
    id: "humanize",
    name: "Humanizador",
    path: "/humanizador-de-texto-ia",
    minPlan: "anonymous",
    modes: ["academico", "neutro", "informal"],
    defaultMode: "neutro",
    live: true,
    landing: true,
  },
  detect: {
    id: "detect",
    name: "Detector de IA",
    path: "/detector-de-ia",
    minPlan: "anonymous",
    modes: [],
    live: true,
    landing: true,
  },
  paraphrase: {
    id: "paraphrase",
    name: "Parafraseador",
    path: "/parafrasear-texto",
    minPlan: "anonymous",
    modes: ["estandar", "fluido", "formal", "simple", "creativo", "academico"],
    defaultMode: "estandar",
    live: true,
    landing: true,
  },
  correct: {
    id: "correct",
    name: "Corrector",
    path: "/corrector-ortografico-gramatical",
    minPlan: "anonymous",
    modes: ["general", "academico"],
    defaultMode: "general",
    live: true,
    landing: true,
  },
};

export function getTool(id: string): ToolDefinition | undefined {
  return TOOLS[id as ToolId];
}

/**
 * The mode that applies to a tool, given whatever the user last picked.
 *
 * The editor keeps one mode across tools -- switching tool inside /app is a
 * query-param navigation, so the component is reused and its state survives.
 * A mode from the previous tool is not valid for the new one, and the server
 * rejects the request as malformed, which reads as "Petición no válida" for
 * a tool the user has not configured at all. Resolving here means an
 * impossible mode cannot be sent whatever the state history, and the editor
 * and the server agree on the default because both come from this registry.
 */
export function resolveMode(id: ToolId, chosen?: string): string | undefined {
  const { modes, defaultMode } = TOOLS[id];
  if (chosen && (modes as readonly string[]).includes(chosen)) return chosen;
  return defaultMode ?? modes[0];
}
