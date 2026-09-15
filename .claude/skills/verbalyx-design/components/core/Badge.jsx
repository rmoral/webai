import React from "react";

const __css = `
.vbx-badge{display:inline-flex;align-items:center;justify-content:center;gap:var(--space-1);width:fit-content;border:1px solid transparent;border-radius:var(--radius-md);padding:var(--space-0-5) var(--space-2);font-family:var(--font-sans);font-size:var(--text-xs);font-weight:var(--font-medium);line-height:1.4;white-space:nowrap;overflow:hidden;flex-shrink:0;transition:var(--transition-colors)}
.vbx-badge svg{width:0.75rem;height:0.75rem;pointer-events:none}
.vbx-badge-default{background:var(--primary);color:var(--primary-foreground)}
.vbx-badge-secondary{background:var(--secondary);color:var(--secondary-foreground)}
.vbx-badge-destructive{background:var(--danger);color:#fff}
.vbx-badge-outline{border-color:var(--border);color:var(--foreground);background:transparent}
.vbx-badge-brand{background:var(--brand-soft);border-color:var(--brand-line);color:var(--brand-ink)}
.vbx-badge-success{background:var(--success-soft);border-color:var(--success-line);color:var(--success-ink)}
.vbx-badge-warning{background:var(--warning-soft);border-color:var(--warning-line);color:var(--warning-ink)}
.vbx-badge-danger{background:var(--danger-soft);border-color:var(--danger-line);color:var(--danger-ink)}
.vbx-badge-pill{border-radius:var(--radius-full);padding:var(--space-1) var(--space-3)}
.vbx-badge-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-badge-css")) {
  const el = document.createElement("style");
  el.id = "vbx-badge-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

const BADGE_VARIANTS = {
  default: "vbx-badge-default",
  secondary: "vbx-badge-secondary",
  destructive: "vbx-badge-destructive",
  outline: "vbx-badge-outline",
  brand: "vbx-badge-brand",
  success: "vbx-badge-success",
  warning: "vbx-badge-warning",
  danger: "vbx-badge-danger",
};

export function Badge({ variant = "default", pill = false, dot = false, className = "", children, ...props }) {
  return (
    <span
      data-slot="badge"
      className={[
        "vbx-badge",
        BADGE_VARIANTS[variant] || BADGE_VARIANTS.default,
        pill ? "vbx-badge-pill" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {dot && <span className="vbx-badge-dot" />}
      {children}
    </span>
  );
}
