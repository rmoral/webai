import React from "react";
import { Badge } from "../../components/core/Badge.jsx";
import { Button } from "../../components/core/Button.jsx";

const __css = `
.vbx-cf{max-width:38rem;margin:0 auto;padding:var(--space-16) var(--gutter-page) var(--pad-page-y);display:flex;flex-direction:column;gap:var(--space-6)}
.vbx-cf h1{margin:var(--space-4) 0 0;font-size:var(--text-3xl);font-weight:var(--font-bold);letter-spacing:var(--tracking-tight);line-height:1.1}
.vbx-cf-lede{margin:var(--space-3) 0 0;font-size:var(--text-lg);color:var(--muted-foreground);line-height:var(--leading-normal)}
.vbx-cf-date{border:1px solid var(--border);border-radius:var(--radius-xl);background:var(--card);box-shadow:var(--shadow-sm);padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-1)}
.vbx-cf-date span{font-size:var(--text-sm);color:var(--muted-foreground)}
.vbx-cf-date b{font-size:var(--text-2xl);font-weight:var(--font-semibold);letter-spacing:-0.015em}
.vbx-cf-date em{font-style:normal;font-size:var(--text-sm);color:var(--muted-foreground);margin-top:var(--space-1)}
.vbx-cf-rows{display:flex;flex-direction:column;gap:var(--space-2)}
.vbx-cf-row{display:flex;justify-content:space-between;gap:var(--space-4);font-size:var(--text-sm);padding-bottom:var(--space-2);border-bottom:1px solid var(--border)}
.vbx-cf-row span:last-child{font-variant-numeric:tabular-nums;color:var(--muted-foreground)}
.vbx-cf-actions{display:flex;gap:var(--space-3);flex-wrap:wrap;align-items:center}
.vbx-cf-note{margin:0;font-size:var(--text-sm);color:var(--muted-foreground);line-height:var(--leading-normal)}
@media (max-width:520px){
  .vbx-cf{padding:var(--space-8) var(--space-5) var(--space-10)}
  .vbx-cf h1{font-size:var(--text-2xl)}
  .vbx-cf-actions{flex-direction:column;align-items:stretch}
  .vbx-cf-actions .vbx-btn{min-height:44px;width:100%}
}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-confirm-css")) {
  const el = document.createElement("style");
  el.id = "vbx-confirm-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

export function PurchaseConfirmation({
  plan = "Ilimitado",
  trial = true,
  chargeDate = "21 de septiembre de 2026",
  amount = "29,99 US$",
  email = "hola@verbalyx.ai",
  onOpenApp = () => {},
  onManage = () => {},
}) {
  return (
    <main className="vbx-cf">
      <div>
        <Badge variant="success" dot>{trial ? "Prueba activa" : "Suscripción activa"}</Badge>
        <h1>{trial ? "Tu prueba de Ilimitado empieza ahora" : `Ya estás en ${plan}`}</h1>
        <p className="vbx-cf-lede">
          {trial
            ? "Tienes 3 días con todo desbloqueado. No se te ha cobrado nada todavía."
            : "El pago se ha completado y tu plan ya está activo."}
        </p>
      </div>

      <div className="vbx-cf-date">
        <span>{trial ? "Primer cobro" : "Próxima renovación"}</span>
        <b>{chargeDate}</b>
        <em>{amount}{trial ? "/mes, salvo que canceles antes" : ", renovación automática"}</em>
      </div>

      <div className="vbx-cf-rows">
        <div className="vbx-cf-row"><span>Plan</span><span>Verbalyx {plan}</span></div>
        <div className="vbx-cf-row"><span>Hoy has pagado</span><span>{trial ? "0,00 US$" : amount}</span></div>
        <div className="vbx-cf-row"><span>Confirmación enviada a</span><span>{email}</span></div>
      </div>

      <div className="vbx-cf-actions">
        <Button size="lg" onClick={onOpenApp}>Ir a la app</Button>
        <Button variant="outline" onClick={onManage}>Gestionar suscripción</Button>
      </div>

      <p className="vbx-cf-note">
        Te hemos enviado un correo con la fecha y el importe exactos. {trial && "El día antes del cobro te avisamos otra vez. "}
        Puedes cancelar en dos clics desde tu cuenta, sin llamadas ni correos.
      </p>
    </main>
  );
}
