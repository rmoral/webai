import React from "react";
import { Badge } from "../../components/core/Badge.jsx";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/surfaces/Card.jsx";

const STATUS_LABELS = {
  trialing: "En prueba",
  active: "Activa",
  past_due: "Pago pendiente",
  canceled: "Cancelada",
  unpaid: "Impagada",
};

const ROWS = [
  { id: 1, email: "laura.mendez@gmail.com", plan: "pro", interval: "year", status: "active", end: "12/3/2027", words: 41230, cost: 612, created: "8/1/2026" },
  { id: 2, email: "j.ferrer@uab.cat", plan: "pro", interval: "month", status: "trialing", end: "18/9/2026", words: 8940, cost: 134, created: "12/9/2026" },
  { id: 3, email: "contenidos@lunamkt.es", plan: "pro", interval: "month", status: "past_due", end: "1/10/2026", words: 22110, cost: 331, created: "3/5/2026" },
  { id: 4, email: "diego.sanroman@outlook.com", plan: "free", interval: null, status: null, end: null, words: 1420, cost: 21, created: "14/9/2026" },
  { id: 5, email: "maria.ocampo@unam.mx", plan: "pro", interval: "year", status: "active", cancel: true, end: "2/2/2027", words: 63870, cost: 958, created: "2/2/2026" },
  { id: 6, email: "hola@estudiotinta.co", plan: "free", interval: null, status: null, end: null, words: 380, cost: 5, created: "15/9/2026" },
];

const euros = (n) => n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
const th = { padding: "var(--space-2) var(--space-3)", fontWeight: "var(--font-medium)", textAlign: "left" };
const td = { padding: "var(--space-2) var(--space-3)" };

export function AdminBackoffice() {
  const stats = [
    { label: "Usuarios", value: "1.284" },
    { label: "Pro activos", value: "96" },
    { label: "En prueba", value: "14" },
    { label: "MRR", value: euros(742.1) },
    { label: "Coste IA (mes)", value: euros(118.4) },
  ];

  return (
    <main style={{ maxWidth: "var(--width-wide)", margin: "0 auto", padding: "var(--pad-page-y) var(--gutter-page)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: "var(--font-semibold)" }}>Backoffice</h1>
        <a href="../app/index.html" style={{ fontSize: "var(--text-sm)", textDecoration: "underline", color: "inherit" }}>Volver a la app</a>
      </div>

      <div style={{ marginTop: "var(--space-8)", display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "var(--space-4)" }}>
        {stats.map(({ label, value }) => (
          <Card key={label}>
            <CardHeader style={{ paddingBottom: 0 }}>
              <CardTitle style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-normal)", color: "var(--muted-foreground)" }}>{label}</CardTitle>
            </CardHeader>
            <CardContent style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-semibold)" }}>{value}</CardContent>
          </Card>
        ))}
      </div>

      <h2 style={{ margin: "var(--space-12) 0 0", fontSize: "var(--text-lg)", fontWeight: "var(--font-semibold)" }}>
        Usuarios ({ROWS.length})
      </h2>
      <div style={{ marginTop: "var(--space-4)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflowX: "auto" }}>
        <table style={{ width: "100%", fontSize: "var(--text-sm)", borderCollapse: "collapse" }}>
          <thead style={{ background: "color-mix(in oklab, var(--muted) 50%, transparent)" }}>
            <tr>
              <th style={th}>Email</th>
              <th style={th}>Plan</th>
              <th style={th}>Estado</th>
              <th style={th}>Renueva</th>
              <th style={{ ...th, textAlign: "right" }}>Palabras/mes</th>
              <th style={{ ...th, textAlign: "right" }}>Coste IA</th>
              <th style={th}>Alta</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={td}>{row.email}</td>
                <td style={td}>
                  <Badge variant={row.plan === "pro" ? "default" : "secondary"}>{row.plan === "pro" ? "Pro" : "Gratis"}</Badge>
                  {row.interval && (
                    <span style={{ marginLeft: "var(--space-2)", color: "var(--muted-foreground)" }}>
                      {row.interval === "year" ? "anual" : "mensual"}
                    </span>
                  )}
                </td>
                <td style={td}>
                  {row.status ? STATUS_LABELS[row.status] : "—"}
                  {row.cancel && <span style={{ marginLeft: "var(--space-1)", color: "var(--destructive)" }}>(cancela)</span>}
                </td>
                <td style={td}>{row.end ?? "—"}</td>
                <td style={{ ...td, textAlign: "right" }}>{row.words.toLocaleString("es-ES")}</td>
                <td style={{ ...td, textAlign: "right" }}>{euros(row.cost / 100)}</td>
                <td style={td}>{row.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: "var(--space-4)", marginBottom: 0, fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
        El coste de IA es el acumulado del mes en curso. Las suscripciones se gestionan en Stripe; aquí solo se consultan.
      </p>
    </main>
  );
}
