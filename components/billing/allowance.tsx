"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Allowance } from "@/lib/usage/quotas";

// The allowance, shared by every surface that shows it.
//
// There were three counters and they disagreed in public: the header read
// a server render that never refreshed and said "0 / 500" until a reload,
// the wall read the last response and said "300 / 500 agotado", and the
// account page summed a different table and said "Hoy: 600" -- above the
// limit it was supposedly measuring. Three numbers, one allowance.
//
// This is the client half: the server renders the first value and every
// answer from the tool endpoint carries the next one, so the figure moves
// the moment it changes rather than at the next navigation. No polling --
// the number only ever changes because of a request the editor just made.

interface Store {
  allowance: Allowance | null;
  /** Called by the editor with what the response headers just said. */
  report: (next: Allowance) => void;
}

const AllowanceContext = createContext<Store | null>(null);

export function AllowanceProvider({
  initial,
  children,
}: {
  initial: Allowance | null;
  children: React.ReactNode;
}) {
  const [allowance, setAllowance] = useState(initial);
  const report = useCallback((next: Allowance) => setAllowance(next), []);
  const value = useMemo(() => ({ allowance, report }), [allowance, report]);

  return (
    <AllowanceContext.Provider value={value}>
      {children}
    </AllowanceContext.Provider>
  );
}

/**
 * The allowance, and a way to update it.
 *
 * Works outside a provider, where `report` does nothing and `allowance` is
 * null: the editor also runs on the marketing pages, which have no header
 * and no session, and a hook that throws there would take the tool with
 * it.
 */
export function useAllowance(): Store {
  return useContext(AllowanceContext) ?? { allowance: null, report: () => {} };
}
