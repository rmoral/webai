"use client";

import { createContext, useContext } from "react";

import type { PlanId } from "@/lib/billing/plans";
import type { Allowance } from "@/lib/usage/quotas";

// Who is reading a static page.
//
// The marketing pages are prerendered for SEO, so the server that built
// them knew nothing about the reader. Every surface on them that depended
// on that answer guessed the same way -- anonymous -- and guessed wrong for
// the people who had already paid: the footer went on offering a free
// account, the editor offered one too, and the tab strip marked as "Pro"
// the tools they were paying for.
//
// Resolved once per page, here, rather than four times in four components.
// `getSession` reads the token the browser already holds, so an anonymous
// visit -- which is nearly all of them -- costs no request at all. Only a
// reader with a session asks the server anything, and asks once.

export interface Viewer {
  /** Whether there is an account behind this reader. */
  signedIn: boolean;
  /** Their plan. Anonymous until proven otherwise. */
  plan: PlanId;
  /** The allowance that came with the plan, when it was asked for. */
  allowance: Allowance | null;
}

export const ViewerContext = createContext<Viewer | undefined>(undefined);

/**
 * The reader, or undefined while the browser is still answering.
 *
 * Undefined outside a provider as well, which is the signed-in area: there
 * the server knows the answer and passes it down, and a component that
 * reads this must fall back to what it was given rather than guess.
 */
export function useViewer(): Viewer | undefined {
  return useContext(ViewerContext);
}

/**
 * Shows its children to a reader without an account, and to crawlers.
 *
 * While the session is unresolved -- which is what the prerendered HTML
 * contains -- the offer stands. That is deliberate: the free account is
 * the page's main call to action, and hiding it until JavaScript has run
 * would hide it from the search results these pages exist to win.
 */
export function AnonymousOnly({ children }: { children: React.ReactNode }) {
  return useViewer()?.signedIn ? null : children;
}
