import React from "react";
import { Badge } from "../../components/core/Badge.jsx";
import { Button } from "../../components/core/Button.jsx";
import { Textarea } from "../../components/forms/Textarea.jsx";
import { EvidenceBand } from "../../components/tools/EvidenceBand.jsx";
import { UpsellBanner } from "../../components/feedback/UpsellBanner.jsx";

export function DetectorLanding({ onNavigate = () => {} }) {
  const [text, setText] = React.useState(
    "Es importante destacar que la implementación de estas metodologías resulta fundamental para optimizar los resultados obtenidos."
  );
  const [result, setResult] = React.useState(false);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <main style={{ maxWidth: "65rem", margin: "0 auto", padding: "var(--pad-page-y) var(--gutter-page)" }}>
      <Badge variant="secondary">Muy pronto</Badge>
      <h1 style={{ margin: "var(--space-4) 0 0", fontSize: "var(--text-4xl)", fontWeight: "var(--font-bold)", letterSpacing: "var(--tracking-tight)" }}>
        Detector de IA en español
      </h1>
      <p style={{ margin: "var(--space-3) 0 0", maxWidth: "42rem", fontSize: "var(--text-lg)", color: "var(--muted-foreground)" }}>
        Te decimos en qué nos basamos, pasaje a pasaje. Sin porcentajes: una cifra daría una precisión que ninguna herramienta tiene.
      </p>

      <div style={{ marginTop: "var(--space-8)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} style={{ minHeight: "var(--min-editor)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <Button onClick={() => setResult(true)} disabled={words === 0}>Analizar</Button>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>
              {words} palabras · mínimo 200 y 8 frases
            </span>
          </div>
        </div>
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "var(--space-5)", background: "var(--card)", boxShadow: "var(--shadow-sm)" }}>
          {!result ? (
            <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>
              El análisis aparecerá aquí.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <EvidenceBand
                band="clear"
                findings={[
                  { label: "Frases de longitud casi idéntica en todo el texto", tone: "bad" },
                  { label: "Conectores de relleno repetidos («es importante destacar», «en resumen»)", tone: "bad" },
                  { label: "Terminología técnica coherente y bien empleada", tone: "good" },
                ]}
              />
              <Button variant="soft" size="sm" onClick={() => onNavigate("humanizador")}>Humanizar este texto →</Button>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: "var(--space-8)" }}>
        <UpsellBanner title="El detector entra en el plan Pro cuando salga." action={<Button size="sm" onClick={() => onNavigate("precios")}>Ver precios</Button>}>
          Mientras tanto, el humanizador ya funciona gratis y sin registro.
        </UpsellBanner>
      </div>
    </main>
  );
}
