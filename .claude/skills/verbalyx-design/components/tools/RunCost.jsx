import React from "react";

// D3 · What the next run will cost, next to the button: before the click,
// not after. «923 palabras · se procesarán 200 · te quedan 200».

const __css = `
.vbx-rc{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 6px;font-size:var(--text-sm);line-height:1.4;color:var(--muted-foreground);font-variant-numeric:tabular-nums}
.vbx-rc i{font-style:normal;color:var(--muted-foreground);opacity:.55}
.vbx-rc .over{color:var(--danger-ink);font-weight:var(--font-medium)}
.vbx-rc .cut{color:var(--warning-ink);font-weight:var(--font-medium)}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-rc-css")) {
  const el = document.createElement("style");
  el.id = "vbx-rc-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

const n = (v) => Number(v).toLocaleString("es-ES");

export function RunCost({ words = 0, ceiling = 300, remaining = null, window = "hoy", detector = false }) {
  if (words === 0) return null;
  const cap = remaining === null ? ceiling : Math.min(ceiling, remaining);
  const processable = Math.min(words, cap);
  const over = words > cap;
  const Sep = () => <i aria-hidden="true">·</i>;
  return (
    <p className="vbx-rc" style={{ margin: 0 }} data-testid="run-cost">
      <span className={over ? "over" : ""}>{n(words)} palabras</span>
      {remaining === 0 ? (
        <><Sep /><span className="cut">no te quedan palabras {window}</span></>
      ) : detector && over && remaining !== null && remaining < Math.min(words, ceiling) ? (
        <><Sep /><span className="cut">necesita {n(Math.min(words, ceiling))}</span><Sep /><span>te quedan {n(remaining)}</span></>
      ) : (
        <>
          {over && (<><Sep /><span className="cut">se procesarán {n(processable)}</span></>)}
          {remaining !== null && (<><Sep /><span>te quedan {n(remaining)}{over ? "" : ` ${window}`}</span></>)}
        </>
      )}
    </p>
  );
}
