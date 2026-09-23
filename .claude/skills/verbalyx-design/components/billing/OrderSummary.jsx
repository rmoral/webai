import React from "react";
import { Badge } from "../core/Badge.jsx";

const __css = `
.vbx-os{display:flex;flex-direction:column;gap:var(--space-4)}
.vbx-os-head{display:flex;align-items:flex-start;gap:var(--space-3)}
.vbx-os-head h2{margin:0;font-size:var(--text-lg);font-weight:var(--font-semibold)}
.vbx-os-head p{margin:var(--space-1) 0 0;font-size:var(--text-sm);color:var(--muted-foreground)}
.vbx-os-label{font-size:var(--text-xs);font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--muted-foreground)}
.vbx-os-cycle{display:flex;flex-direction:column;gap:var(--space-2)}
.vbx-os-opt{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border);border-radius:var(--radius-md);cursor:pointer;transition:var(--transition-colors);background:var(--card)}
.vbx-os-opt:hover{background:var(--accent)}
.vbx-os-opt[data-on="true"]{border-color:var(--brand);background:var(--brand-softer);box-shadow:0 0 0 1px var(--brand)}
.vbx-os-radio{width:16px;height:16px;border-radius:50%;border:1.5px solid var(--border);flex:none;margin-top:2px;display:grid;place-items:center}
.vbx-os-opt[data-on="true"] .vbx-os-radio{border-color:var(--brand)}
.vbx-os-opt[data-on="true"] .vbx-os-radio::after{content:"";width:8px;height:8px;border-radius:50%;background:var(--brand)}
.vbx-os-opt b{display:block;font-size:var(--text-sm);font-weight:var(--font-medium)}
.vbx-os-opt em{display:block;font-style:normal;font-size:var(--text-sm);color:var(--muted-foreground);margin-top:2px;line-height:var(--leading-normal)}
.vbx-os-incl{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:var(--space-2)}
.vbx-os-incl li{display:flex;gap:var(--space-2);font-size:var(--text-sm);line-height:var(--leading-normal)}
.vbx-os-incl i{font-style:normal;color:var(--brand);font-weight:700;flex:none}
.vbx-os-lines{display:flex;flex-direction:column;gap:var(--space-2);border-top:1px solid var(--border);padding-top:var(--space-4)}
.vbx-os-line{display:flex;justify-content:space-between;gap:var(--space-4);font-size:var(--text-sm);color:var(--muted-foreground)}
.vbx-os-line span:last-child{font-variant-numeric:tabular-nums}
.vbx-os-total{display:flex;justify-content:space-between;gap:var(--space-4);font-size:var(--text-lg);font-weight:var(--font-semibold);padding-top:var(--space-2);border-top:1px solid var(--border);color:var(--foreground)}
.vbx-os-total span:last-child{font-variant-numeric:tabular-nums}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-order-css")) {
  const el = document.createElement("style");
  el.id = "vbx-order-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

export const CYCLES = {
  unlimited: {
    name: "Ilimitado",
    includes: ["500.000 palabras al mes, 8.000 por petición", "Las cuatro herramientas e historial cifrado", "Prioridad de cola"],
    options: [
      { id: "monthly", title: "Mensual con 3 días de prueba", note: "Hoy 0,00 US$. Después, 29,99 US$/mes.", today: "0,00 US$", full: "29,99 US$", next: "29,99 US$", date: "22 de septiembre de 2026", trial: true },
      { id: "yearly", title: "Anual", note: "179,88 US$ hoy, una vez al año. Ahorras 180,00 US$.", today: "179,88 US$", full: "179,88 US$", next: "179,88 US$", date: "19 de septiembre de 2027", trial: false },
    ],
  },
  pro: {
    name: "Pro",
    includes: ["60.000 palabras al mes, 3.000 por petición", "Las cuatro herramientas e historial cifrado", "Desglose por pasajes del detector"],
    options: [
      { id: "monthly", title: "Mensual", note: "14,99 US$ hoy y cada mes.", today: "14,99 US$", full: "14,99 US$", next: "14,99 US$", date: "19 de octubre de 2026", trial: false },
      { id: "yearly", title: "Anual", note: "89,88 US$ hoy, una vez al año. Ahorras 90,00 US$.", today: "89,88 US$", full: "89,88 US$", next: "89,88 US$", date: "19 de septiembre de 2027", trial: false },
    ],
  },
};

export function OrderSummary({ plan = "unlimited", cycle = "monthly", onCycle, compact = false }) {
  const cfg = CYCLES[plan];
  const opt = cfg.options.find((o) => o.id === cycle) || cfg.options[0];

  return (
    <div className="vbx-os">
      <div className="vbx-os-head">
        <div>
          <h2>Verbalyx {cfg.name}</h2>
          <p>Se activa en cuanto confirmes el pago, sin salir de esta página.</p>
        </div>
        {opt.trial && <Badge variant="success" style={{ marginLeft: "auto" }}>Prueba 3 días</Badge>}
      </div>

      {onCycle && (
        <div className="vbx-os-cycle">
          <span className="vbx-os-label">Ciclo de facturación</span>
          {cfg.options.map((o) => (
            <div key={o.id} className="vbx-os-opt" data-on={o.id === cycle} role="radio" aria-checked={o.id === cycle} tabIndex={0} onClick={() => onCycle(o.id)}>
              <span className="vbx-os-radio" />
              <span><b>{o.title}</b><em>{o.note}</em></span>
            </div>
          ))}
        </div>
      )}

      {!compact && (
        <ul className="vbx-os-incl">
          {cfg.includes.map((f) => <li key={f}><i>·</i><span>{f}</span></li>)}
        </ul>
      )}

      <div className="vbx-os-lines">
        <div className="vbx-os-line">
          <span>{cfg.name}, ciclo {cycle === "yearly" ? "anual" : "mensual"}</span>
          <span>{opt.trial ? `${opt.full}/mes` : opt.full}</span>
        </div>
        {opt.trial && (
          <div className="vbx-os-line">
            <span>Prueba de 3 días</span>
            <span>−{opt.full}</span>
          </div>
        )}
        <div className="vbx-os-line">
          <span>Impuestos</span>
          <span>Se calculan al pagar</span>
        </div>
        <div className="vbx-os-total">
          <span>Hoy pagas</span>
          <span>{opt.today}</span>
        </div>
      </div>
    </div>
  );
}
