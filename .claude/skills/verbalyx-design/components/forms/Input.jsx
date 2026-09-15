import React from "react";

const __css = `
.vbx-input{display:flex;width:100%;height:var(--control-h);border:1px solid var(--input);border-radius:var(--radius-md);background:transparent;color:var(--foreground);padding:0 var(--space-3);font-family:var(--font-sans);font-size:var(--text-sm);outline:none;transition:var(--transition-colors),box-shadow var(--duration-fast) var(--easing-default)}
.vbx-input::placeholder{color:var(--muted-foreground)}
.vbx-input:focus-visible{border-color:var(--ring);box-shadow:var(--ring-focus)}
.vbx-input[aria-invalid="true"]{border-color:var(--destructive);box-shadow:var(--ring-invalid)}
.vbx-input:disabled{cursor:not-allowed;opacity:var(--disabled-opacity)}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-input-css")) {
  const el = document.createElement("style");
  el.id = "vbx-input-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

export function Input({ className = "", type = "text", ...props }) {
  return <input data-slot="input" type={type} className={["vbx-input", className].filter(Boolean).join(" ")} {...props} />;
}
