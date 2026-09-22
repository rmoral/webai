"use client";

import { useState } from "react";

import { TrialEndWall } from "@/components/billing/trial-end";

/**
 * Shows wall E once, on entering the app on the last day of the trial.
 *
 * The decision of whether the trial is ending is the server's -- it holds
 * `trial_end`, mirrored from Stripe by the webhook. This only holds the
 * "already answered it" state, so choosing "stay on Unlimited" does not
 * re-prompt on every navigation within the same visit.
 *
 * Deliberately not remembered across sessions. Wall E is the one wall that
 * is exempt from the dismiss-once rule: until the trial actually resolves,
 * somebody who opens the app is somebody who has not yet been told they
 * are about to be charged.
 */
export function TrialEndGate() {
  const [settled, setSettled] = useState(false);
  if (settled) return null;
  return <TrialEndWall onSettled={() => setSettled(true)} />;
}
