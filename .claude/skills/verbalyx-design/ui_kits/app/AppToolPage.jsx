import React from "react";
import { Button } from "../../components/core/Button.jsx";
import { ToolEditor } from "../../components/tools/ToolEditor.jsx";
import { ScoreGauge } from "../../components/tools/ScoreGauge.jsx";
import { UpsellBanner } from "../../components/feedback/UpsellBanner.jsx";

export function AppToolPage({ tool = { id: "humanize", label: "Humanizador", modes: [] }, plan = "Gratis", remaining = 265, onNavigate = () => {} }) {
  return (
    <main style={{ maxWidth: "65rem", margin: "0 auto", padding: "var(--space-8) var(--gutter-page) var(--pad-page-y)" }}>
      <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: "var(--font-semibold)", letterSpacing: "-0.01em" }}>{tool.label}</h1>
      <p style={{ margin: "var(--space-2) 0 var(--space-6)", fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>
        Elige el registro, pega tu texto y pulsa {tool.label}. El resultado se escribe en directo y te marcamos qué hemos cambiado.
      </p>

      <ToolEditor
        name={tool.label}
        modes={tool.modes}
        wordsRemaining={remaining}
        initialText="Es importante destacar que la implementación de estas metodologías resulta fundamental para optimizar los resultados obtenidos. En resumen, dichos procesos permiten alcanzar objetivos de manera eficiente y efectiva."
        footer="No guardamos tu texto en el plan Gratis."
      />

      <div style={{ marginTop: "var(--space-6)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", background: "var(--card)", boxShadow: "var(--shadow-sm)", padding: "var(--space-5)" }}>
        <ScoreGauge value={72}>
          <Button variant="outline" size="sm" style={{ marginLeft: "auto", flex: "none" }}>Ver detalle</Button>
        </ScoreGauge>
      </div>

      {plan !== "Pro" && (
        <div style={{ marginTop: "var(--space-6)" }}>
          <UpsellBanner
            title={`Te quedan ${remaining} palabras hoy.`}
            action={<Button size="sm" onClick={() => onNavigate("precios")}>Probar Pro 3 días</Button>}
          >
            Pro sube el límite a 10.000 por petición, quita el límite diario y guarda tu historial. Cancela antes y no pagas nada.
          </UpsellBanner>
        </div>
      )}
    </main>
  );
}
