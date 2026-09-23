import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import {
  AnonymousOnly,
  ViewerContext,
  type Viewer,
} from "@/components/marketing/viewer";

// C12 -- what a prerendered page may say about a reader it has not met.
//
// The rule that matters is which way it errs: the free account is the main
// call to action on these pages, and the HTML crawlers read is the HTML
// rendered before any session is known. Hiding the offer until JavaScript
// has answered would hide it from the search results the pages exist for.

function render(viewer: Viewer | undefined) {
  return renderToStaticMarkup(
    <ViewerContext.Provider value={viewer}>
      <AnonymousOnly>
        {/* A stand-in for the footer's link. What is asserted is whether
            the children render at all, not what they are. */}
        <span>Crear cuenta gratis</span>
      </AnonymousOnly>
    </ViewerContext.Provider>,
  );
}

const ANON: Viewer = { signedIn: false, plan: "anonymous", allowance: null };

describe("AnonymousOnly", () => {
  it("keeps the offer in the prerendered HTML", () => {
    // undefined is the state the server renders in, and the one a browser
    // is in for the first moment of every visit.
    expect(render(undefined)).toContain("Crear cuenta gratis");
  });

  it("keeps it for a reader with no account", () => {
    expect(render(ANON)).toContain("Crear cuenta gratis");
  });

  it("stops offering an account to somebody who has one", () => {
    // The footer went on selling the free account to customers, on every
    // page of the site, long after the header had stopped.
    expect(render({ ...ANON, signedIn: true, plan: "pro" })).toBe("");
  });
});
