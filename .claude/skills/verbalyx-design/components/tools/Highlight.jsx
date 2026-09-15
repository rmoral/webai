import React from "react";

const __css = `
.vbx-hl{border-radius:2px;padding:0 1px;color:inherit;background:var(--hl-rewritten);box-shadow:inset 0 -2px 0 var(--hl-rewritten-line)}
.vbx-hl--added{background:var(--hl-added);box-shadow:inset 0 -2px 0 var(--hl-added-line)}
.vbx-hl-legend{display:inline-flex;align-items:center;gap:var(--space-1-5);font-size:var(--text-xs);color:var(--muted-foreground)}
.vbx-hl-swatch{width:10px;height:10px;border-radius:2px;background:var(--hl-rewritten);box-shadow:inset 0 -2px 0 var(--hl-rewritten-line);flex:none}
.vbx-hl-swatch--added{background:var(--hl-added);box-shadow:inset 0 -2px 0 var(--hl-added-line)}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-highlight-css")) {
  const el = document.createElement("style");
  el.id = "vbx-highlight-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

export function Highlight({ kind = "rewritten", children, ...props }) {
  return (
    <mark className={["vbx-hl", kind === "added" ? "vbx-hl--added" : ""].filter(Boolean).join(" ")} {...props}>
      {children}
    </mark>
  );
}

export function HighlightLegend({ kind = "rewritten", children }) {
  return (
    <span className="vbx-hl-legend">
      <span className={["vbx-hl-swatch", kind === "added" ? "vbx-hl-swatch--added" : ""].filter(Boolean).join(" ")} />
      {children ?? (kind === "added" ? "Añadido" : "Reescrito")}
    </span>
  );
}
