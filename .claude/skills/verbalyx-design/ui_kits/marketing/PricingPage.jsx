import React from "react";
import { Badge } from "../../components/core/Badge.jsx";
import { Button } from "../../components/core/Button.jsx";

// D2 · /precios (ticket C9). Annual by default; the trial is explained in
// one line under the toggle instead of being hidden by it. One badge on
// the whole page, one filled CTA on the whole page. Every figure mirrors
// lib/billing/plans.ts on main — the component receives them, it does not
// invent them.

const __css = `
.vbx-pr{max-width:65rem;margin:0 auto;padding:var(--pad-page-y) var(--gutter-page)}
.vbx-pr h1{margin:0;font-size:var(--text-4xl);font-weight:var(--font-bold);letter-spacing:var(--tracking-tight)}
.vbx-pr-lede{margin:var(--space-3) 0 0;font-size:var(--text-lg);color:var(--muted-foreground);max-width:40rem;text-wrap:pretty}
.vbx-pr-cycle{margin-top:var(--space-8);display:flex;flex-direction:column;gap:var(--space-3)}
.vbx-pr-cycle-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3)}
.vbx-pr-toggle{display:inline-flex;padding:3px;border:1px solid var(--border);border-radius:var(--radius-md);background:var(--muted);gap:2px}
.vbx-pr-toggle button{height:var(--control-h-sm);padding:0 var(--space-4);border:0;border-radius:var(--radius-sm);background:transparent;font-family:var(--font-sans);font-size:var(--text-sm);font-weight:var(--font-medium);color:var(--muted-foreground);cursor:pointer;transition:var(--transition-colors)}
.vbx-pr-toggle button[aria-checked="true"]{background:var(--card);color:var(--foreground);box-shadow:var(--shadow-xs)}
.vbx-pr-toggle button:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in oklab,var(--brand) 30%,transparent)}
.vbx-pr-save{font-size:var(--text-sm);font-weight:var(--font-medium);color:var(--success-ink)}
.vbx-pr-hint{margin:0;font-size:var(--text-sm);line-height:var(--leading-normal);color:var(--muted-foreground)}
.vbx-pr-hint button{border:0;padding:0;background:none;font:inherit;color:var(--brand);text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.vbx-pr-grid{margin-top:var(--space-6);display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-4);align-items:stretch}
.vbx-pr-card{border:1px solid var(--border);border-radius:var(--radius-xl);background:var(--card);box-shadow:var(--shadow-sm);padding:var(--space-6);display:flex;flex-direction:column;gap:var(--space-4)}
.vbx-pr-card[data-featured="true"]{border-color:var(--brand);box-shadow:0 0 0 1px var(--brand),var(--shadow-sm)}
.vbx-pr-head{display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap;min-height:22px}
.vbx-pr-head h2{margin:0;font-size:var(--text-base);font-weight:var(--font-semibold)}
.vbx-pr-price{display:flex;align-items:baseline;gap:var(--space-1-5);flex-wrap:wrap}
.vbx-pr-price b{font-size:var(--text-4xl);font-weight:var(--font-bold);letter-spacing:-0.03em;line-height:1;font-variant-numeric:tabular-nums}
.vbx-pr-price span{font-size:var(--text-sm);color:var(--muted-foreground)}
.vbx-pr-total{margin:var(--space-1-5) 0 0;font-size:var(--text-sm);font-weight:var(--font-medium);color:var(--foreground);min-height:1.3em}
.vbx-pr-billed{margin:var(--space-1) 0 0;font-size:var(--text-sm);color:var(--muted-foreground);line-height:var(--leading-normal)}
.vbx-pr-feat{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:var(--space-2);flex:1}
.vbx-pr-feat li{display:flex;gap:var(--space-2);font-size:var(--text-sm);line-height:var(--leading-normal)}
.vbx-pr-feat i{font-style:normal;color:var(--brand);font-weight:700;flex:none}
.vbx-pr-current{display:flex;align-items:center;justify-content:center;height:var(--control-h-lg);border:1px dashed var(--border);border-radius:var(--radius-md);font-size:var(--text-sm);font-weight:var(--font-medium);color:var(--muted-foreground)}
.vbx-pr-disc{margin:0;font-size:var(--text-sm);line-height:var(--leading-normal);color:var(--brand-ink);background:var(--brand-softer);border:1px solid var(--brand-line);border-radius:var(--radius-md);padding:var(--space-3);text-wrap:pretty}
.vbx-pr-bands{margin-top:var(--space-6);display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-4)}
.vbx-pr-band{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-4) var(--space-5);border-radius:var(--radius-xl);border:1px solid var(--border);background:var(--card);font-size:var(--text-sm);line-height:var(--leading-normal)}
.vbx-pr-band b{font-size:var(--text-xl);font-weight:var(--font-semibold);letter-spacing:-0.01em;font-variant-numeric:tabular-nums;white-space:nowrap}
.vbx-pr-band span{color:var(--muted-foreground)}
.vbx-pr-band[data-tone="success"]{border-color:var(--success-line);background:var(--success-soft)}
.vbx-pr-band[data-tone="success"] span{color:var(--success-ink)}
.vbx-pr-band[data-tone="success"] strong{color:var(--success-ink);font-weight:var(--font-semibold)}
.vbx-pr-sec{margin-top:var(--space-16)}
.vbx-pr-sec h2{margin:0 0 var(--space-5);font-size:var(--text-2xl);font-weight:var(--font-semibold);letter-spacing:-0.01em}
.vbx-pr-tablewrap{overflow-x:auto;border:1px solid var(--border);border-radius:var(--radius-md)}
.vbx-pr-table{width:100%;min-width:34rem;border-collapse:collapse;font-size:var(--text-sm)}
.vbx-pr-table th,.vbx-pr-table td{padding:var(--space-3);text-align:left;border-top:1px solid var(--border)}
.vbx-pr-table thead th{background:color-mix(in oklab,var(--muted) 50%,transparent);font-weight:var(--font-medium);border-top:0}
.vbx-pr-table td:not(:first-child),.vbx-pr-table th:not(:first-child){text-align:center}
.vbx-pr-table tbody th{font-weight:var(--font-normal)}
.vbx-pr-no{color:var(--muted-foreground)}
.vbx-pr-yes{color:var(--success-ink);font-weight:var(--font-medium)}
.vbx-pr-faq{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-6) var(--space-8)}
.vbx-pr-faq h3{margin:0;font-size:var(--text-base);font-weight:var(--font-medium)}
.vbx-pr-faq p{margin:var(--space-2) 0 0;font-size:var(--text-sm);color:var(--muted-foreground);line-height:var(--leading-normal)}
.vbx-pr-topup{margin-top:var(--space-10);display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-4);padding:var(--space-5);border:1px solid var(--border);border-radius:var(--radius-xl)}
.vbx-pr-topup div{flex:1 1 20rem}
.vbx-pr-topup h3{margin:0;font-size:var(--text-base);font-weight:var(--font-semibold)}
.vbx-pr-topup p{margin:var(--space-1) 0 0;font-size:var(--text-sm);color:var(--muted-foreground);line-height:var(--leading-normal)}
.vbx-pr-foot{margin:var(--space-10) 0 0;font-size:var(--text-sm);color:var(--muted-foreground);line-height:var(--leading-normal);max-width:52rem}
.vbx-pr-foot a{color:inherit;text-decoration:underline}
@media (max-width:900px){.vbx-pr-grid{grid-template-columns:minmax(0,1fr)}.vbx-pr-card[data-featured="true"]{order:-1}.vbx-pr-faq,.vbx-pr-bands{grid-template-columns:minmax(0,1fr)}}
@media (max-width:520px){
  .vbx-pr{padding:var(--space-8) var(--space-5) var(--space-12)}
  .vbx-pr h1{font-size:var(--text-3xl)}
  .vbx-pr-lede{font-size:var(--text-base)}
  .vbx-pr-toggle{width:100%}.vbx-pr-toggle button{flex:1;min-height:40px}
  .vbx-pr-card{padding:var(--space-5)}
  .vbx-pr-card .vbx-btn{min-height:44px}
  .vbx-pr-band{flex-direction:column;align-items:flex-start;gap:var(--space-1)}
}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-pricing-css")) {
  const el = document.createElement("style");
  el.id = "vbx-pricing-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

const ROWS = [
  ["Palabras al día", "500", "—", "—"],
  ["Palabras al mes", "—", "60.000", "500.000"],
  ["Palabras por petición", "300", "3000", "8000"],
  ["Herramientas", "Humanizador y detector", "Las cuatro", "Las cuatro"],
  ["Historial cifrado", false, true, true],
  ["Desglose por pasajes", false, true, true],
  ["Prioridad de cola", false, false, true],
  ["Recarga de palabras", "Requiere un plan de pago", "9,99 US$ por 25.000, sin caducidad", "9,99 US$ por 25.000, sin caducidad"],
];

const FAQ = [
  ["¿Cuándo se me cobra?", "En Pro y en Ilimitado anual, hoy mismo al completar el pago. En la prueba de Ilimitado, al cuarto día: los tres primeros no se cobra nada y verás la fecha exacta antes de dar la tarjeta."],
  ["¿Cómo cancelo?", "Desde tu cuenta, en dos clics, cuando quieras. No hay que llamar ni escribir un correo. Si cancelas durante la prueba, no se cobra nada."],
  ["¿Qué pasa cuando termina la prueba?", "El día 3, al entrar, te preguntamos qué quieres hacer: seguir en Ilimitado, bajar a Pro con prorrateo o cancelar. Si no haces nada, se renueva en Ilimitado."],
  ["¿Las palabras caducan?", "Las del plan se reinician cada mes. Las de una recarga no caducan mientras tengas una suscripción activa."],
  ["¿Los precios llevan impuestos?", "Sí. El precio que ves es el que se cobra: el impuesto sobre ventas de EE. UU. o el IVA de tu país, cuando corresponda, ya está incluido. No hay sorpresas en el último paso."],
  ["¿Hacéis reembolsos?", "Si algo ha ido mal, escríbenos y lo miramos caso por caso. La prueba de 3 días existe precisamente para que no tengas que pedir uno."],
];

export function PricingPage({
  initialCycle = "yearly",
  session = "anon",
  wordsProcessed = null,
  since = "marzo de 2026",
  trialEndsOn = "26 de septiembre de 2026",
  onNavigate = () => {},
}) {
  const [cycle, setCycle] = React.useState(initialCycle);
  const yearly = cycle === "yearly";
  const signedIn = session !== "anon";

  const plans = [
    {
      id: "free",
      name: "Gratis",
      price: "0 US$",
      total: null,
      billed: "Sin tarjeta. Para siempre.",
      features: ["500 palabras al día", "Hasta 300 por petición", "Humanizador y detector (banda y evidencia)"],
      cta: session === "free" ? { current: true } : session === "anon" ? { label: "Crear cuenta gratis", variant: "outline", to: "registro" } : null,
    },
    {
      id: "pro",
      name: "Pro",
      price: yearly ? "7,49 US$" : "14,99 US$",
      total: yearly ? "89,88 US$ al año" : null,
      billed: yearly ? "Se cobran 89,88 US$ hoy, una vez al año." : "Se cobran 14,99 US$ hoy y cada mes.",
      features: ["60.000 palabras al mes", "Hasta 3000 por petición", "Las cuatro herramientas", "Historial cifrado y desglose por pasajes"],
      cta: session === "pro"
        ? { current: true }
        : session === "unlimited"
          ? { label: "Cambiar a Pro", variant: "outline", to: "cuenta" }
          : { label: yearly ? "Elegir Pro anual" : "Elegir Pro mensual", variant: "outline", to: "checkout" },
    },
    {
      id: "unlimited",
      name: "Ilimitado",
      featured: true,
      price: yearly ? "14,99 US$" : "29,99 US$",
      total: yearly ? "179,88 US$ al año" : null,
      billed: yearly ? "Se cobran 179,88 US$ hoy, una vez al año." : "3 días gratis. Después, 29,99 US$ al mes.",
      features: ["500.000 palabras al mes", "Hasta 8000 por petición", "Prioridad de cola", "Todo lo de Pro"],
      cta: session === "unlimited"
        ? { current: true }
        : session === "pro"
          ? { label: "Cambiar a Ilimitado", variant: "default", to: "cuenta" }
          : { label: yearly ? "Elegir Ilimitado anual" : "Probar 3 días gratis", variant: "default", to: "checkout" },
      disclosure: session === "pro"
        ? "El cambio se hace desde Mi cuenta. Antes de confirmar verás el importe exacto que se ajusta en tu próxima factura."
        : session === "unlimited"
          ? null
          : yearly
            ? "El plan anual se cobra hoy, entero: 179,88 US$. No lleva prueba gratuita — la prueba de 3 días solo existe en el ciclo mensual, para que nadie acabe con un cargo anual que no esperaba."
            : `Hoy no se te cobra nada. El ${trialEndsOn}, al terminar los 3 días de prueba, se te cobrarán 29,99 US$/mes salvo que canceles antes. Puedes cancelar o cambiar a Pro (14,99 US$/mes) en dos clics desde tu cuenta.`,
    },
  ];

  return (
    <main className="vbx-pr">
      <h1>Precios</h1>
      <p className="vbx-pr-lede">
        {session === "pro" || session === "unlimited"
          ? "Tu plan está marcado. Los cambios de plan se hacen desde Mi cuenta, con el importe a la vista antes de confirmar."
          : "Empieza gratis. Paga solo si necesitas más palabras o las cuatro herramientas."}
      </p>

      <div className="vbx-pr-cycle">
        <div className="vbx-pr-cycle-row">
          <div className="vbx-pr-toggle" role="radiogroup" aria-label="Ciclo de facturación">
            <button role="radio" aria-checked={yearly} onClick={() => setCycle("yearly")}>Anual</button>
            <button role="radio" aria-checked={!yearly} onClick={() => setCycle("monthly")}>Mensual</button>
          </div>
          {yearly && <span className="vbx-pr-save">Ahorra 50 % (seis meses gratis)</span>}
        </div>
        {session !== "pro" && session !== "unlimited" && (
          <p className="vbx-pr-hint">
            {yearly ? (
              <>¿Prefieres probar antes? La prueba gratis de 3 días está en Ilimitado mensual.{" "}
                <button onClick={() => setCycle("monthly")}>Ver precios mensuales</button></>
            ) : (
              <>Pagando al año ahorras un 50 % (seis meses gratis), sin prueba gratuita.{" "}
                <button onClick={() => setCycle("yearly")}>Ver precios anuales</button></>
            )}
          </p>
        )}
      </div>

      <div className="vbx-pr-grid">
        {plans.map((plan) => (
          <section className="vbx-pr-card" key={plan.id} data-featured={!!plan.featured} aria-label={`Plan ${plan.name}`}>
            <div className="vbx-pr-head">
              <h2>{plan.name}</h2>
              {plan.featured && <Badge variant="brand">Más popular</Badge>}
            </div>
            <div>
              <div className="vbx-pr-price" data-testid="plan-price">
                <b>{plan.price}</b>
                {plan.id !== "free" && <span>/mes</span>}
              </div>
              {plan.id !== "free" && <p className="vbx-pr-total" data-testid="plan-total">{plan.total || "\u00a0"}</p>}
              <p className="vbx-pr-billed">{plan.billed}</p>
            </div>
            <ul className="vbx-pr-feat">
              {plan.features.map((f) => (<li key={f}><i>·</i><span>{f}</span></li>))}
            </ul>
            {plan.cta && (plan.cta.current ? (
              <div className="vbx-pr-current">Tu plan actual</div>
            ) : (
              <Button variant={plan.cta.variant} size="lg" style={{ width: "100%" }} onClick={() => onNavigate(plan.cta.to)}>
                {plan.cta.label}
              </Button>
            ))}
            {plan.disclosure && <p className="vbx-pr-disc" data-testid="trial-disclosure">{plan.disclosure}</p>}
          </section>
        ))}
      </div>

      <div className="vbx-pr-bands">
        {wordsProcessed && (
          <div className="vbx-pr-band">
            <b>{wordsProcessed}</b>
            <span>de palabras procesadas en Verbalyx desde {since}.</span>
          </div>
        )}
        <div className="vbx-pr-band" data-tone="success" style={wordsProcessed ? null : { gridColumn: "1 / -1" }}>
          <span><strong>Cancela online en dos clics</strong>, cuando quieras: Mi cuenta → Suscripción → Cancelar. Sin llamadas ni correos.</span>
        </div>
      </div>

      <section className="vbx-pr-sec">
        <h2>Qué incluye cada plan</h2>
        <div className="vbx-pr-tablewrap">
          <table className="vbx-pr-table">
            <thead>
              <tr><th scope="col"><span style={{ position: "absolute", left: -9999 }}>Característica</span></th><th scope="col">Gratis</th><th scope="col">Pro</th><th scope="col">Ilimitado</th></tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row[0]}>
                  <th scope="row">{row[0]}</th>
                  {row.slice(1).map((cell, i) => (
                    <td key={i}>
                      {cell === true ? <span className="vbx-pr-yes">Sí</span> : cell === false ? <span className="vbx-pr-no">No</span> : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="vbx-pr-sec">
        <h2>Preguntas sobre la facturación</h2>
        <div className="vbx-pr-faq">
          {FAQ.map(([q, a]) => (<div key={q}><h3>{q}</h3><p>{a}</p></div>))}
        </div>
      </section>

      <div className="vbx-pr-topup">
        <div>
          <h3>Recarga de palabras</h3>
          <p>9,99 US$ por 25.000 palabras adicionales. No caducan. Requiere una suscripción activa.</p>
        </div>
        <Button variant="outline" onClick={() => onNavigate(signedIn ? "recarga" : "registro")}>Comprar recarga</Button>
      </div>

      <p className="vbx-pr-foot">
        Precios en dólares estadounidenses, impuestos incluidos: el impuesto sobre ventas de EE. UU. o el IVA de tu
        país, cuando corresponda, ya está dentro del precio que ves. La renovación es automática y puedes cancelar en
        línea, en cualquier momento, desde tu cuenta. Consulta los <a href="#">términos del servicio</a>.
      </p>
    </main>
  );
}
