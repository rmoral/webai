import React from "react";
import { Button } from "../core/Button.jsx";

const __css = `
.vbx-pay{display:flex;flex-direction:column;gap:var(--space-4)}
.vbx-pay-wallets{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2)}
.vbx-pay-wallet{display:flex;align-items:center;justify-content:center;height:44px;border:1px solid var(--border);border-radius:var(--radius-md);background:var(--card);font-family:var(--font-sans);font-size:var(--text-sm);font-weight:var(--font-medium);color:var(--foreground);cursor:pointer;transition:var(--transition-colors)}
.vbx-pay-wallet:hover{background:var(--accent)}
.vbx-pay-wallet:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in oklab,var(--brand) 30%,transparent)}
.vbx-pay-wallet--dark{background:var(--primary);color:var(--primary-foreground);border-color:var(--primary)}
.vbx-pay-wallet--dark:hover{background:color-mix(in oklab,var(--primary) 90%,transparent)}
.vbx-pay-or{display:flex;align-items:center;gap:var(--space-3);color:var(--muted-foreground);font-size:var(--text-xs)}
.vbx-pay-or::before,.vbx-pay-or::after{content:"";flex:1;height:1px;background:var(--border)}
.vbx-pay-field{display:flex;flex-direction:column;gap:var(--space-1-5)}
.vbx-pay-label{font-size:var(--text-sm);font-weight:var(--font-medium)}
.vbx-pay-input{width:100%;height:var(--control-h-lg);border:1px solid var(--input);border-radius:var(--radius-md);background:var(--card);color:var(--foreground);padding:0 var(--space-3);font-family:var(--font-sans);font-size:var(--text-sm);outline:none;transition:var(--transition-colors),box-shadow var(--duration-fast) var(--easing-default)}
.vbx-pay-input::placeholder{color:var(--muted-foreground)}
.vbx-pay-input:focus{border-color:var(--brand);box-shadow:0 0 0 3px color-mix(in oklab,var(--brand) 30%,transparent);position:relative;z-index:2}
.vbx-pay-card{border:1px solid var(--input);border-radius:var(--radius-md);background:var(--card);overflow:hidden}
.vbx-pay-card .vbx-pay-input{border:0;border-radius:0;height:var(--control-h-lg)}
.vbx-pay-card .vbx-pay-input:focus{box-shadow:inset 0 0 0 1px var(--brand),0 0 0 3px color-mix(in oklab,var(--brand) 30%,transparent)}
.vbx-pay-card-num{position:relative;display:flex;align-items:center;border-bottom:1px solid var(--input)}
.vbx-pay-brands{position:absolute;right:var(--space-2);display:flex;gap:4px;pointer-events:none}
.vbx-pay-brand{height:20px;padding:0 5px;line-height:19px;border:1px solid var(--border);border-radius:3px;background:var(--card);font-size:9px;font-weight:700;letter-spacing:.02em;color:var(--muted-foreground)}
.vbx-pay-card-row{display:grid;grid-template-columns:1fr 1px 1fr}
.vbx-pay-card-rule{background:var(--input)}
.vbx-pay-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.vbx-pay-select{width:100%;height:var(--control-h-lg);border:1px solid var(--input);border-radius:var(--radius-md);background:var(--card);color:var(--foreground);padding:0 var(--space-3);font-family:var(--font-sans);font-size:var(--text-sm);outline:none}
.vbx-pay-select:focus{border-color:var(--brand);box-shadow:0 0 0 3px color-mix(in oklab,var(--brand) 30%,transparent)}
.vbx-pay-disc{margin:0;font-size:var(--text-sm);line-height:var(--leading-normal);color:var(--foreground);background:var(--brand-softer);border:1px solid var(--brand-line);border-radius:var(--radius-md);padding:var(--space-3)}
.vbx-pay-disc b{font-weight:var(--font-semibold)}
.vbx-pay-check{display:flex;gap:var(--space-3);align-items:flex-start;font-size:var(--text-sm);line-height:var(--leading-normal);cursor:pointer}
.vbx-pay-check input{width:18px;height:18px;margin:1px 0 0;flex:none;accent-color:var(--brand)}
.vbx-pay-secure{margin:0;font-size:var(--text-sm);color:var(--muted-foreground);line-height:var(--leading-normal)}
.vbx-pay-error{margin:0;display:flex;gap:var(--space-2);font-size:var(--text-sm);line-height:var(--leading-normal);color:var(--danger-ink);background:var(--danger-soft);border:1px solid var(--danger-line);border-radius:var(--radius-md);padding:var(--space-3)}
.vbx-pay-spinner{width:15px;height:15px;border-radius:50%;border:2px solid color-mix(in oklab,var(--brand-fg) 35%,transparent);border-top-color:var(--brand-fg);animation:vbx-spin .7s linear infinite;flex:none}
@keyframes vbx-spin{to{transform:rotate(360deg)}}
@media (max-width:520px){
  .vbx-pay-two{grid-template-columns:1fr}
  .vbx-pay-wallets{grid-template-columns:1fr}
  .vbx-pay .vbx-btn{min-height:48px}
}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-pay-css")) {
  const el = document.createElement("style");
  el.id = "vbx-pay-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

const COUNTRIES = ["España", "México", "Argentina", "Colombia", "Chile", "Estados Unidos", "Otro país"];

export function PaymentForm({
  amountToday = "0,00 US$",
  payLabel = "Empezar la prueba",
  trial = true,
  chargeDate = "22 de septiembre de 2026",
  nextAmount = "29,99 US$",
  email = "",
  status = "idle",
  onPay = () => {},
}) {
  const [agreed, setAgreed] = React.useState(false);
  const busy = status === "processing";

  return (
    <div className="vbx-pay">
      <div className="vbx-pay-wallets">
        <button type="button" className="vbx-pay-wallet vbx-pay-wallet--dark" disabled={busy}>Apple Pay</button>
        <button type="button" className="vbx-pay-wallet" disabled={busy}>Google Pay</button>
      </div>

      <div className="vbx-pay-or">o paga con tarjeta</div>

      <div className="vbx-pay-field">
        <label className="vbx-pay-label" htmlFor="vbx-pay-email">Correo</label>
        <input id="vbx-pay-email" className="vbx-pay-input" type="email" defaultValue={email} placeholder="tu@correo.com" disabled={busy} />
      </div>

      <div className="vbx-pay-field">
        <span className="vbx-pay-label">Datos de la tarjeta</span>
        <div className="vbx-pay-card">
          <div className="vbx-pay-card-num">
            <input className="vbx-pay-input" inputMode="numeric" placeholder="1234 1234 1234 1234" aria-label="Número de tarjeta" disabled={busy} />
            <span className="vbx-pay-brands">
              <span className="vbx-pay-brand">VISA</span>
              <span className="vbx-pay-brand">MC</span>
              <span className="vbx-pay-brand">AMEX</span>
            </span>
          </div>
          <div className="vbx-pay-card-row">
            <input className="vbx-pay-input" inputMode="numeric" placeholder="MM / AA" aria-label="Caducidad" disabled={busy} />
            <div className="vbx-pay-card-rule" />
            <input className="vbx-pay-input" inputMode="numeric" placeholder="CVC" aria-label="Código de seguridad" disabled={busy} />
          </div>
        </div>
      </div>

      <div className="vbx-pay-field">
        <label className="vbx-pay-label" htmlFor="vbx-pay-name">Nombre en la tarjeta</label>
        <input id="vbx-pay-name" className="vbx-pay-input" placeholder="Como aparece en la tarjeta" disabled={busy} />
      </div>

      <div className="vbx-pay-two">
        <div className="vbx-pay-field">
          <label className="vbx-pay-label" htmlFor="vbx-pay-country">País o región</label>
          <select id="vbx-pay-country" className="vbx-pay-select" defaultValue="España" disabled={busy}>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="vbx-pay-field">
          <label className="vbx-pay-label" htmlFor="vbx-pay-zip">Código postal</label>
          <input id="vbx-pay-zip" className="vbx-pay-input" inputMode="numeric" placeholder="28004" disabled={busy} />
        </div>
      </div>

      <p className="vbx-pay-disc">
        {trial ? (
          <React.Fragment>
            <b>Hoy no se te cobra nada.</b> Guardamos tu tarjeta y el {chargeDate}, al terminar los 3 días de prueba,
            se te cobrarán {nextAmount}/mes. La suscripción se renueva automáticamente cada mes hasta que la canceles,
            en dos clics desde tu cuenta y también durante la prueba.
          </React.Fragment>
        ) : (
          <React.Fragment>
            <b>Hoy se te cobran {amountToday}.</b> La suscripción se renueva automáticamente el {chargeDate} por{" "}
            {nextAmount} y se repite cada ciclo hasta que la canceles, en dos clics desde tu cuenta.
          </React.Fragment>
        )}
      </p>

      <label className="vbx-pay-check">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} disabled={busy} />
        <span>Entiendo que la suscripción se renueva automáticamente y que puedo cancelarla online en cualquier momento.</span>
      </label>

      {status === "error" && (
        <p className="vbx-pay-error">
          Tu banco ha rechazado la tarjeta. No se ha cobrado nada. Prueba con otra o revisa los datos.
        </p>
      )}

      <Button size="lg" style={{ width: "100%" }} disabled={!agreed || busy} onClick={onPay}>
        {busy ? <React.Fragment><span className="vbx-pay-spinner" />Procesando el pago…</React.Fragment>
              : `${payLabel} — ${amountToday} hoy`}
      </Button>

      <p className="vbx-pay-secure">
        El pago lo procesa Stripe dentro de esta misma página. Los datos de la tarjeta viajan cifrados directamente a
        Stripe: no pasan por nuestros servidores ni los guardamos.
      </p>
    </div>
  );
}
