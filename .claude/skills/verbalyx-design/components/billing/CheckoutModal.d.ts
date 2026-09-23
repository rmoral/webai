import * as React from "react";

/**
 * Pago en contexto: se abre desde el CTA primario del muro y cobra sin sacar
 * al usuario del editor. Resumen compacto arriba, `PaymentForm` debajo y
 * estado de éxito dentro del mismo modal — nunca una redirección.
 *
 * Su razón de ser: el texto del usuario sigue en pantalla detrás. Mandarlo a
 * un dominio de pago externo justo después de enseñarle su resultado a medias
 * es donde se pierde la conversión.
 */
export interface CheckoutModalProps {
  plan?: "unlimited" | "pro";
  /** Ya viene decidido desde precios o desde el muro; aquí no se cambia. */
  cycle?: "monthly" | "yearly";
  fixed?: boolean;
  /** Vuelve al muro que lo abrió. */
  onBack?: () => void;
  onDismiss?: () => void;
  /** Tras el pago: devolver al usuario exactamente donde estaba. */
  onDone?: () => void;
}

export declare function CheckoutModal(props: CheckoutModalProps): React.ReactElement;
