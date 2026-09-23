"use client";

import { useEffect, useState } from "react";

import { ViewerContext, type Viewer } from "@/components/marketing/viewer";
import { createClient } from "@/lib/auth/client";

// Kept apart from the context it fills, because this is the only file that
// needs the Supabase client. Merged into one module, every component that
// reads the viewer -- the tab strip, the editor -- dragged the auth library
// into its own bundle, and the landings are the pages that have to be fast.

export function ViewerProvider({ children }: { children: React.ReactNode }) {
  const [viewer, setViewer] = useState<Viewer | undefined>(undefined);

  useEffect(() => {
    let active = true;
    const anonymous = { signedIn: false, plan: "anonymous", allowance: null };

    // Wrapped around the client's construction as well as the call:
    // `createClient` throws synchronously when the Supabase keys are
    // missing, and a throw inside an effect unmounts the tree above it --
    // which on these pages is the whole page.
    try {
      createClient()
        .auth.getSession()
        .then(({ data }) => {
          if (!active) return;
          if (!data.session) {
            setViewer(anonymous as Viewer);
            return;
          }
          // There is an account; which plan is a second question, and the
          // free tier is the safe answer until the server says otherwise.
          setViewer({ signedIn: true, plan: "free", allowance: null });
          return fetch("/api/usage", { cache: "no-store" })
            .then((res) => (res.ok ? res.json() : null))
            .then((usage) => {
              if (!active || !usage) return;
              setViewer({
                signedIn: true,
                plan:
                  usage.plan === "pro" || usage.plan === "unlimited"
                    ? usage.plan
                    : "free",
                allowance: typeof usage.remaining === "number" ? usage : null,
              });
            })
            .catch(() => {});
        })
        .catch(() => active && setViewer(anonymous as Viewer));
    } catch {
      setViewer(anonymous as Viewer);
    }

    return () => {
      active = false;
    };
  }, []);

  return (
    <ViewerContext.Provider value={viewer}>{children}</ViewerContext.Provider>
  );
}
