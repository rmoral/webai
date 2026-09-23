import React from "react";
import { Button } from "../core/Button.jsx";

// D3 · The strip under the editor panels. Informs, never interrupts: no
// modal, no red. A ceiling is not an error — amber for every kind. The
// user's text is never touched; the dimmed words stay in the box.

const __css = `
.vbx-ln{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3) var(--space-4);padding:var(--space-3) var(--space-5);border-top:1px solid var(--warning-line);background:var(--warning-soft)}
.vbx-ln p{flex:1 1 18rem;margin:0;font-size:var(--text-sm);line-height:var(--leading-normal);color:var(--warning-ink);text-wrap:pretty}
.vbx-ln b{font-weight:var(--font-semibold)}
@media (max-width:520px){.vbx-ln{padding:var(--space-3) var(--space-4)}.vbx-ln .vbx-btn{width:100%;min-height:44px}}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-ln-css")) {
  const el = document.createElement("style");
  el.id = "vbx-ln-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

const n = (v) => Number(v).toLocaleString("es-ES");

export function LimitNotice({
  kind = "overflow",
  plan = "anonymous",
  submitted = 923,
  ceiling = 300,
  remaining = 200,
  dailyLimit = 500,
  freeDaily = 500,
  proRequest = 3000,
  unlimitedRequest = 8000,
  resetsIn = "5 h",
  renewsOn = "14 de octubre",
  topupWords = 25000,
  topupPrice = "9,99 US$",
  onAction = () => {},
}) {
  const anon = plan === "anonymous";
  const signup = `Crear cuenta gratis — ${n(freeDaily)} al día`;
  let lead, body, action;

  if (kind === "overflow") {
    lead = `Procesaremos las primeras ${n(ceiling)} palabras`;
    body = ` de las ${n(submitted)} que has pegado. El resto queda atenuado y sigue en el editor. Pro amplía el límite a ${n(proRequest)} por petición; Ilimitado, a ${n(unlimitedRequest)}.`;
    action = "Ver planes";
  } else if (kind === "partial") {
    lead = `Te quedan ${n(remaining)} palabras hoy.`;
    body = ` Procesaremos las primeras ${n(remaining)} de las ${n(submitted)} que has pegado; el resto queda atenuado y sigue en el editor. Se recargan en ${resetsIn}.`;
    action = anon ? signup : "Ver planes";
  } else if (kind === "exhausted" && plan === "pro") {
    lead = "Has usado las palabras de este mes.";
    body = ` Se renuevan el ${renewsOn}. Tu texto se queda aquí. Una recarga de ${n(topupWords)} palabras cuesta ${topupPrice} y no caduca.`;
    action = "Comprar recarga";
  } else if (kind === "exhausted") {
    lead = `Has usado tus ${n(dailyLimit)} palabras de hoy.`;
    body = ` Se recargan en ${resetsIn}. Tu texto se queda aquí, tal cual.${anon ? ` Con una cuenta gratis tienes ${n(freeDaily)} al día.` : ""}`;
    action = anon ? signup : "Ver planes";
  } else if (kind === "detector") {
    lead = "El detector necesita el texto entero.";
    body = ` Tiene ${n(Math.min(submitted, ceiling))} palabras y hoy te quedan ${n(remaining)}. Analizar solo una parte daría un resultado equivocado sobre el conjunto, así que no lo lanzamos. Se recargan en ${resetsIn}.`;
    action = anon ? signup : "Ver planes";
  }

  return (
    <div className="vbx-ln" role="status" data-kind={kind}>
      <p><b>{lead}</b>{body}</p>
      <Button size="sm" variant="soft" onClick={onAction}>{action}</Button>
    </div>
  );
}
