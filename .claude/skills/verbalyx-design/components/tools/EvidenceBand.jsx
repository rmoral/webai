import React from "react";

const __css = `
.vbx-eb{display:flex;flex-direction:column;gap:var(--space-4)}
.vbx-eb-head{display:flex;align-items:flex-start;gap:var(--space-3);flex-wrap:wrap}
.vbx-eb-band{display:inline-flex;align-items:center;gap:var(--space-2);height:30px;padding:0 var(--space-3);border-radius:var(--radius-md);font-size:var(--text-sm);font-weight:var(--font-semibold);flex:none}
.vbx-eb-band--none{background:var(--success-soft);border:1px solid var(--success-line);color:var(--success-ink)}
.vbx-eb-band--some{background:var(--warning-soft);border:1px solid var(--warning-line);color:var(--warning-ink)}
.vbx-eb-band--clear{background:var(--danger-soft);border:1px solid var(--danger-line);color:var(--danger-ink)}
.vbx-eb-band--gray{background:var(--muted);border:1px solid var(--border);color:var(--muted-foreground)}
.vbx-eb-dot{width:8px;height:8px;border-radius:50%;background:currentColor;flex:none}
.vbx-eb-scale{display:flex;gap:3px;flex:1;min-width:11rem;align-items:center}
.vbx-eb-step{flex:1;height:6px;border-radius:var(--radius-full);background:var(--border)}
.vbx-eb-step[data-on="true"]{background:currentColor}
.vbx-eb-title{margin:0;font-size:var(--text-base);font-weight:var(--font-semibold);line-height:1.35}
.vbx-eb-note{margin:var(--space-1) 0 0;font-size:var(--text-sm);color:var(--muted-foreground);line-height:var(--leading-normal)}
.vbx-eb-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:var(--space-2)}
.vbx-eb-item{display:flex;gap:var(--space-3);align-items:flex-start;font-size:var(--text-sm);line-height:var(--leading-normal)}
.vbx-eb-tag{display:inline-flex;align-items:center;height:20px;padding:0 var(--space-2);border-radius:var(--radius-sm);font-size:var(--text-xs);font-weight:var(--font-medium);flex:none;margin-top:1px;min-width:4.5rem;justify-content:center}
.vbx-eb-tag--good{background:var(--success-soft);color:var(--success-ink)}
.vbx-eb-tag--warn{background:var(--warning-soft);color:var(--warning-ink)}
.vbx-eb-tag--bad{background:var(--danger-soft);color:var(--danger-ink)}
.vbx-eb-disc{margin:0;font-size:var(--text-sm);color:var(--muted-foreground);line-height:var(--leading-normal)}
@media (max-width:520px){.vbx-eb-scale{min-width:100%;order:3}}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-band-css")) {
  const el = document.createElement("style");
  el.id = "vbx-band-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

const BANDS = {
  none: { label: "Sin indicios", steps: 1, className: "none", title: "No hemos encontrado indicios de escritura automática" },
  some: { label: "Algunos indicios", steps: 2, className: "some", title: "Hay algunos indicios de escritura automática" },
  clear: { label: "Indicios claros", steps: 3, className: "clear", title: "Hay indicios claros de escritura automática" },
  insufficient: { label: "Texto insuficiente", steps: 0, className: "gray", title: "No hay texto suficiente para decir nada" },
};

const DEFAULT_NOTE =
  "Esto es una lectura de patrones, no un veredicto. No existe ninguna prueba que determine con certeza quién escribió un texto, y entre dejar pasar un texto generado y señalar a alguien que escribió el suyo, los dos errores no cuestan lo mismo.";

export function EvidenceBand({
  band = "some",
  findings = [],
  note,
  minWords = 200,
  minSentences = 8,
  children,
}) {
  const cfg = BANDS[band] || BANDS.some;
  const insufficient = band === "insufficient";

  return (
    <div className="vbx-eb">
      <div className="vbx-eb-head">
        <span className={`vbx-eb-band vbx-eb-band--${cfg.className}`}>
          <span className="vbx-eb-dot" />
          {cfg.label}
        </span>
        <span className={`vbx-eb-scale vbx-eb-band--${cfg.className}`} style={{ background: "none", border: 0, height: "auto", padding: 0 }} aria-hidden="true">
          {[1, 2, 3].map((n) => <span key={n} className="vbx-eb-step" data-on={n <= cfg.steps} />)}
        </span>
        {children}
      </div>

      <div>
        <p className="vbx-eb-title">{cfg.title}</p>
        <p className="vbx-eb-note">
          {insufficient
            ? `Necesitamos al menos ${minWords} palabras y ${minSentences} frases para que el análisis signifique algo. Con menos, cualquier lectura sería ruido.`
            : "Estos son los rasgos concretos en los que nos basamos. Léelos: dicen más que una etiqueta."}
        </p>
      </div>

      {!insufficient && findings.length > 0 && (
        <ul className="vbx-eb-list">
          {findings.map((f) => (
            <li className="vbx-eb-item" key={f.label}>
              <span className={`vbx-eb-tag vbx-eb-tag--${f.tone}`}>
                {f.tone === "good" ? "Bien" : f.tone === "warn" ? "Revisa" : "Señal"}
              </span>
              <span>{f.label}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="vbx-eb-disc">{note ?? DEFAULT_NOTE}</p>
    </div>
  );
}
