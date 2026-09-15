import React from "react";
import { Badge } from "../../components/core/Badge.jsx";
import { Button } from "../../components/core/Button.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/surfaces/Card.jsx";

const ul = { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--muted-foreground)" };

export function PricingPage({ onNavigate = () => {} }) {
  const [loading, setLoading] = React.useState(null);
  const checkout = (interval) => {
    setLoading(interval);
    setTimeout(() => setLoading(null), 1400);
  };

  return (
    <main style={{ maxWidth: "65rem", margin: "0 auto", padding: "var(--pad-page-y) var(--gutter-page)" }}>
      <h1 style={{ margin: 0, fontSize: "var(--text-3xl)", fontWeight: "var(--font-bold)", letterSpacing: "var(--tracking-tight)" }}>Precios</h1>
      <p style={{ marginTop: "var(--space-3)", marginBottom: 0, color: "var(--muted-foreground)" }}>
        Empieza gratis. Prueba Pro 3 días — cancela antes y no pagas nada.
      </p>

      <div style={{ marginTop: "var(--space-8)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", alignItems: "start" }}>
        <Card>
          <CardHeader>
            <CardTitle>Gratis</CardTitle>
            <CardDescription>0 €</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <ul style={ul}>
              <li>· 500 palabras al día</li>
              <li>· Humanizador (y pronto el resto de herramientas)</li>
            </ul>
            <Button variant="outline" onClick={() => onNavigate("login")}>Crear cuenta gratis</Button>
          </CardContent>
        </Card>

        <Card style={{ borderColor: "var(--brand)", boxShadow: "0 0 0 1px var(--brand)" }}>
          <CardHeader>
            <CardTitle style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              Pro anual <Badge variant="brand">Recomendado</Badge>
            </CardTitle>
            <CardDescription>59,99 €/año — sale a 5,00 €/mes</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <ul style={ul}>
              <li>· 10.000 palabras por petición</li>
              <li>· Sin límite diario</li>
              <li>· Historial de documentos</li>
              <li>· Todas las herramientas</li>
            </ul>
            <Button size="lg" onClick={() => checkout("yearly")} disabled={loading === "yearly"}>
              {loading === "yearly" ? "Abriendo el pago…" : "Probar Pro 3 días"}
            </Button>
            <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
              ¿Prefieres pagar mes a mes? Pro mensual por 9,99 €/mes:
            </p>
            <Button size="lg" variant="outline" onClick={() => checkout("monthly")} disabled={loading === "monthly"}>
              {loading === "monthly" ? "Abriendo el pago…" : "Probar Pro 3 días"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <p style={{ marginTop: "var(--space-8)", marginBottom: 0, fontSize: "var(--text-xs)", color: "var(--muted-foreground)", maxWidth: "48rem" }}>
        Precios con IVA incluido. La prueba requiere tarjeta; puedes cancelar en cualquier momento desde tu cuenta. Al activar la suscripción aceptas los{" "}
        <a href="#" onClick={(e) => e.preventDefault()} style={{ textDecoration: "underline", color: "inherit" }}>términos del servicio</a>{" "}
        y renuncias al derecho de desistimiento al acceder de inmediato al contenido digital.
      </p>
    </main>
  );
}
