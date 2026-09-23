import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";

import es from "@/messages/es.json";
import { UsageMeter, type MeterProps } from "@/components/billing/usage-meter";
import { PLANS } from "@/lib/billing/plans";

// D1 -- the balance block of the /app header.
//
// It is the only place that tells somebody what they have left, when it
// comes back and what the next plan would give, so the five states are
// worth pinning down. Rendered statically: the effects do not run, which
// is exactly the markup a visitor sees before hydration.

function render(props: MeterProps) {
  return renderToStaticMarkup(
    <NextIntlClientProvider locale="es" messages={es} timeZone="Europe/Madrid">
      <UsageMeter {...props} />
    </NextIntlClientProvider>,
  );
}

const FREE = PLANS.free.limits.wordsPerDay ?? 0;

describe("the balance in the header", () => {
  it("counts a free day against the day's allowance", () => {
    const html = render({ kind: "free", used: 200, limit: FREE });
    expect(html).toContain("Hoy:");
    expect(html).toContain(`200 / ${FREE} palabras`);
    // Both labels ship and CSS picks one, so the phone never has to wait
    // for JavaScript to know which it is.
    expect(html).toContain(`200/${FREE} hoy`);
    expect(html).toContain(`aria-valuenow="200"`);
    expect(html).toContain(`aria-valuemax="${FREE}"`);
  });

  it("counts Pro against the month, not the day", () => {
    const html = render({
      kind: "pro",
      used: 12_000,
      limit: 60_000,
      periodEnd: "2026-10-14T00:00:00.000Z",
    });
    expect(html).toContain("Este mes:");
    expect(html).toContain("12.000 / 60.000 palabras");
    expect(html).not.toContain("Hoy:");
  });

  it("shows no meter on a plan that does not meter", () => {
    const html = render({ kind: "unlimited", used: 0, limit: null });
    expect(html).toContain("Ilimitado");
    // A bar at 0% on an unmetered plan reads as "nothing used of nothing".
    expect(html).not.toContain("progressbar");
  });

  it("says when the trial turns into a charge", () => {
    const html = render({
      kind: "trial",
      used: 0,
      limit: null,
      trialEnd: "2026-09-26T00:00:00.000Z",
    });
    expect(html).toContain("prueba hasta el 26 de septiembre");
  });

  it("offers the upgrade only where there is one to sell", () => {
    // Free is the state that pays for this block, and the offer has to
    // reach pricing tagged, or C9 cannot tell the header apart from the
    // nav. Ilimitado has nothing above it: no button at all.
    expect(render({ kind: "free", used: 0, limit: FREE })).toContain(
      "/precios?from=header",
    );
    expect(render({ kind: "pro", used: 0, limit: 60_000 })).toContain(
      "Pasar a Ilimitado",
    );
    const unlimited = render({ kind: "unlimited", used: 0, limit: null });
    expect(unlimited).not.toContain("Mejorar");
    expect(unlimited).not.toContain("Pasar a Ilimitado");
  });

  it("keeps the tooltip out of the markup until it is asked for", () => {
    const html = render({ kind: "free", used: 0, limit: FREE });
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('role="tooltip"');
  });
});
