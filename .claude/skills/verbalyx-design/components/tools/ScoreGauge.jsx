import React from "react";

const __css = `
.vbx-score{display:flex;align-items:center;gap:var(--space-4)}
.vbx-score-ring{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;flex:none}
.vbx-score-ring i{width:48px;height:48px;border-radius:50%;background:var(--card);display:grid;place-items:center;font-style:normal;font-weight:var(--font-semibold);font-size:var(--text-sm)}
.vbx-score-body{display:flex;flex-direction:column;gap:var(--space-1)}
.vbx-score-title{margin:0;font-size:var(--text-base);font-weight:var(--font-semibold)}
.vbx-score-note{margin:0;font-size:var(--text-sm);color:var(--muted-foreground);line-height:var(--leading-normal)}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-score-css")) {
  const el = document.createElement("style");
  el.id = "vbx-score-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

const BANDS = [
  { min: 70, color: "var(--success)", label: "Suena humano" },
  { min: 40, color: "var(--warning-fill)", label: "Dudoso" },
  { min: 0, color: "var(--danger)", label: "Suena a IA" },
];

export function ScoreGauge({ value = 0, label, note, children }) {
  const band = BANDS.find((b) => value >= b.min) || BANDS[BANDS.length - 1];
  return (
    <div className="vbx-score">
      <div
        className="vbx-score-ring"
        style={{ background: `conic-gradient(${band.color} 0 ${value}%, var(--border) ${value}% 100%)` }}
      >
        <i>{value}%</i>
      </div>
      <div className="vbx-score-body">
        <p className="vbx-score-title">{label ?? `${band.label} en un ${value}%`}</p>
        <p className="vbx-score-note">
          {note ??
            "Orientativo: medimos los patrones típicos de la IA. Ningún servicio puede garantizar un resultado frente a detectores de terceros."}
        </p>
      </div>
      {children}
    </div>
  );
}
