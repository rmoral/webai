import React from "react";

const __css = `
.vbx-upsell{display:flex;align-items:center;gap:var(--space-4);flex-wrap:wrap;border:1px solid var(--brand-line);border-radius:var(--radius-xl);background:var(--brand-soft);padding:var(--space-4) var(--space-6)}
.vbx-upsell p{margin:0;font-size:var(--text-sm);color:var(--brand-ink);line-height:var(--leading-normal);flex:1 1 320px}
.vbx-upsell b{font-weight:var(--font-semibold)}
.vbx-upsell--quota{border-color:var(--danger-line);background:var(--danger-soft)}
.vbx-upsell--quota p{color:var(--danger-ink)}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-upsell-css")) {
  const el = document.createElement("style");
  el.id = "vbx-upsell-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

export function UpsellBanner({ tone = "brand", title, children, action }) {
  return (
    <div className={["vbx-upsell", tone === "quota" ? "vbx-upsell--quota" : ""].filter(Boolean).join(" ")}>
      <p>
        {title && <b>{title} </b>}
        {children}
      </p>
      {action}
    </div>
  );
}
