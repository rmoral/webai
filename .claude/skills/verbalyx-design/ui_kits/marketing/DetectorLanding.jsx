import React from "react";
import { Badge } from "../../components/core/Badge.jsx";
import { Button } from "../../components/core/Button.jsx";
import { Textarea } from "../../components/forms/Textarea.jsx";
import { ScoreGauge } from "../../components/tools/ScoreGauge.jsx";
import { UpsellBanner } from "../../components/feedback/UpsellBanner.jsx";

export function DetectorLanding({ onNavigate = () => {} }) {
  const [text, setText] = React.useState(
    "Es importante destacar que la implementación de estas metodologías resulta fundamental para optimizar los resultados obtenidos."
  );
  const [score, setScore] = React.useState(null);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <main style={{ maxWidth: "65rem", margin: "0 auto", padding: "var(--pad-page-y) var(--gutter-page)" }}>
      <Badge variant="secondary">Muy pronto</Badge>
      <h1 style={{ margin: "var(--space-4) 0 0", fontSize: "var(--text-4xl)", fontWeight: "var(--font-bold)", letterSpacing: "var(--tracking-tight)" }}>
        Detector de IA en español
      </h1>
      <p style={{ margin: "var(--space-3) 0 0", maxWidth: "42rem", fontSize: "var(--text-lg)", color: "var(--muted-foreground)" }}>
        Mide cuánto suena a IA tu texto antes de entregarlo. Te decimos dónde están los patrones, no solo un número.
      </p>

      <div style={{ marginTop: "var(--space-8)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} style={{ minHeight: "var(--min-editor)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <Button onClick={() => setScore(31)} disabled={words === 0}>Analizar</Button>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>{words} palabras</span>
          </div>
        </div>
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "var(--space-5)", background: "var(--card)", boxShadow: "var(--shadow-sm)" }}>
          {score === null ? (
            <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>
              La puntuación aparecerá aquí.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <ScoreGauge value={score} label="Suena humano en un 31%" />
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", fontSize: "var(--text-sm)" }}>
                {[["Frases de longitud casi idéntica", "warning"], ["Conectores de relleno («es importante destacar»)", "danger"], ["Terminología coherente", "success"]].map(([label, tone]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <Badge variant={tone}>{tone === "success" ? "Bien" : tone === "warning" ? "Revisa" : "Señal"}</Badge>
                    <span style={{ color: "var(--muted-foreground)" }}>{label}</span>
                  </div>
                ))}
              </div>
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
