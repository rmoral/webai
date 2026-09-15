import React from "react";
import { Button } from "../../components/core/Button.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/surfaces/Card.jsx";

export function AppAccount({ email = "hola@verbalyx.es", plan = "Gratis", onNavigate = () => {} }) {
  const [confirming, setConfirming] = React.useState(false);
  const isPro = plan === "Pro";

  return (
    <main style={{ maxWidth: "var(--width-narrow)", margin: "0 auto", padding: "var(--space-8) var(--gutter-page) var(--pad-page-y)" }}>
      <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: "var(--font-semibold)" }}>Mi cuenta</h1>

      <div style={{ marginTop: "var(--space-8)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <Card>
          <CardHeader>
            <CardTitle>Datos</CardTitle>
            <CardDescription>{email}</CardDescription>
          </CardHeader>
          <CardContent style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>
            Cuenta creada el 4/2/2026
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suscripción</CardTitle>
            <CardDescription>Plan {plan}</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", fontSize: "var(--text-sm)" }}>
            <p style={{ margin: 0, color: "var(--muted-foreground)" }}>
              {isPro ? "10.000 palabras por petición, sin límite diario." : "500 palabras al día."}
            </p>
            {isPro ? (
              <Button variant="outline">Gestionar suscripción y facturas</Button>
            ) : (
              <span><Button onClick={() => onNavigate("precios")}>Probar Pro 3 días</Button></span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Uso este mes</CardTitle></CardHeader>
          <CardContent style={{ fontSize: "var(--text-sm)" }}>
            <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "var(--space-4)" }}>
              {[["Hoy", "148"], ["Este mes", "3.902"], ["Peticiones", "27"]].map(([k, v]) => (
                <div key={k}>
                  <dt style={{ color: "var(--muted-foreground)" }}>{k}</dt>
                  <dd style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: "var(--font-medium)" }}>{v}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card style={{ borderColor: "var(--danger-line)" }}>
          <CardHeader>
            <CardTitle>Eliminar mi cuenta y datos</CardTitle>
            <CardDescription>
              Borra tu cuenta, tu suscripción y todos tus datos de forma permanente. No se puede deshacer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {confirming ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <p style={{ margin: 0, fontSize: "var(--text-sm)" }}>¿Seguro? Se borrarán tu cuenta, tu historial y tu suscripción.</p>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <Button variant="destructive">Sí, eliminar</Button>
                  <Button variant="outline" onClick={() => setConfirming(false)}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setConfirming(true)}>Eliminar mi cuenta</Button>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
