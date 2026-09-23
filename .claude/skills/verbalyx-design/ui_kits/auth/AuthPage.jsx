import React from "react";
import { Button } from "../../components/core/Button.jsx";
import { Input } from "../../components/forms/Input.jsx";

// D4 · /registro and /login (ticket C10). One email field, no password, no
// extra fields. Google is the main option and carries its logo. When the
// visitor arrives from a plan (`next=/checkout?plan=…&cycle=…`) the plan
// they chose sits beside the form, so the intention is not lost on the way
// to the card.

const __css = `
.vbx-auth{min-height:100%;display:flex;flex-direction:column}
.vbx-auth-top{display:flex;align-items:center;gap:var(--space-4);height:56px;padding:0 var(--space-6);border-bottom:1px solid var(--border)}
.vbx-auth-steps{margin-left:auto;display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-xs);color:var(--muted-foreground)}
.vbx-auth-steps b{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:var(--radius-full);border:1px solid var(--border);font-size:11px;font-weight:var(--font-semibold);color:var(--muted-foreground)}
.vbx-auth-steps [data-on="true"]{color:var(--foreground);font-weight:var(--font-medium)}
.vbx-auth-steps [data-on="true"] b{background:var(--brand);border-color:var(--brand);color:var(--brand-fg)}
.vbx-auth-steps i{width:16px;height:1px;background:var(--border)}
.vbx-auth-main{flex:1;display:flex;align-items:center;justify-content:center;padding:var(--space-10) var(--space-6)}
.vbx-auth-grid{width:100%;max-width:26rem;display:grid;gap:var(--space-10)}
.vbx-auth-grid[data-plan="true"]{max-width:54rem;grid-template-columns:minmax(0,26rem) minmax(0,20rem);justify-content:space-between;align-items:start}
.vbx-auth-card{display:flex;flex-direction:column;gap:var(--space-5)}
.vbx-auth-card h1{margin:0;font-size:var(--text-2xl);font-weight:var(--font-semibold);letter-spacing:-0.015em;line-height:1.25;text-wrap:balance}
.vbx-auth-card .lede{margin:var(--space-2) 0 0;font-size:var(--text-sm);color:var(--muted-foreground);line-height:var(--leading-normal);text-wrap:pretty}
.vbx-auth-or{display:flex;align-items:center;gap:var(--space-3);color:var(--muted-foreground);font-size:var(--text-xs)}
.vbx-auth-or::before,.vbx-auth-or::after{content:"";flex:1;height:1px;background:var(--border)}
.vbx-auth-form{display:flex;flex-direction:column;gap:var(--space-2)}
.vbx-auth-gain{margin:0;padding:var(--space-3) var(--space-4);list-style:none;display:flex;flex-direction:column;gap:var(--space-2);background:var(--brand-softer);border:1px solid var(--brand-line);border-radius:var(--radius-md)}
.vbx-auth-gain li{display:flex;gap:var(--space-2);font-size:var(--text-sm);line-height:var(--leading-normal);color:var(--brand-ink)}
.vbx-auth-gain span{color:var(--brand);font-weight:700;flex:none}
.vbx-auth-p{margin:0;font-size:var(--text-sm);color:var(--muted-foreground);line-height:var(--leading-normal)}
.vbx-auth-p a{color:var(--brand);text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.vbx-auth-legal a{color:var(--foreground)}
.vbx-auth-sent{display:flex;flex-direction:column;gap:var(--space-3);border:1px solid var(--success-line);background:var(--success-soft);border-radius:var(--radius-md);padding:var(--space-4)}
.vbx-auth-sent p{margin:0;font-size:var(--text-sm);color:var(--success-ink);line-height:var(--leading-normal)}
.vbx-auth-sent a{color:var(--success-ink);text-decoration:underline;cursor:pointer}
.vbx-gbtn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;height:48px;border-radius:var(--radius-md);border:1px solid #747775;background:#fff;color:#1f1f1f;font-family:var(--font-sans);font-size:var(--text-base);font-weight:var(--font-medium);cursor:pointer;transition:var(--transition-colors)}
.vbx-gbtn:hover{background:#f7f8f8}
.vbx-gbtn:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in oklab,var(--brand) 30%,transparent)}
.vbx-gbtn svg{width:20px;height:20px;flex:none}
.vbx-plan{border:1px solid var(--border);border-radius:var(--radius-xl);background:var(--card);box-shadow:var(--shadow-sm);padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-4)}
.vbx-plan-k{margin:0;font-size:var(--text-xs);font-weight:var(--font-semibold);letter-spacing:0.06em;text-transform:uppercase;color:var(--muted-foreground)}
.vbx-plan-name{margin:var(--space-1) 0 0;font-size:var(--text-lg);font-weight:var(--font-semibold)}
.vbx-plan-name span{font-weight:var(--font-normal);color:var(--muted-foreground)}
.vbx-plan dl{margin:0;display:flex;flex-direction:column;border-top:1px solid var(--border)}
.vbx-plan dl div{display:flex;justify-content:space-between;gap:var(--space-4);padding:var(--space-2-5,10px) 0;border-bottom:1px solid var(--border);font-size:var(--text-sm)}
.vbx-plan dt{color:var(--muted-foreground)}
.vbx-plan dd{margin:0;text-align:right;font-weight:var(--font-medium);font-variant-numeric:tabular-nums}
.vbx-plan dl div[data-key="true"] dd{font-size:var(--text-base);font-weight:var(--font-semibold)}
.vbx-plan-note{margin:0;font-size:var(--text-sm);line-height:var(--leading-normal);color:var(--brand-ink);background:var(--brand-softer);border:1px solid var(--brand-line);border-radius:var(--radius-md);padding:var(--space-3)}
.vbx-plan-change{margin:0;font-size:var(--text-sm)}
.vbx-plan-change a{color:var(--brand);text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.vbx-plan-mini{display:none}
@media (max-width:820px){
  .vbx-auth-grid[data-plan="true"]{grid-template-columns:minmax(0,1fr);max-width:26rem;gap:var(--space-5)}
  .vbx-auth-grid[data-plan="true"] .vbx-plan{display:none}
  .vbx-plan-mini{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:var(--space-1) var(--space-3);border:1px solid var(--brand-line);background:var(--brand-softer);border-radius:var(--radius-md);padding:var(--space-3) var(--space-4);font-size:var(--text-sm);line-height:var(--leading-normal);color:var(--brand-ink)}
  .vbx-plan-mini b{font-weight:var(--font-semibold)}
  .vbx-plan-mini a{color:var(--brand);text-decoration:underline;cursor:pointer}
  .vbx-plan-mini p{margin:0;flex-basis:100%}
}
@media (max-width:520px){
  .vbx-auth-top{padding:0 var(--space-5)}
  .vbx-auth-steps span{display:none}
  .vbx-auth-main{align-items:flex-start;padding:var(--space-6) var(--space-5) var(--space-10)}
  .vbx-auth-card h1{font-size:var(--text-xl)}
  .vbx-auth-form .vbx-btn{min-height:44px}
}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-auth-css")) {
  const el = document.createElement("style");
  el.id = "vbx-auth-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

// Google's standard "G" mark, as required by its sign-in branding guidelines.
function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

const PLAN_COPY = {
  "unlimited-monthly": {
    name: "Ilimitado", cycle: "mensual",
    rows: [["Prueba", "3 días gratis"], ["Hoy pagas", "0,00 US$", true], ["Primer cobro", "26 sept. 2026"], ["Después", "29,99 US$/mes"]],
    note: "Hoy no se te cobra nada. El 26 de septiembre de 2026 se te cobrarán 29,99 US$/mes salvo que canceles antes, en dos clics desde tu cuenta.",
    mini: ["Ilimitado · mensual", "0,00 US$ hoy", "Primer cobro el 26 de septiembre de 2026: 29,99 US$/mes."],
  },
  "unlimited-yearly": {
    name: "Ilimitado", cycle: "anual",
    rows: [["Hoy pagas", "179,88 US$", true], ["Equivale a", "14,99 US$/mes"], ["Renovación", "23 sept. 2027"]],
    note: "El plan anual no lleva prueba gratuita: se cobra entero al confirmar el pago, en el paso siguiente.",
    mini: ["Ilimitado · anual", "179,88 US$ hoy", "Sin prueba gratuita. Renovación el 23 de septiembre de 2027."],
  },
  "pro-yearly": {
    name: "Pro", cycle: "anual",
    rows: [["Hoy pagas", "89,88 US$", true], ["Equivale a", "7,49 US$/mes"], ["Renovación", "23 sept. 2027"]],
    note: "Se cobra al confirmar el pago, en el paso siguiente. Nada se cobra al crear la cuenta.",
    mini: ["Pro · anual", "89,88 US$ hoy", "Se cobra en el paso siguiente. Renovación el 23 de septiembre de 2027."],
  },
  "pro-monthly": {
    name: "Pro", cycle: "mensual",
    rows: [["Hoy pagas", "14,99 US$", true], ["Renovación", "23 oct. 2026"], ["Después", "14,99 US$/mes"]],
    note: "Se cobra al confirmar el pago, en el paso siguiente. Nada se cobra al crear la cuenta.",
    mini: ["Pro · mensual", "14,99 US$ hoy", "Se cobra en el paso siguiente. Después, 14,99 US$ cada mes."],
  },
};

export function AuthPage({
  mode = "registro",
  keptText = true,
  plan = null,
  initialSent = false,
  initialEmail = "",
  onSwitch = () => {},
  onDone = () => {},
  onChangePlan = () => {},
}) {
  const [email, setEmail] = React.useState(initialEmail);
  const [sent, setSent] = React.useState(initialSent);
  const signup = mode === "registro";
  const p = plan ? PLAN_COPY[plan] : null;

  const title = p
    ? "Primero, tu cuenta. Después, el pago."
    : signup
      ? "Crea tu cuenta gratis: 500 palabras al día"
      : "Vuelve a tu cuenta";
  const lede = p
    ? "Sin contraseña. En tu cuenta vive la suscripción, y desde ella la cancelas cuando quieras."
    : signup
      ? "Sin contraseña y sin tarjeta. Entras con Google o con un enlace a tu correo."
      : "Entra con Google o pídenos un enlace de acceso. Nunca hubo contraseña que recordar.";

  return (
    <div className="vbx-auth">
      <div className="vbx-auth-top">
        <span style={{ fontWeight: "var(--font-bold)", fontSize: "var(--text-base)", letterSpacing: "-0.02em" }}>
          Verbaly<span style={{ color: "var(--brand)" }}>x</span>
        </span>
        {p && (
          <div className="vbx-auth-steps" aria-label="Paso 1 de 2">
            <div data-on="true" style={{ display: "flex", alignItems: "center", gap: 6 }}><b>1</b><span>Cuenta</span></div>
            <i />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><b>2</b><span>Pago</span></div>
          </div>
        )}
      </div>

      <div className="vbx-auth-main">
        <div className="vbx-auth-grid" data-plan={!!p}>
          <div className="vbx-auth-card">
            <div>
              <h1>{title}</h1>
              <p className="lede">{lede}</p>
            </div>

            {p && (
              <div className="vbx-plan-mini">
                <b>{p.mini[0]}</b><span>{p.mini[1]}</span>
                <p>{p.mini[2]} <a onClick={onChangePlan}>Cambiar</a></p>
              </div>
            )}

            {signup && !p && (
              <ul className="vbx-auth-gain">
                <li><span>·</span><span>De 300 a <b style={{ fontWeight: 600 }}>500 palabras al día</b>, desde hoy.</span></li>
                <li><span>·</span><span>Humanizador y detector, sin coste.</span></li>
              </ul>
            )}

            <button type="button" className="vbx-gbtn" onClick={onDone}><GoogleG />Continuar con Google</button>

            <div className="vbx-auth-or">o con tu correo</div>

            {sent ? (
              <div className="vbx-auth-sent" role="status">
                <p>
                  Te hemos enviado un enlace a <b>{email || "tu@correo.com"}</b>. Ábrelo desde este mismo dispositivo y
                  vuelves justo donde estabas{p ? ", con tu plan elegido" : ""}.
                </p>
                <p>¿No llega en un minuto? Mira en spam o <a onClick={() => setSent(false)}>usa otra dirección</a>.</p>
              </div>
            ) : (
              <form className="vbx-auth-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" aria-label="Correo electrónico" autoComplete="email" />
                <Button type="submit" variant="outline" disabled={!email}>Enviarme un enlace de acceso</Button>
              </form>
            )}

            {keptText && !p && (
              <p className="vbx-auth-p">Tu texto sigue en el editor. Al volver lo encuentras tal cual.</p>
            )}

            {signup && !p && (
              <p className="vbx-auth-p">En el plan gratuito no guardamos tus textos: solo el recuento de palabras para aplicar los límites.</p>
            )}

            <p className="vbx-auth-p">
              {signup ? "¿Ya tienes cuenta? " : "¿Aún no tienes cuenta? "}
              <a onClick={onSwitch}>{signup ? "Iniciar sesión" : "Crear cuenta gratis"}</a>
            </p>

            {signup && (
              <p className="vbx-auth-p vbx-auth-legal">
                Al crear la cuenta aceptas los <a href="#">términos del servicio</a> y la{" "}
                <a href="#">política de privacidad</a>.
              </p>
            )}
          </div>

          {p && (
            <aside className="vbx-plan" aria-label="Plan elegido">
              <div>
                <p className="vbx-plan-k">Tu elección</p>
                <p className="vbx-plan-name">{p.name} <span>· {p.cycle}</span></p>
              </div>
              <dl>
                {p.rows.map(([k, v, key]) => (
                  <div key={k} data-key={!!key}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
              <p className="vbx-plan-note">{p.note}</p>
              <p className="vbx-plan-change"><a onClick={onChangePlan}>Cambiar de plan</a></p>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
