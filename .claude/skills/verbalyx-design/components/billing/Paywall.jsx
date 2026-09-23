import React from "react";
import { Button } from "../core/Button.jsx";
import { Badge } from "../core/Badge.jsx";

const __css = `
.vbx-pw-scrim{position:absolute;inset:0;z-index:50;background:color-mix(in oklab,var(--foreground) 45%,transparent);display:flex;align-items:center;justify-content:center;padding:var(--space-6)}
.vbx-pw-scrim[data-fixed="true"]{position:fixed}
.vbx-pw-scrim[data-soft="true"]{background:color-mix(in oklab,var(--background) 62%,transparent);backdrop-filter:blur(2px)}
.vbx-pw{position:relative;width:100%;max-width:33rem;max-height:100%;overflow-y:auto;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-xl);box-shadow:0 10px 38px rgba(0,0,0,.18);display:flex;flex-direction:column}
.vbx-pw--narrow{max-width:27rem}
.vbx-pw-close{position:absolute;top:var(--space-3);right:var(--space-3);width:28px;height:28px;border:0;border-radius:var(--radius-sm);background:transparent;color:var(--muted-foreground);font-size:17px;line-height:1;cursor:pointer;transition:var(--transition-colors)}
.vbx-pw-close:hover{background:var(--accent);color:var(--foreground)}
.vbx-pw-close:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in oklab,var(--brand) 30%,transparent)}
.vbx-pw-head{padding:var(--space-6) var(--space-6) var(--space-4)}
.vbx-pw-title{margin:var(--space-3) 0 0;font-size:var(--text-xl);font-weight:var(--font-semibold);letter-spacing:-0.01em;line-height:1.25;padding-right:var(--space-8)}
.vbx-pw-sub{margin:var(--space-2) 0 0;font-size:var(--text-sm);color:var(--muted-foreground);line-height:var(--leading-normal)}
.vbx-pw-result{position:relative;margin:0 var(--space-6);border:1px solid var(--border);border-radius:var(--radius-md);background:color-mix(in oklab,var(--muted) 45%,transparent);overflow:hidden}
.vbx-pw-result-label{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-bottom:1px solid var(--border);font-size:var(--text-xs);font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--muted-foreground)}
.vbx-pw-result-body{position:relative;padding:var(--space-3);font-size:var(--text-sm);line-height:var(--leading-relaxed);max-height:9.5rem;overflow:hidden}
.vbx-pw-locked{filter:blur(4.5px);opacity:.62;user-select:none}
.vbx-pw-fade{position:absolute;left:0;right:0;bottom:0;height:5rem;background:linear-gradient(to bottom,transparent,var(--card) 88%);pointer-events:none}
.vbx-pw-body{padding:var(--space-5) var(--space-6) var(--space-6);display:flex;flex-direction:column;gap:var(--space-4)}
.vbx-pw-gain{display:flex;flex-direction:column;gap:var(--space-2);margin:0;padding:0;list-style:none}
.vbx-pw-gain li{display:flex;gap:var(--space-2);font-size:var(--text-sm);line-height:var(--leading-normal)}
.vbx-pw-gain b{font-weight:var(--font-medium)}
.vbx-pw-tick{color:var(--success);font-weight:700;flex:none}
.vbx-pw-actions{display:flex;flex-direction:column;gap:var(--space-2)}
.vbx-pw-actions--equal{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.vbx-pw-legal{margin:0;font-size:var(--text-sm);line-height:var(--leading-normal);color:var(--foreground);background:var(--brand-softer);border:1px solid var(--brand-line);border-radius:var(--radius-md);padding:var(--space-3)}
.vbx-pw-trust{margin:0;font-size:var(--text-sm);color:var(--muted-foreground);display:flex;flex-wrap:wrap;gap:var(--space-1) var(--space-2)}
.vbx-pw-trust span::after{content:" ·";color:var(--border)}
.vbx-pw-trust span:last-child::after{content:""}
.vbx-pw-lock{display:inline-flex;align-items:center;gap:var(--space-2);font-size:var(--text-xs);font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--brand)}

/* A — estado del editor, sin scrim */
.vbx-pw-overflow{display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap;padding:var(--space-3) var(--space-4);border-top:1px solid var(--warning-line);background:var(--warning-soft)}
.vbx-pw-count{font-family:var(--font-mono);font-size:var(--text-sm);font-weight:var(--font-medium);color:var(--danger-ink);flex:none}
.vbx-pw-overflow p{margin:0;font-size:var(--text-sm);color:var(--warning-ink);line-height:var(--leading-normal);flex:1 1 16rem}
.vbx-pw-overflow b{font-weight:var(--font-semibold)}

/* D — popover anclado */
.vbx-pw-pop{position:absolute;z-index:60;width:19rem;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-xl);box-shadow:0 8px 26px rgba(0,0,0,.16);padding:var(--space-4);display:flex;flex-direction:column;gap:var(--space-3)}
.vbx-pw-pop-arrow{position:absolute;top:-6px;left:24px;width:10px;height:10px;background:var(--card);border-left:1px solid var(--border);border-top:1px solid var(--border);transform:rotate(45deg)}
.vbx-pw-pop h3{margin:0;font-size:var(--text-base);font-weight:var(--font-semibold);line-height:1.3}
.vbx-pw-pop p{margin:0;font-size:var(--text-sm);color:var(--muted-foreground);line-height:var(--leading-normal)}
.vbx-pw-pop-actions{display:flex;align-items:center;gap:var(--space-2)}

/* E — pantalla completa */
.vbx-pw-full{position:absolute;inset:0;z-index:70;background:var(--background);display:flex;align-items:center;justify-content:center;padding:var(--space-6);overflow-y:auto}
.vbx-pw-full[data-fixed="true"]{position:fixed}
.vbx-pw-full-inner{width:100%;max-width:40rem;display:flex;flex-direction:column;gap:var(--space-5)}
.vbx-pw-full h2{margin:0;font-size:var(--text-3xl);font-weight:var(--font-bold);letter-spacing:var(--tracking-tight);line-height:1.1}
.vbx-pw-plans{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.vbx-pw-plan{border:1px solid var(--border);border-radius:var(--radius-xl);padding:var(--space-4);display:flex;flex-direction:column;gap:var(--space-2)}
.vbx-pw-plan h3{margin:0;font-size:var(--text-base);font-weight:var(--font-semibold)}
.vbx-pw-plan .price{font-size:var(--text-2xl);font-weight:var(--font-bold);letter-spacing:-0.02em}
.vbx-pw-plan p{margin:0;font-size:var(--text-sm);color:var(--muted-foreground);line-height:var(--leading-normal);flex:1}

@media (max-width:520px){
  .vbx-pw-scrim{padding:0;align-items:flex-end}
  .vbx-pw{max-width:none;border-radius:var(--radius-xl) var(--radius-xl) 0 0;border-bottom:0;max-height:94%;overflow-y:auto}
  .vbx-pw-head{padding:var(--space-5) var(--space-5) var(--space-3)}
  .vbx-pw-result{margin:0 var(--space-5)}
  .vbx-pw-body{padding:var(--space-4) var(--space-5) var(--space-6)}
  .vbx-pw-title{font-size:var(--text-lg)}
  .vbx-pw-actions .vbx-btn{min-height:44px}
  .vbx-pw-actions--equal{grid-template-columns:1fr}
  .vbx-pw-actions--equal .vbx-btn{min-height:44px}
  .vbx-pw-pop{width:auto;left:var(--space-4);right:var(--space-4)}
  .vbx-pw-full{padding:var(--space-5) var(--space-4)}
  .vbx-pw-full h2{font-size:var(--text-2xl)}
  .vbx-pw-plans{grid-template-columns:1fr}
  .vbx-pw-full .vbx-btn{min-height:44px}
}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-paywall-css")) {
  const el = document.createElement("style");
  el.id = "vbx-paywall-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

const UNLIMITED = "29,99 US$";
const PRO = "14,99 US$";

function Legal({ chargeDate }) {
  return (
    <p className="vbx-pw-legal">
      Hoy no se te cobra nada. El {chargeDate}, al terminar los 3 días de prueba, se te cobrarán {UNLIMITED}/mes
      salvo que canceles antes. Puedes cancelar o cambiar a Pro ({PRO}/mes) en dos clics desde tu cuenta.
    </p>
  );
}

function Trust() {
  return (
    <p className="vbx-pw-trust">
      <span>Cancela online en dos clics</span>
      <span>En los planes gratuitos no guardamos tu texto, solo el recuento</span>
    </p>
  );
}

export function Paywall({
  trigger = "quota",
  account = "anonymous",
  usedToday = 300,
  limitToday = 300,
  attempted = 812,
  perRequest = 300,
  toolName = "Parafraseador",
  featureName = "historial",
  partialResult = "",
  chargeDate = "21 de septiembre de 2026",
  popoverStyle,
  fixed = false,
  onDismiss = () => {},
  onPrimary = () => {},
  onSecondary = () => {},
}) {
  const anon = account === "anonymous";

  /* A — exceso por petición. Estado del editor: ni scrim ni modal. */
  if (trigger === "overflow") {
    return (
      <div className="vbx-pw-overflow" role="status">
        <span className="vbx-pw-count">{perRequest} / {perRequest}</span>
        <p>
          <b>Procesamos las primeras {perRequest} palabras</b> de las {attempted.toLocaleString("es-ES")} que has pegado.
          Pro amplía el límite a 3.000 por petición; Ilimitado, a 8.000.
        </p>
        <Button variant="soft" size="sm" onClick={onPrimary}>Ver planes</Button>
      </div>
    );
  }

  /* D — función de pago. Popover anclado al candado. */
  if (trigger === "feature") {
    return (
      <div className="vbx-pw-pop" style={popoverStyle} role="dialog" aria-label={`Desbloquear ${featureName}`}>
        <div className="vbx-pw-pop-arrow" />
        <h3>El {featureName} es de los planes de pago</h3>
        <p>
          Pro guarda tus textos cifrados y te deja volver a cualquier resultado. En los planes gratuitos no se
          almacena el texto, solo el recuento.
        </p>
        <div className="vbx-pw-pop-actions">
          <Button size="sm" onClick={onPrimary}>Desbloquear con Pro</Button>
          <Button variant="ghost" size="sm" onClick={onDismiss}>Cerrar</Button>
        </div>
      </div>
    );
  }

  /* E — fin del trial. Pantalla completa, no descartable, dos CTA iguales. */
  if (trigger === "trialEnd") {
    return (
      <div className="vbx-pw-full" data-fixed={fixed} role="dialog" aria-modal="true" aria-labelledby="vbx-pw-full-title">
        <div className="vbx-pw-full-inner">
          <div>
            <Badge variant="warning">Tu prueba termina hoy</Badge>
            <h2 id="vbx-pw-full-title" style={{ marginTop: "var(--space-4)" }}>
              Elige cómo sigues. Hoy todavía no se te ha cobrado nada.
            </h2>
            <p className="vbx-pw-sub" style={{ fontSize: "var(--text-base)" }}>
              Has usado Ilimitado durante 3 días. Puedes continuar, bajar a Pro o cancelar: las tres opciones están
              aquí y ninguna requiere escribirnos.
            </p>
          </div>

          <div className="vbx-pw-plans">
            <div className="vbx-pw-plan">
              <h3>Ilimitado</h3>
              <span className="price">{UNLIMITED}<span style={{ fontSize: "var(--text-sm)", fontWeight: 400, color: "var(--muted-foreground)" }}>/mes</span></span>
              <p>500.000 palabras al mes, 8.000 por petición y prioridad de cola.</p>
              <Button size="lg" onClick={onPrimary}>Continuar en Ilimitado</Button>
            </div>
            <div className="vbx-pw-plan">
              <h3>Pro</h3>
              <span className="price">{PRO}<span style={{ fontSize: "var(--text-sm)", fontWeight: 400, color: "var(--muted-foreground)" }}>/mes</span></span>
              <p>60.000 palabras al mes, 3.000 por petición. Todas las herramientas e historial.</p>
              <Button variant="ink" size="lg" onClick={onSecondary}>Cambiar a Pro</Button>
            </div>
          </div>

          <p className="vbx-pw-legal">
            Si no eliges nada, hoy se te cobrarán {UNLIMITED} y la suscripción de Ilimitado seguirá activa mes a mes.
            Cambiar a Pro aplica el prorrateo automáticamente. Cancelar lleva dos clics desde tu cuenta y puedes
            hacerlo ahora mismo.
          </p>

          <div>
            <Button variant="ghost" onClick={onDismiss}>Cancelar mi suscripción</Button>
          </div>
        </div>
      </div>
    );
  }

  /* C — herramienta de pago. Velo suave sobre el editor, candado. */
  if (trigger === "tool") {
    return (
      <div className="vbx-pw-scrim" data-fixed={fixed} data-soft="true" role="dialog" aria-modal="true" aria-labelledby="vbx-pw-title">
        <div className="vbx-pw vbx-pw--narrow">
          <button className="vbx-pw-close" onClick={onDismiss} aria-label="Cerrar">×</button>
          <div className="vbx-pw-head">
            <Badge variant="brand">Plan de pago</Badge>
            <h2 className="vbx-pw-title" id="vbx-pw-title">El {toolName.toLowerCase()} está en los planes de pago</h2>
            <p className="vbx-pw-sub">
              El humanizador y el detector siguen siendo gratis, con o sin cuenta. El resto de herramientas entran
              con Pro o Ilimitado.
            </p>
          </div>
          <div className="vbx-pw-body">
            <ul className="vbx-pw-gain">
              <li><span className="vbx-pw-tick">·</span><span><b>Las cuatro herramientas</b>, sin cambiar de plan.</span></li>
              <li><span className="vbx-pw-tick">·</span><span><b>Historial cifrado</b> y desglose por pasajes del detector.</span></li>
            </ul>
            <div className="vbx-pw-actions">
              <Button size="lg" onClick={onPrimary}>Probar Ilimitado 3 días gratis</Button>
              <Button variant="outline" onClick={onSecondary}>Ver planes</Button>
            </div>
            <Legal chargeDate={chargeDate} />
            <Trust />
          </div>
        </div>
      </div>
    );
  }

  /* B — cuota diaria agotada. */
  return (
    <div className="vbx-pw-scrim" data-fixed={fixed} role="dialog" aria-modal="true" aria-labelledby="vbx-pw-title">
      <div className="vbx-pw">
        <button className="vbx-pw-close" onClick={onDismiss} aria-label="Cerrar">×</button>

        <div className="vbx-pw-head">
          <Badge variant="warning">{usedToday} / {limitToday} palabras de hoy</Badge>
          <h2 className="vbx-pw-title" id="vbx-pw-title">
            Tu texto está humanizado. Has agotado las palabras de hoy.
          </h2>
          <p className="vbx-pw-sub">
            {anon
              ? "Te enseñamos el principio. Crea una cuenta gratis y pasas a 500 palabras al día, o prueba Ilimitado y lo lees entero ahora."
              : "Te enseñamos el principio. Con Ilimitado lo lees entero ahora y dejas de tener límite diario."}
          </p>
        </div>

        <div className="vbx-pw-result">
          <div className="vbx-pw-result-label">Resultado</div>
          <div className="vbx-pw-result-body">
            <span>{partialResult.slice(0, 210)}</span>
            <span className="vbx-pw-locked"> {partialResult.slice(210)}</span>
            <div className="vbx-pw-fade" />
          </div>
        </div>

        <div className="vbx-pw-body">
          <ul className="vbx-pw-gain">
            <li><span className="vbx-pw-tick">·</span><span><b>Sin límite diario</b> y hasta 8.000 palabras por petición.</span></li>
            <li><span className="vbx-pw-tick">·</span><span><b>Las cuatro herramientas</b>, historial cifrado y desglose por pasajes.</span></li>
          </ul>

          <div className="vbx-pw-actions">
            <Button size="lg" onClick={onPrimary}>Probar Ilimitado 3 días gratis</Button>
            <Button variant="outline" onClick={onSecondary}>
              {anon ? "Crear cuenta gratis — 500 palabras al día" : `Ver Pro — ${PRO}/mes`}
            </Button>
          </div>

          <Legal chargeDate={chargeDate} />
          <Trust />
        </div>
      </div>
    </div>
  );
}
