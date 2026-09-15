import React from "react";
import { Button } from "../../components/core/Button.jsx";
import { ToolTabs } from "../../components/navigation/ToolTabs.jsx";

const NAV = [
  { id: "precios", label: "Precios" },
  { id: "blog", label: "Blog" },
  { id: "ayuda", label: "Ayuda" },
];

export function SiteHeader({ tools = [], tool, onTool = () => {}, page, onNavigate = () => {} }) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "color-mix(in oklab, var(--background) 90%, transparent)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ maxWidth: "65rem", margin: "0 auto", padding: "0 var(--gutter-page)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)", height: 56 }}>
          <a
            onClick={() => onNavigate("home")}
            style={{ fontWeight: "var(--font-bold)", fontSize: "var(--text-base)", letterSpacing: "-0.02em", cursor: "pointer" }}
          >
            Verbaly<span style={{ color: "var(--brand)" }}>x</span>
          </a>
          <nav style={{ display: "flex", gap: "var(--space-5)", color: "var(--muted-foreground)", fontSize: "var(--text-sm)" }}>
            {NAV.map((item) => (
              <a
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{ cursor: "pointer", color: page === item.id ? "var(--foreground)" : "inherit", fontWeight: page === item.id ? 500 : 400 }}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <span style={{ marginLeft: "auto", display: "flex", gap: "var(--space-2)" }}>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("login")}>Entrar</Button>
            <Button size="sm" onClick={() => onNavigate("login")}>Crear cuenta gratis</Button>
          </span>
        </div>
        <ToolTabs
          items={tools.map((t) => ({ id: t.id, label: t.label, hint: t.hint, disabled: !t.live }))}
          value={tool}
          onChange={onTool}
        />
      </div>
    </header>
  );
}
