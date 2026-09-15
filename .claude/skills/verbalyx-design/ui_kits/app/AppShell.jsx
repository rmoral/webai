import React from "react";
import { Badge } from "../../components/core/Badge.jsx";
import { Button } from "../../components/core/Button.jsx";
import { ToolTabs } from "../../components/navigation/ToolTabs.jsx";
import { QuotaBar } from "../../components/feedback/QuotaBar.jsx";

export function AppShell({
  tools = [],
  tool,
  onTool = () => {},
  page = "herramienta",
  plan = "Gratis",
  used = 235,
  total = 500,
  isAdmin = true,
  onNavigate = () => {},
  onSignOut = () => {},
  children,
}) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{ borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
        <div style={{ maxWidth: "65rem", margin: "0 auto", padding: "0 var(--gutter-page)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", height: 56, flexWrap: "wrap" }}>
            <a onClick={() => onNavigate("herramienta")} style={{ fontWeight: "var(--font-bold)", fontSize: "var(--text-base)", letterSpacing: "-0.02em", cursor: "pointer" }}>
              Verbaly<span style={{ color: "var(--brand)" }}>x</span>
            </a>
            <Badge variant={plan === "Pro" ? "brand" : "secondary"}>Plan {plan}</Badge>
            <div style={{ minWidth: 200 }}>
              {plan === "Pro" ? (
                <span style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>{used.toLocaleString("es-ES")} palabras hoy</span>
              ) : (
                <QuotaBar used={used} total={total} plan={plan} showPlan={false} />
              )}
            </div>
            <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              {plan !== "Pro" && <Button size="sm" onClick={() => onNavigate("precios")}>Probar Pro 3 días</Button>}
              <a onClick={() => onNavigate("cuenta")} style={{ fontSize: "var(--text-sm)", color: page === "cuenta" ? "var(--foreground)" : "var(--muted-foreground)", cursor: "pointer" }}>Mi cuenta</a>
              {isAdmin && <a href="../admin/index.html" style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>Admin</a>}
              <Button variant="outline" size="sm" onClick={onSignOut}>Salir</Button>
            </span>
          </div>
          <ToolTabs
            items={tools.map((t) => ({ id: t.id, label: t.label, hint: t.hint, disabled: !t.live }))}
            value={tool}
            onChange={(id) => { onTool(id); onNavigate("herramienta"); }}
          />
        </div>
      </header>
      {children}
    </div>
  );
}
