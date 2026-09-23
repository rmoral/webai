import * as React from "react";

/**
 * D5 · Inline invitation under an anonymous result (ticket C13).
 *
 * Shows when all of these hold:
 *   plan === "anonymous" · status === "done" · no wall B, no quota banner,
 *   no error on screen · localStorage `vbx:invite:dismissed` unset.
 *
 * «Ahora no» writes that key (localStorage, not sessionStorage: «no
 * reaparece» means across visits too) and swaps the card for a one-line
 * acknowledgement that disappears on the next run. It is not a modal and
 * it never covers the result.
 */
export interface SignupInviteProps {
  /** `PLANS.anonymous.limits.wordsPerDay`. */
  anonDaily?: number;
  /** `PLANS.free.limits.wordsPerDay`. */
  freeDaily?: number;
  /** Renders the acknowledgement line instead of the card. */
  dismissed?: boolean;
  /** Links to `/signup?next=<current path>`. */
  onSignup?: () => void;
  onDismiss?: () => void;
}

export declare function SignupInvite(props: SignupInviteProps): React.ReactElement;
