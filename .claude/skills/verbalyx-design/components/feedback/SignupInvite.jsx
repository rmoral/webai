import React from "react";
import { Button } from "../core/Button.jsx";

// D5 · The invitation under the first anonymous result. It shows when the
// result has landed (the good moment), never alongside a wall (the bad
// one), and once dismissed it does not come back.

const __css = `
.vbx-si{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3) var(--space-5);padding:var(--space-4) var(--space-5);border:1px solid var(--brand-line);border-radius:var(--radius-xl);background:var(--brand-softer)}
.vbx-si-copy{flex:1 1 20rem;min-width:0}
.vbx-si-copy p{margin:0;font-size:var(--text-sm);line-height:var(--leading-normal);color:var(--foreground);text-wrap:pretty}
.vbx-si-copy p + p{margin-top:2px;color:var(--muted-foreground)}
.vbx-si-copy b{font-weight:var(--font-semibold)}
.vbx-si-num{font-variant-numeric:tabular-nums}
.vbx-si-num s{color:var(--muted-foreground);text-decoration-thickness:1px}
.vbx-si-acts{display:flex;align-items:center;gap:var(--space-2)}
.vbx-si-done{margin:0;font-size:var(--text-sm);line-height:var(--leading-normal);color:var(--muted-foreground)}
@media (max-width:520px){.vbx-si{padding:var(--space-4)}.vbx-si-acts{width:100%}.vbx-si-acts .vbx-btn{flex:1;min-height:44px}}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-si-css")) {
  const el = document.createElement("style");
  el.id = "vbx-si-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

export function SignupInvite({ anonDaily = 300, freeDaily = 500, dismissed = false, onSignup = () => {}, onDismiss = () => {} }) {
  if (dismissed) {
    return (
      <p className="vbx-si-done" role="status">
        Hecho, no volveremos a mostrarlo. Si cambias de idea, «Crear cuenta gratis» está arriba a la derecha.
      </p>
    );
  }
  return (
    <aside className="vbx-si" aria-label="Crear una cuenta gratis">
      <div className="vbx-si-copy">
        <p>
          <b>Con una cuenta gratis tienes <span className="vbx-si-num">{freeDaily}</span> palabras al día</b>, no{" "}
          <span className="vbx-si-num">{anonDaily}</span>.
        </p>
        <p>Sin contraseña ni tarjeta: con Google o con un enlace a tu correo. Este resultado se queda aquí.</p>
      </div>
      <div className="vbx-si-acts">
        <Button size="sm" variant="soft" onClick={onSignup}>Crear cuenta gratis</Button>
        <Button size="sm" variant="ghost" onClick={onDismiss}>Ahora no</Button>
      </div>
    </aside>
  );
}
