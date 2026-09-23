import * as React from "react";

/**
 * Formulario de pago EMBEBIDO. Verbalyx no redirige a una página de Stripe:
 * el usuario paga sin salir del sitio. En producción estos campos son un
 * Stripe Payment Element montado en el hueco de `.vbx-pay-card` — el aspecto
 * de aquí es la configuración visual que hay que pasarle a `appearance`.
 *
 * Los datos de la tarjeta nunca tocan nuestro servidor: el Element los envía
 * cifrados a Stripe y devuelve un PaymentMethod.
 */
export interface PaymentFormProps {
  /** Importe de hoy, ya formateado ("0,00 US$" en prueba). */
  amountToday?: string;
  /** Verbo del botón: "Empezar la prueba" | "Pagar". */
  payLabel?: string;
  /** Cambia la divulgación: prueba (no se cobra hoy) vs cobro inmediato. */
  trial?: boolean;
  /** Fecha del cargo, formateada en español. */
  chargeDate?: string;
  /** Importe del cargo futuro. */
  nextAmount?: string;
  email?: string;
  /** `processing` deshabilita todo y pone el spinner; `error` muestra el rechazo. */
  status?: "idle" | "processing" | "error";
  onPay?: () => void;
}

export declare function PaymentForm(props: PaymentFormProps): React.ReactElement;
