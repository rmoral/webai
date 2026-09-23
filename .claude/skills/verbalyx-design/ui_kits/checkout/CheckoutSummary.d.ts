import * as React from "react";

/**
 * Página de pago (`/checkout`). **No es una antesala de Stripe Checkout**:
 * el cobro ocurre aquí, con un Stripe Payment Element embebido en el panel
 * derecho. Resumen y ciclo a la izquierda, pago a la derecha.
 */
export interface CheckoutSummaryProps {
  plan?: "unlimited" | "pro";
  /** El trial solo existe en `monthly` de Ilimitado. */
  initialCycle?: "monthly" | "yearly";
  onBack?: () => void;
  /** Se llama tras un pago correcto; lleva a la confirmación. */
  onPaid?: () => void;
}

export declare function CheckoutSummary(props: CheckoutSummaryProps): React.ReactElement;
