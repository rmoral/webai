import React from "react";

const __css = `
.vbx-card{display:flex;flex-direction:column;gap:var(--space-6);padding-top:var(--space-6);padding-bottom:var(--space-6);border:1px solid var(--border);border-radius:var(--radius-xl);background:var(--card);color:var(--card-foreground);box-shadow:var(--shadow-sm)}
.vbx-card-header{display:grid;grid-auto-rows:min-content;gap:var(--space-1-5);align-items:start;padding-left:var(--space-6);padding-right:var(--space-6)}
.vbx-card-header:has(.vbx-card-action){grid-template-columns:1fr auto}
.vbx-card-title{font-size:var(--text-base);font-weight:var(--font-semibold);line-height:var(--leading-none)}
.vbx-card-description{font-size:var(--text-sm);color:var(--muted-foreground)}
.vbx-card-action{grid-column-start:2;grid-row:1/span 2;align-self:start;justify-self:end}
.vbx-card-content{padding-left:var(--space-6);padding-right:var(--space-6)}
.vbx-card-footer{display:flex;align-items:center;padding-left:var(--space-6);padding-right:var(--space-6)}
.vbx-card--interactive{transition:var(--transition-colors);cursor:pointer}
.vbx-card--interactive:hover{background:color-mix(in oklab,var(--accent) 40%,var(--card))}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-card-css")) {
  const el = document.createElement("style");
  el.id = "vbx-card-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

export function Card({ interactive = false, className = "", children, ...props }) {
  return (
    <div
      data-slot="card"
      className={["vbx-card", interactive ? "vbx-card--interactive" : "", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div data-slot="card-header" className={["vbx-card-header", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }) {
  return (
    <div data-slot="card-title" className={["vbx-card-title", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

export function CardDescription({ className = "", children, ...props }) {
  return (
    <div data-slot="card-description" className={["vbx-card-description", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

export function CardAction({ className = "", children, ...props }) {
  return (
    <div data-slot="card-action" className={["vbx-card-action", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div data-slot="card-content" className={["vbx-card-content", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...props }) {
  return (
    <div data-slot="card-footer" className={["vbx-card-footer", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}
