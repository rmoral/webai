import React from "react";
import { OrderSummary, CYCLES } from "../../components/billing/OrderSummary.jsx";
import { PaymentForm } from "../../components/billing/PaymentForm.jsx";

const __css = `
.vbx-co{max-width:60rem;margin:0 auto;padding:var(--pad-page-y) var(--gutter-page)}
.vbx-co-top{display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-5)}
.vbx-co-top a{font-size:var(--text-sm);color:var(--muted-foreground);cursor:pointer}
.vbx-co h1{margin:0;font-size:var(--text-3xl);font-weight:var(--font-bold);letter-spacing:var(--tracking-tight)}
.vbx-co-lede{margin:var(--space-2) 0 0;font-size:var(--text-base);color:var(--muted-foreground)}
.vbx-co-grid{margin-top:var(--space-8);display:grid;grid-template-columns:1fr 1.05fr;gap:var(--space-6);align-items:start}
.vbx-co-panel{border:1px solid var(--border);border-radius:var(--radius-xl);background:var(--card);box-shadow:var(--shadow-sm);padding:var(--space-6)}
.vbx-co-cancel{position:relative;margin-top:var(--space-4)}
.vbx-co-cancel-link{font-size:var(--text-sm);color:var(--brand);text-decoration:underline;cursor:pointer;background:none;border:0;padding:0;font-family:var(--font-sans)}
.vbx-co-pop{position:absolute;top:calc(100% + 8px);left:0;width:19rem;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-xl);box-shadow:0 8px 26px rgba(0,0,0,.16);padding:var(--space-4);z-index:20}
.vbx-co-pop h3{margin:0 0 var(--space-2);font-size:var(--text-sm);font-weight:var(--font-semibold)}
.vbx-co-pop ol{margin:0;padding-left:var(--space-4);display:flex;flex-direction:column;gap:var(--space-1);font-size:var(--text-sm);color:var(--muted-foreground);line-height:var(--leading-normal)}
@media (max-width:900px){.vbx-co-grid{grid-template-columns:1fr}}
@media (max-width:520px){
  .vbx-co{padding:var(--space-6) var(--space-5) var(--space-10)}
  .vbx-co h1{font-size:var(--text-2xl)}
  .vbx-co-panel{padding:var(--space-5)}
  .vbx-co-pop{width:auto;right:0}
}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-checkout-css")) {
  const el = document.createElement("style");
  el.id = "vbx-checkout-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

export function CheckoutSummary({ plan = "unlimited", initialCycle = "monthly", onBack = () => {}, onPaid = () => {} }) {
  const [cycle, setCycle] = React.useState(initialCycle);
  const [status, setStatus] = React.useState("idle");
  const [howTo, setHowTo] = React.useState(false);
  const cfg = CYCLES[plan];
  const opt = cfg.options.find((o) => o.id === cycle) || cfg.options[0];

  function pay() {
    setStatus("processing");
    setTimeout(() => { setStatus("idle"); onPaid(); }, 1500);
  }

  return (
    <main className="vbx-co">
      <div className="vbx-co-top"><a onClick={onBack}>← Precios</a></div>
      <h1>Completa tu suscripción</h1>
      <p className="vbx-co-lede">Se paga aquí mismo. No te mandamos a ninguna otra página.</p>

      <div className="vbx-co-grid">
        <div className="vbx-co-panel">
          <OrderSummary plan={plan} cycle={cycle} onCycle={setCycle} />
          <div className="vbx-co-cancel">
            <button className="vbx-co-cancel-link" onClick={() => setHowTo(!howTo)}>¿Cómo cancelo?</button>
            {howTo && (
              <div className="vbx-co-pop">
                <h3>Dos pasos, sin escribirnos</h3>
                <ol>
                  <li>Entra en Mi cuenta → Suscripción.</li>
                  <li>Pulsa «Cancelar suscripción» y confirma.</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        <div className="vbx-co-panel">
          <PaymentForm
            amountToday={opt.today}
            payLabel={opt.trial ? "Empezar la prueba" : "Pagar"}
            trial={opt.trial}
            chargeDate={opt.date}
            nextAmount={opt.next}
            email="hola@verbalyx.ai"
            status={status}
            onPay={pay}
          />
        </div>
      </div>
    </main>
  );
}
