import React from "react";
import { Button } from "../core/Button.jsx";
import { Badge } from "../core/Badge.jsx";
import { OrderSummary, CYCLES } from "./OrderSummary.jsx";
import { PaymentForm } from "./PaymentForm.jsx";

const __css = `
.vbx-cm-scrim{position:absolute;inset:0;z-index:55;background:color-mix(in oklab,var(--foreground) 45%,transparent);display:flex;align-items:center;justify-content:center;padding:var(--space-6)}
.vbx-cm-scrim[data-fixed="true"]{position:fixed}
.vbx-cm{position:relative;width:100%;max-width:30rem;max-height:100%;overflow-y:auto;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-xl);box-shadow:0 10px 38px rgba(0,0,0,.18)}
.vbx-cm-top{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-4) var(--space-5);border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--card);z-index:2}
.vbx-cm-back{border:0;background:transparent;font-family:var(--font-sans);font-size:var(--text-sm);color:var(--muted-foreground);cursor:pointer;padding:0;border-radius:var(--radius-sm)}
.vbx-cm-back:hover{color:var(--foreground)}
.vbx-cm-back:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in oklab,var(--brand) 30%,transparent)}
.vbx-cm-title{font-size:var(--text-sm);font-weight:var(--font-semibold)}
.vbx-cm-close{margin-left:auto;width:28px;height:28px;border:0;border-radius:var(--radius-sm);background:transparent;color:var(--muted-foreground);font-size:17px;line-height:1;cursor:pointer}
.vbx-cm-close:hover{background:var(--accent);color:var(--foreground)}
.vbx-cm-sum{padding:var(--space-5);border-bottom:1px solid var(--border);background:color-mix(in oklab,var(--muted) 40%,transparent)}
.vbx-cm-pay{padding:var(--space-5)}
.vbx-cm-done{padding:var(--space-8) var(--space-6);display:flex;flex-direction:column;gap:var(--space-4);text-align:center;align-items:center}
.vbx-cm-done h2{margin:0;font-size:var(--text-2xl);font-weight:var(--font-bold);letter-spacing:-0.02em;line-height:1.15}
.vbx-cm-done p{margin:0;font-size:var(--text-sm);color:var(--muted-foreground);line-height:var(--leading-normal)}
.vbx-cm-donebox{width:100%;border:1px solid var(--border);border-radius:var(--radius-md);padding:var(--space-4);background:var(--card)}
.vbx-cm-donebox span{display:block;font-size:var(--text-sm);color:var(--muted-foreground)}
.vbx-cm-donebox b{display:block;font-size:var(--text-xl);font-weight:var(--font-semibold);letter-spacing:-0.01em;margin-top:2px}
.vbx-cm-doneacts{display:flex;flex-direction:column;gap:var(--space-2);width:100%}
@media (max-width:520px){
  .vbx-cm-scrim{padding:0;align-items:flex-end}
  .vbx-cm{max-width:none;border-radius:var(--radius-xl) var(--radius-xl) 0 0;border-bottom:0;max-height:96%}
  .vbx-cm-doneacts .vbx-btn{min-height:44px}
}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-comodal-css")) {
  const el = document.createElement("style");
  el.id = "vbx-comodal-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

export function CheckoutModal({
  plan = "unlimited",
  cycle = "monthly",
  fixed = false,
  onBack = () => {},
  onDismiss = () => {},
  onDone = () => {},
}) {
  const [status, setStatus] = React.useState("idle");
  const cfg = CYCLES[plan];
  const opt = cfg.options.find((o) => o.id === cycle) || cfg.options[0];

  function pay() {
    setStatus("processing");
    setTimeout(() => setStatus("done"), 1500);
  }

  return (
    <div className="vbx-cm-scrim" data-fixed={fixed} role="dialog" aria-modal="true" aria-label={`Pagar Verbalyx ${cfg.name}`}>
      <div className="vbx-cm">
        {status === "done" ? (
          <div className="vbx-cm-done">
            <Badge variant="success" dot>{opt.trial ? "Prueba activa" : "Suscripción activa"}</Badge>
            <h2>{opt.trial ? "Tu prueba empieza ahora" : `Ya estás en ${cfg.name}`}</h2>
            <p>
              {opt.trial
                ? "Tienes 3 días con todo desbloqueado y no se te ha cobrado nada. Tu texto sigue en el editor, tal cual lo dejaste."
                : "El pago se ha completado. Tu texto sigue en el editor, tal cual lo dejaste."}
            </p>
            <div className="vbx-cm-donebox">
              <span>{opt.trial ? "Primer cobro" : "Próxima renovación"}</span>
              <b>{opt.date}</b>
              <span style={{ marginTop: 4 }}>{opt.next}{opt.trial ? "/mes, salvo que canceles antes" : ", renovación automática"}</span>
            </div>
            <div className="vbx-cm-doneacts">
              <Button size="lg" onClick={onDone}>Seguir donde estaba</Button>
              <Button variant="outline" onClick={onDone}>Gestionar suscripción</Button>
            </div>
            <p>Te hemos enviado un correo con la fecha y el importe. {opt.trial && "Te avisamos otra vez 24 h antes del cobro."}</p>
          </div>
        ) : (
          <React.Fragment>
            <div className="vbx-cm-top">
              <button className="vbx-cm-back" onClick={onBack}>←</button>
              <span className="vbx-cm-title">Pagar sin salir de aquí</span>
              <button className="vbx-cm-close" onClick={onDismiss} aria-label="Cerrar">×</button>
            </div>
            <div className="vbx-cm-sum">
              <OrderSummary plan={plan} cycle={cycle} compact />
            </div>
            <div className="vbx-cm-pay">
              <PaymentForm
                amountToday={opt.today}
                payLabel={opt.trial ? "Empezar la prueba" : "Pagar"}
                trial={opt.trial}
                chargeDate={opt.date}
                nextAmount={opt.next}
                status={status}
                onPay={pay}
              />
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}
