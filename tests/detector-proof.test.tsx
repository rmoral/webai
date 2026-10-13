import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";

import es from "@/messages/es.json";
import { DetectorProof } from "@/components/marketing/detector-proof";
import { DETECTOR_PROOF } from "@/lib/proof/detectors";

// F1-07. The block ships before its figures do, so the case that matters
// most is the empty one: nothing on the page, not an empty frame.

function render(node: React.ReactNode) {
  return renderToStaticMarkup(
    <NextIntlClientProvider locale="es" messages={es} timeZone="Europe/Madrid">
      {node}
    </NextIntlClientProvider>,
  );
}

const SAMPLE = {
  testedAt: "2026-10-01",
  methodologyUrl: "/metodologia",
  results: [{ name: "GPTZero", humanPct: 94 }],
};

describe("DetectorProof", () => {
  it("ships with no figures, so nobody reads one we have not measured", () => {
    expect(DETECTOR_PROOF.results).toEqual([]);
  });

  it("renders nothing without results, in either variant", () => {
    expect(render(<DetectorProof variant="block" />)).toBe("");
    expect(render(<DetectorProof variant="row" />)).toBe("");
  });

  it("names each ring for a screen reader", () => {
    const html = render(<DetectorProof variant="block" data={SAMPLE} />);
    expect(html).toContain('aria-label="GPTZero: 94 % humano"');
    expect(html).toContain('href="/metodologia"');
    expect(html).toContain("1 de octubre de 2026");
  });

  it("fits the paywall in one line of text", () => {
    const html = render(<DetectorProof variant="row" data={SAMPLE} />);
    expect(html).toContain("Probado con:");
    expect(html).not.toContain("<svg");
  });
});
