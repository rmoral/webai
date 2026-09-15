import React from "react";

const __css = `
.vbx-chip{display:inline-flex;align-items:center;justify-content:center;height:var(--control-h-sm);padding:0 var(--space-3);border:1px solid var(--border);border-radius:var(--radius-md);background:var(--background);color:var(--muted-foreground);font-family:var(--font-sans);font-size:var(--text-sm);font-weight:var(--font-medium);cursor:pointer;transition:var(--transition-colors);white-space:nowrap}
.vbx-chip:hover{background:var(--accent);color:var(--foreground)}
.vbx-chip[aria-pressed="true"]{background:var(--brand);border-color:var(--brand);color:var(--brand-fg)}
.vbx-chip[aria-pressed="true"]:hover{background:var(--brand-hover)}
.vbx-chip:disabled{opacity:var(--disabled-opacity);pointer-events:none}
.vbx-chip:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in oklab,var(--brand) 30%,transparent)}
.vbx-chip--round{border-radius:var(--radius-full)}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-chip-css")) {
  const el = document.createElement("style");
  el.id = "vbx-chip-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

export function Chip({ pressed = false, round = false, className = "", children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={["vbx-chip", round ? "vbx-chip--round" : "", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
