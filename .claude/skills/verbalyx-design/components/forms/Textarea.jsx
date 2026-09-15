import React from "react";

const __css = `
.vbx-textarea{display:flex;width:100%;min-height:4rem;field-sizing:content;border:1px solid var(--input);border-radius:var(--radius-md);background:transparent;color:var(--foreground);padding:var(--space-2) var(--space-3);font-family:var(--font-sans);font-size:var(--text-base);line-height:var(--leading-normal);box-shadow:var(--shadow-xs);outline:none;transition:var(--transition-colors),box-shadow var(--duration-fast) var(--easing-default);resize:vertical}
@media (min-width:768px){.vbx-textarea{font-size:var(--text-sm)}}
.vbx-textarea::placeholder{color:var(--muted-foreground)}
.vbx-textarea:focus-visible{border-color:var(--ring);box-shadow:var(--ring-focus)}
.vbx-textarea[aria-invalid="true"]{border-color:var(--destructive);box-shadow:var(--ring-invalid)}
.vbx-textarea:disabled{cursor:not-allowed;opacity:var(--disabled-opacity)}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-textarea-css")) {
  const el = document.createElement("style");
  el.id = "vbx-textarea-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

export function Textarea({ className = "", ...props }) {
  return <textarea data-slot="textarea" className={["vbx-textarea", className].filter(Boolean).join(" ")} {...props} />;
}
