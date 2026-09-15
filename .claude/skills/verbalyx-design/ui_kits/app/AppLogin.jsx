import React from "react";
import { Button } from "../../components/core/Button.jsx";
import { Input } from "../../components/forms/Input.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/surfaces/Card.jsx";

export function AppLogin({ onSignedIn = () => {} }) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState("idle");

  function submit(e) {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 900);
  }

  return (
    <main style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "0 var(--gutter-page)" }}>
      <Card style={{ width: "100%", maxWidth: "var(--width-form)" }}>
        <CardHeader>
          <CardTitle>Inicia sesión</CardTitle>
          <CardDescription>Con Google o con un enlace mágico a tu correo. Sin contraseñas.</CardDescription>
        </CardHeader>
        <CardContent style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Button variant="outline" onClick={onSignedIn}>Continuar con Google</Button>
          <div style={{ textAlign: "center", fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>o</div>
          {status === "sent" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <p style={{ margin: 0, fontSize: "var(--text-sm)" }}>Revisa tu correo: te hemos enviado un enlace para entrar.</p>
              <Button variant="outline" size="sm" onClick={onSignedIn}>(demo) Abrir el enlace</Button>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />
              <Button type="submit" disabled={status === "sending" || !email}>
                {status === "sending" ? "Enviando…" : "Enviarme el enlace"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
