import * as React from "react";

/**
 * D4 · /registro and /login (ticket C10). Same component, two routes.
 *
 * - Direct sign-up: the headline promises only what the product delivers
 *   («500 palabras al día»). The «historial de sesión» promise on main is
 *   gone: history is a paid feature.
 * - Coming from a plan (`next=/checkout?plan=…&cycle=…`): headline «Primero,
 *   tu cuenta. Después, el pago.», steps 1–2 in the top bar and the chosen
 *   plan beside the form (a compact strip above it on mobile). The free-plan
 *   benefits and «tu texto sigue en el editor» are hidden: they are not
 *   why this visitor is here.
 * - Google is first, full width, 48px, with the standard G. Email is second.
 * - Legal copy links to the terms and the privacy policy.
 * - No extra fields, no marketing checkbox.
 */
export interface AuthPageProps {
  mode?: "registro" | "login";
  /** Only when `next` points back at an editor. */
  keptText?: boolean;
  /** Plan parsed from `next`. null = direct sign-up. */
  plan?: null | "unlimited-monthly" | "unlimited-yearly" | "pro-monthly" | "pro-yearly";
  /** Opens on the «enlace enviado» state (specimens). */
  initialSent?: boolean;
  initialEmail?: string;
  onSwitch?: () => void;
  onDone?: () => void;
  /** Back to /precios with the same cycle. */
  onChangePlan?: () => void;
}

export declare function AuthPage(props: AuthPageProps): React.ReactElement;
