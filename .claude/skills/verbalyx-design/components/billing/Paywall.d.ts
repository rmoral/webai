import * as React from "react";

/**
 * Muro de pago de Verbalyx. Un componente, cinco disparadores
 * (REGISTRO_Y_PAYWALL_ESTUDIO.md §4.2). Nunca se abre en frío: siempre
 * responde a una acción del usuario.
 *
 * Cada disparador tiene una forma distinta a propósito:
 * `overflow` es una barra dentro del editor, `feature` un popover anclado,
 * `trialEnd` una pantalla completa, y `quota`/`tool` modales.
 */
export interface PaywallProps {
  /** A `overflow` · B `quota` · C `tool` · D `feature` · E `trialEnd`. */
  trigger?: "overflow" | "quota" | "tool" | "feature" | "trialEnd";
  /** Cambia el CTA secundario de B: anónimo → crear cuenta; registrado → ver Pro. */
  account?: "anonymous" | "free" | "pro";
  usedToday?: number;
  /** 300 anónimo, 500 con cuenta gratis. */
  limitToday?: number;
  /** A: palabras que el usuario intentó pegar. */
  attempted?: number;
  /** A: tope por petición del plan actual (300 gratis, 3.000 Pro, 8.000 Ilimitado). */
  perRequest?: number;
  /** C: herramienta bloqueada, en español ("Parafraseador"). */
  toolName?: string;
  /** D: función bloqueada, en minúscula ("historial", "desglose por pasajes"). */
  featureName?: string;
  /**
   * B: resultado REAL ya procesado. Los primeros ~210 caracteres nítidos y el
   * resto difuminado. Nunca un placeholder: el usuario debe ver su texto.
   */
  partialResult?: string;
  /** Fecha del primer cobro, ya calculada y formateada en español. */
  chargeDate?: string;
  /** D: posición del popover respecto al contenedor anclado. */
  popoverStyle?: React.CSSProperties;
  /** `true` en producción (position:fixed). `false` para incrustarlo en una ficha. */
  fixed?: boolean;
  /** Cierra. En E es "Cancelar mi suscripción", no un descarte. */
  onDismiss?: () => void;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

export declare function Paywall(props: PaywallProps): React.ReactElement;
