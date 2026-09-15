import React from "react";

const __css = `
.vbx-quota{display:flex;flex-direction:column;gap:var(--space-2)}
.vbx-quota-top{display:flex;align-items:baseline;gap:var(--space-2);font-size:var(--text-sm)}
.vbx-quota-top b{font-weight:var(--font-medium);white-space:nowrap}
.vbx-quota-top span{color:var(--muted-foreground);font-size:var(--text-xs);white-space:nowrap}
.vbx-quota-track{height:6px;border-radius:var(--radius-full);background:var(--border);overflow:hidden}
.vbx-quota-fill{display:block;height:100%;border-radius:var(--radius-full);background:var(--brand);transition:width var(--duration-fast) var(--easing-default)}
.vbx-quota-fill--warn{background:var(--warning-fill)}
.vbx-quota-fill--full{background:var(--danger)}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-quota-css")) {
  const el = document.createElement("style");
  el.id = "vbx-quota-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

export function QuotaBar({ used = 0, total = 500, plan = "Gratis", unit = "palabras hoy", showPlan = true }) {
  const pct = total ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const tone = pct >= 100 ? "full" : pct >= 80 ? "warn" : "brand";
  return (
    <div className="vbx-quota">
      <div className="vbx-quota-top">
        <b>
          {used.toLocaleString("es-ES")} / {total.toLocaleString("es-ES")} {unit}
        </b>
        {showPlan && <span>Plan {plan}</span>}
      </div>
      <div className="vbx-quota-track">
        <span
          className={["vbx-quota-fill", tone === "warn" ? "vbx-quota-fill--warn" : "", tone === "full" ? "vbx-quota-fill--full" : ""].filter(Boolean).join(" ")}
          style={{ width: pct + "%" }}
        />
      </div>
    </div>
  );
}
