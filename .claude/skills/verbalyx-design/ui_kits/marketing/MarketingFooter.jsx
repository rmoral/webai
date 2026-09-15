import React from "react";

const GROUPS = [
  { title: "Herramientas", links: ["Humanizador de texto IA", "Detector de IA", "Parafraseador", "Corrector ortográfico"] },
  { title: "Para quién", links: ["Trabajos universitarios (TFG, TFM)", "Oposiciones", "Blog y SEO", "Marketing de contenidos"] },
  { title: "Producto", links: ["Precios", "Plan Pro", "Ayuda"] },
  { title: "Legal", links: ["Aviso legal", "Términos", "Privacidad", "Cookies"] },
];

export function MarketingFooter({ onNavigate = () => {} }) {
  return (
    <footer style={{ marginTop: "var(--space-16)", borderTop: "1px solid var(--border)", background: "var(--muted)" }}>
      <div style={{ maxWidth: "65rem", margin: "0 auto", padding: "var(--space-10) var(--gutter-page)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-8)" }}>
          {GROUPS.map((group) => (
            <div key={group.title}>
              <p style={{ margin: 0, fontSize: "var(--text-xs)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>
                {group.title}
              </p>
              <div style={{ marginTop: "var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {group.links.map((link) => (
                  <a
                    key={link}
                    onClick={() => link === "Precios" && onNavigate("precios")}
                    style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", cursor: "pointer" }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "var(--space-10)", paddingTop: "var(--space-6)", borderTop: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
          <span>© 2026 Verbalyx</span>
          <span>Español de España y LATAM</span>
          <span style={{ marginLeft: "auto" }}>No guardamos los textos de los planes gratuitos.</span>
        </div>
      </div>
    </footer>
  );
}
