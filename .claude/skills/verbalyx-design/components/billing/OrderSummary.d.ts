import * as React from "react";

/**
 * Resumen del pedido: plan, ciclo, qué incluye y el desglose hasta
 * "Hoy pagas". Lo comparten la página `/checkout` y el pago en contexto
 * que se abre desde el muro, para que el usuario vea exactamente lo mismo
 * en los dos sitios.
 */
export interface OrderSummaryProps {
  plan?: "unlimited" | "pro";
  cycle?: "monthly" | "yearly";
  /** Si se pasa, se muestran los radios de ciclo. Omítelo para un resumen fijo. */
  onCycle?: (cycle: string) => void;
  /** Oculta la lista de "qué incluye" — para el pago dentro del muro. */
  compact?: boolean;
}

export declare function OrderSummary(props: OrderSummaryProps): React.ReactElement;

/** Precios, fechas e importes por plan y ciclo. Única fuente de la maqueta. */
export declare const CYCLES: Record<string, {
  name: string;
  includes: string[];
  options: Array<{
    id: string; title: string; note: string;
    today: string; full: string; next: string; date: string; trial: boolean;
  }>;
}>;
