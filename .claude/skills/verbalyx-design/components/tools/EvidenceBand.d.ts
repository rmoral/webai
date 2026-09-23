import * as React from "react";

/**
 * Resultado del Detector de IA: **banda cualitativa más evidencias, nunca un
 * porcentaje.** La página del detector de verbalyx.ai dedica una sección
 * entera a explicar por qué una cifra "sería inventada"; este componente es
 * esa postura hecha interfaz.
 *
 * Sustituye a `ScoreGauge` (retirado el 19 de septiembre de 2026), que
 * pintaba un anillo con un tanto por ciento y contradecía al producto.
 */
export interface EvidenceFinding {
  /** El rasgo observado, en una frase ("Frases de longitud casi idéntica"). */
  label: string;
  /** `bad` señal de IA · `warn` a revisar · `good` rasgo humano. */
  tone: "good" | "warn" | "bad";
}

export interface EvidenceBandProps {
  /** `insufficient` cuando no se llega al mínimo de palabras o frases. */
  band?: "none" | "some" | "clear" | "insufficient";
  /** Los rasgos concretos. Sin ellos la banda sola no vale: el valor está aquí. */
  findings?: EvidenceFinding[];
  /** Sustituye el descargo por defecto. **Nunca lo quites.** */
  note?: React.ReactNode;
  /** Mínimos del detector: 200 palabras y 8 frases. */
  minWords?: number;
  minSentences?: number;
  /** Ranura final de la cabecera, p. ej. un botón "Ver detalle". */
  children?: React.ReactNode;
}

export declare function EvidenceBand(props: EvidenceBandProps): React.ReactElement;
