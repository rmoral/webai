import React from "react";
import { Badge } from "../../components/core/Badge.jsx";
import { Button } from "../../components/core/Button.jsx";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/surfaces/Card.jsx";
import { ToolEditor } from "../../components/tools/ToolEditor.jsx";

const AUDIENCES = [
  { title: "Estudiantes", body: "TFG, TFM y trabajos de clase con el registro académico y las normas de la RAE." },
  { title: "Oposiciones", body: "Temarios y supuestos prácticos en un español formal y legible." },
  { title: "Blog y SEO", body: "Textos que no suenan a plantilla, sin perder las palabras clave." },
  { title: "Marketing", body: "Newsletters y redes con el tono informal, listos para publicar." },
];

const CLAIMS = [
  { title: "Español nativo, no traducido", body: "El registro académico respeta las normas de la RAE; el neutro funciona a los dos lados del Atlántico." },
  { title: "Sin promesas falsas", body: "Ningún servicio puede garantizar un resultado frente a detectores de terceros. Te decimos qué hace la herramienta y qué no." },
  { title: "Tus textos no se guardan", body: "En los planes gratuitos solo registramos métricas de uso. El historial es opcional y solo en Pro." },
];

export function MarketingHome({ tools = [], tool = "humanize", onTool = () => {}, onNavigate = () => {} }) {
  const current = tools.find((t) => t.id === tool) || tools[0] || { label: "Humanizador", modes: [] };
  return (
    <main style={{ maxWidth: "65rem", margin: "0 auto", padding: "0 var(--gutter-page)" }}>
      <section style={{ padding: "var(--space-16) 0 var(--space-8)", textAlign: "center" }}>
        <Badge variant="brand" pill dot>Sin registro · 300 palabras al día</Badge>
        <h1 style={{ margin: "var(--space-5) 0 0", fontSize: "3.25rem", lineHeight: 1.04, fontWeight: "var(--font-bold)", letterSpacing: "-0.03em" }}>
          Que tu texto suene<br />
          <span style={{ color: "var(--brand)" }}>a persona</span>, en español
        </h1>
        <p style={{ margin: "var(--space-4) auto 0", maxWidth: "39rem", fontSize: "var(--text-lg)", color: "var(--muted-foreground)" }}>
          Pega lo que te ha dado la IA y recupéralo con tu voz. Hecho para el español de España y LATAM, no traducido de una herramienta inglesa.
        </p>
      </section>

      <ToolEditor
        name={current.label}
        modes={current.modes}
        wordsRemaining={266}
        initialText="Es importante destacar que la implementación de estas metodologías resulta fundamental para optimizar los resultados obtenidos. En resumen, dichos procesos permiten alcanzar objetivos de manera eficiente y efectiva."
        footer="Sin registro. No guardamos tu texto."
      />

      <section style={{ marginTop: "var(--space-16)" }}>
        <h2 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: "var(--font-semibold)", letterSpacing: "-0.01em" }}>Las cuatro herramientas</h2>
        <p style={{ margin: "var(--space-2) 0 0", color: "var(--muted-foreground)" }}>
          Empieza por el humanizador. El resto llega muy pronto y entran en el mismo plan.
        </p>
        <div style={{ marginTop: "var(--space-6)", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--space-4)" }}>
          {tools.map((t) => (
            <Card key={t.id} interactive={t.live} onClick={t.live ? () => onTool(t.id) : undefined}>
              <CardHeader>
                <CardTitle style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  {t.label}
                  {!t.live && <Badge variant="secondary">Muy pronto</Badge>}
                </CardTitle>
                <CardDescription>{t.live ? "Pruébalo gratis →" : t.hint}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section style={{ marginTop: "var(--space-16)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-4)" }}>
        {CLAIMS.map((c) => (
          <div key={c.title} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "var(--space-5)" }}>
            <h3 style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: "var(--font-semibold)" }}>{c.title}</h3>
            <p style={{ margin: "var(--space-2) 0 0", fontSize: "var(--text-sm)", color: "var(--muted-foreground)", lineHeight: "var(--leading-normal)" }}>{c.body}</p>
          </div>
        ))}
      </section>

      <section style={{ marginTop: "var(--space-16)" }}>
        <h2 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: "var(--font-semibold)", letterSpacing: "-0.01em" }}>¿Para qué se usa?</h2>
        <div style={{ marginTop: "var(--space-6)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)" }}>
          {AUDIENCES.map((a) => (
            <div key={a.title}>
              <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: "var(--font-semibold)", color: "var(--brand)" }}>{a.title}</p>
              <p style={{ margin: "var(--space-2) 0 0", fontSize: "var(--text-sm)", color: "var(--muted-foreground)", lineHeight: "var(--leading-normal)" }}>{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: "var(--space-16)", border: "1px solid var(--brand-line)", background: "var(--brand-soft)", borderRadius: "var(--radius-xl)", padding: "var(--space-8)", textAlign: "center" }}>
        <h2 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: "var(--font-semibold)", color: "var(--brand-ink)" }}>Empieza sin registrarte</h2>
        <p style={{ margin: "var(--space-2) auto 0", maxWidth: "34rem", fontSize: "var(--text-sm)", color: "var(--brand-ink)" }}>
          300 palabras al día sin cuenta, 500 con cuenta gratis. Pro quita el límite diario y sube a 10.000 palabras por petición.
        </p>
        <div style={{ marginTop: "var(--space-5)", display: "flex", gap: "var(--space-3)", justifyContent: "center", flexWrap: "wrap" }}>
          <Button size="lg" onClick={() => onNavigate("login")}>Crear cuenta gratis</Button>
          <Button size="lg" variant="outline" onClick={() => onNavigate("precios")}>Ver precios</Button>
        </div>
      </section>
    </main>
  );
}
