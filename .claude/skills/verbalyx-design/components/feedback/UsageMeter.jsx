import React from "react";
import { Button } from "../core/Button.jsx";

// D1 · The balance block of the /app header. Five states: free with words,
// free spent, Pro (monthly), Ilimitado, Ilimitado on trial. It must never
// compete with the tool's own run button: sm controls only, no filled brand.

const __css = `
.vbx-um{position:relative;display:inline-flex;align-items:center;gap:var(--space-3);min-width:0}
.vbx-um-trigger{display:flex;flex-direction:column;gap:5px;min-width:0;padding:4px 6px;margin:-4px -6px;border:0;border-radius:var(--radius-sm);background:transparent;font:inherit;color:inherit;text-align:left;cursor:default}
.vbx-um-trigger:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in oklab,var(--brand) 30%,transparent)}
.vbx-um-label{display:flex;align-items:baseline;gap:6px;font-size:var(--text-sm);line-height:1.2;white-space:nowrap}
.vbx-um-label b{font-weight:var(--font-medium);font-variant-numeric:tabular-nums}
.vbx-um-label span{color:var(--muted-foreground)}
.vbx-um-label .vbx-um-reset{color:var(--danger-ink)}
.vbx-um-track{height:4px;width:100%;min-width:9rem;border-radius:var(--radius-full);background:var(--border);overflow:hidden}
.vbx-um-fill{display:block;height:100%;border-radius:inherit;background:var(--brand);transition:width var(--duration-fast) var(--easing-default)}
.vbx-um-fill[data-tone="warn"]{background:var(--warning-fill)}
.vbx-um-fill[data-tone="full"]{background:var(--danger)}
.vbx-um-flat{font-size:var(--text-sm);font-weight:var(--font-medium);white-space:nowrap}
.vbx-um-flat span{font-weight:var(--font-normal);color:var(--muted-foreground)}
.vbx-um-tip{position:absolute;top:calc(100% + 10px);left:-6px;z-index:30;width:18rem;padding:var(--space-3) var(--space-4);border:1px solid var(--border);border-radius:var(--radius-md);background:var(--popover);color:var(--popover-foreground);box-shadow:var(--shadow-md);font-size:var(--text-sm);line-height:var(--leading-normal);display:flex;flex-direction:column;gap:var(--space-2)}
.vbx-um-tip::before{content:"";position:absolute;top:-6px;left:18px;width:10px;height:10px;background:var(--popover);border-left:1px solid var(--border);border-top:1px solid var(--border);transform:rotate(45deg)}
.vbx-um-tip p{margin:0}
.vbx-um-tip .t{font-weight:var(--font-semibold)}
.vbx-um-tip .m{color:var(--muted-foreground)}
.vbx-um-tip a{color:var(--brand);text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.vbx-um[data-compact="true"]{gap:var(--space-2)}
.vbx-um[data-compact="true"] .vbx-um-track{min-width:3.5rem}
.vbx-um[data-compact="true"] .vbx-um-tip{position:fixed;top:auto;left:12px;right:12px;width:auto;margin-top:10px}
.vbx-um[data-compact="true"] .vbx-um-tip::before{display:none}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-um-css")) {
  const el = document.createElement("style");
  el.id = "vbx-um-css";
  el.textContent = __css;
  document.head.appendChild(el);
}

const n = (v) => Number(v).toLocaleString("es-ES");

export function UsageMeter({
  plan = "free",
  used = 0,
  limit = 500,
  resetsIn = "5 h",
  renewsOn = "14 de octubre",
  trialEndsOn = "26 de septiembre",
  trialAmount = "29,99 US$",
  proMonthly = 60000,
  proRequest = 3000,
  unlimitedMonthly = 500000,
  unlimitedRequest = 8000,
  topup = 0,
  compact = false,
  defaultOpen = false,
  onUpgrade = () => {},
  onManage = () => {},
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const id = React.useId ? React.useId() : "vbx-um-tip";
  const metered = plan === "free" || plan === "pro";
  const spent = metered && used >= limit;
  const pct = metered && limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const tone = pct >= 100 ? "full" : pct >= 80 ? "warn" : "brand";

  const label = (() => {
    if (plan === "free")
      return compact ? (
        <><b>{n(used)}/{n(limit)}</b><span>hoy</span></>
      ) : (
        <><span>Hoy:</span><b>{n(used)} / {n(limit)}</b><span>palabras</span>{spent && <span className="vbx-um-reset">· se recargan en {resetsIn}</span>}</>
      );
    if (plan === "pro")
      return compact ? (
        <><b>{n(used)}/{n(limit)}</b><span>mes</span></>
      ) : (
        <><span>Este mes:</span><b>{n(used)} / {n(limit)}</b><span>palabras</span></>
      );
    return null;
  })();

  const tip = (() => {
    if (plan === "free")
      return (
        <>
          <p className="t">Plan Gratis · {n(limit)} palabras al día</p>
          <p>{spent ? <>Has usado las {n(limit)} de hoy. </> : <>Te quedan {n(limit - used)}. </>}Se recargan en {resetsIn}.</p>
          <p className="m">Pro quita el límite diario: {n(proMonthly)} palabras al mes y hasta {n(proRequest)} por petición.</p>
          <p><a onClick={onUpgrade}>Ver planes</a></p>
        </>
      );
    if (plan === "pro")
      return (
        <>
          <p className="t">Plan Pro · {n(limit)} palabras al mes</p>
          <p>Te quedan {n(Math.max(0, limit - used))}. Se renuevan el {renewsOn}, con tu próximo cobro.</p>
          {topup > 0 && <p>Recarga disponible: {n(topup)} palabras. No caducan.</p>}
          <p className="m">Ilimitado sube a {n(unlimitedMonthly)} al mes y {n(unlimitedRequest)} por petición.</p>
          <p><a onClick={onUpgrade}>Pasar a Ilimitado</a></p>
        </>
      );
    if (plan === "trial")
      return (
        <>
          <p className="t">Prueba de Ilimitado</p>
          <p>El {trialEndsOn} se te cobrarán {trialAmount}/mes salvo que canceles antes.</p>
          <p className="m">Cancelar o bajar a Pro: Mi cuenta → Suscripción. Dos clics.</p>
          <p><a onClick={onManage}>Gestionar suscripción</a></p>
        </>
      );
    return (
      <>
        <p className="t">Plan Ilimitado</p>
        <p>Sin límite diario. Hasta {n(unlimitedRequest)} palabras por petición.</p>
      </>
    );
  })();

  const show = () => setOpen(true);
  const hide = () => setOpen(defaultOpen);

  return (
    <div className="vbx-um" data-compact={compact} onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        className="vbx-um-trigger"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onFocus={show}
        onBlur={hide}
      >
        {metered ? (
          <>
            <span className="vbx-um-label">{label}</span>
            <span className="vbx-um-track" role="progressbar" aria-valuemin={0} aria-valuemax={limit} aria-valuenow={Math.min(used, limit)} aria-label={`${n(used)} de ${n(limit)} palabras`}>
              <span className="vbx-um-fill" data-tone={tone} style={{ width: pct + "%" }} />
            </span>
          </>
        ) : plan === "trial" ? (
          <span className="vbx-um-flat">Ilimitado <span>· {compact ? "prueba" : `prueba hasta el ${trialEndsOn}`}</span></span>
        ) : (
          <span className="vbx-um-flat">Ilimitado</span>
        )}
      </button>

      {plan === "free" && (
        <Button size="sm" variant={spent ? "soft" : "outline"} onClick={onUpgrade}>Mejorar</Button>
      )}
      {plan === "pro" && !compact && (
        <Button size="sm" variant="link" onClick={onUpgrade}>Pasar a Ilimitado</Button>
      )}

      {open && (
        <div className="vbx-um-tip" role="tooltip" id={id}>{tip}</div>
      )}
    </div>
  );
}
