import React from "react";

const __css = `
.vbx-btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--space-2);white-space:nowrap;border:1px solid transparent;border-radius:var(--radius-md);font-family:var(--font-sans);font-size:var(--text-sm);font-weight:var(--font-medium);line-height:1.25;transition:var(--transition-control);cursor:pointer;flex-shrink:0;outline:none;text-decoration:none}
.vbx-btn:disabled{pointer-events:none;opacity:var(--disabled-opacity)}
.vbx-btn:focus-visible{border-color:var(--brand);box-shadow:0 0 0 3px color-mix(in oklab,var(--brand) 30%,transparent)}
.vbx-btn svg{width:1rem;height:1rem;flex-shrink:0;pointer-events:none}
.vbx-btn--default{height:var(--control-h);padding:var(--space-2) var(--space-4)}
.vbx-btn--sm{height:var(--control-h-sm);padding:0 var(--space-3);gap:var(--space-1-5)}
.vbx-btn--lg{height:var(--control-h-lg);padding:0 var(--space-6)}
.vbx-btn--icon{height:var(--control-h);width:var(--control-h);padding:0}
.vbx-btn-primary{background:var(--brand);color:var(--brand-fg);box-shadow:var(--shadow-xs)}
.vbx-btn-primary:hover{background:var(--brand-hover)}
.vbx-btn-primary:active{background:var(--brand-active)}
.vbx-btn-ink{background:var(--primary);color:var(--primary-foreground);box-shadow:var(--shadow-xs)}
.vbx-btn-ink:hover{background:color-mix(in oklab,var(--primary) var(--hover-mix),transparent)}
.vbx-btn-soft{background:var(--brand-soft);color:var(--brand-ink);border-color:var(--brand-line)}
.vbx-btn-soft:hover{background:#e4e9fc}
.vbx-btn-destructive{background:var(--danger);color:#fff;box-shadow:var(--shadow-xs)}
.vbx-btn-destructive:hover{background:color-mix(in oklab,var(--destructive) var(--hover-mix),transparent)}
.vbx-btn-outline{border-color:var(--border);background:var(--background);color:var(--foreground);box-shadow:var(--shadow-xs)}
.vbx-btn-outline:hover{background:var(--accent);color:var(--accent-foreground)}
.vbx-btn-secondary{background:var(--secondary);color:var(--secondary-foreground);box-shadow:var(--shadow-xs)}
.vbx-btn-secondary:hover{background:color-mix(in oklab,var(--secondary) var(--hover-mix-soft),transparent)}
.vbx-btn-ghost{background:transparent;color:var(--foreground)}
.vbx-btn-ghost:hover{background:var(--accent);color:var(--accent-foreground)}
.vbx-btn-link{background:transparent;color:var(--brand);text-underline-offset:4px;height:auto;padding:0}
.vbx-btn-link:hover{text-decoration:underline}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-button-css")) {
  const el = document.createElement("style");
  el.id = "vbx-button-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

const VARIANTS = {
  default: "vbx-btn-primary",
  ink: "vbx-btn-ink",
  soft: "vbx-btn-soft",
  destructive: "vbx-btn-destructive",
  outline: "vbx-btn-outline",
  secondary: "vbx-btn-secondary",
  ghost: "vbx-btn-ghost",
  link: "vbx-btn-link",
};

export function Button({
  variant = "default",
  size = "default",
  as = "button",
  className = "",
  children,
  ...props
}) {
  const Tag = as;
  return (
    <Tag
      data-slot="button"
      className={["vbx-btn", "vbx-btn--" + size, VARIANTS[variant] || VARIANTS.default, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Tag>
  );
}
