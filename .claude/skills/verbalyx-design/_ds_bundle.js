/* @ds-bundle: {"format":4,"namespace":"VerbalyxDesignSystem_caebf9","components":[{"name":"CheckoutModal","sourcePath":"components/billing/CheckoutModal.jsx"},{"name":"CYCLES","sourcePath":"components/billing/OrderSummary.jsx"},{"name":"OrderSummary","sourcePath":"components/billing/OrderSummary.jsx"},{"name":"PaymentForm","sourcePath":"components/billing/PaymentForm.jsx"},{"name":"Paywall","sourcePath":"components/billing/Paywall.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"QuotaBar","sourcePath":"components/feedback/QuotaBar.jsx"},{"name":"SignupInvite","sourcePath":"components/feedback/SignupInvite.jsx"},{"name":"UpsellBanner","sourcePath":"components/feedback/UpsellBanner.jsx"},{"name":"UsageMeter","sourcePath":"components/feedback/UsageMeter.jsx"},{"name":"Chip","sourcePath":"components/forms/Chip.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"ToolTabs","sourcePath":"components/navigation/ToolTabs.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardHeader","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardTitle","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardDescription","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardAction","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardContent","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardFooter","sourcePath":"components/surfaces/Card.jsx"},{"name":"EvidenceBand","sourcePath":"components/tools/EvidenceBand.jsx"},{"name":"Highlight","sourcePath":"components/tools/Highlight.jsx"},{"name":"HighlightLegend","sourcePath":"components/tools/Highlight.jsx"},{"name":"LimitNotice","sourcePath":"components/tools/LimitNotice.jsx"},{"name":"RunCost","sourcePath":"components/tools/RunCost.jsx"},{"name":"ToolEditor","sourcePath":"components/tools/ToolEditor.jsx"},{"name":"AdminBackoffice","sourcePath":"ui_kits/admin/AdminBackoffice.jsx"},{"name":"AppAccount","sourcePath":"ui_kits/app/AppAccount.jsx"},{"name":"AppLogin","sourcePath":"ui_kits/app/AppLogin.jsx"},{"name":"AppShell","sourcePath":"ui_kits/app/AppShell.jsx"},{"name":"AppToolPage","sourcePath":"ui_kits/app/AppToolPage.jsx"},{"name":"AuthPage","sourcePath":"ui_kits/auth/AuthPage.jsx"},{"name":"CheckoutSummary","sourcePath":"ui_kits/checkout/CheckoutSummary.jsx"},{"name":"PurchaseConfirmation","sourcePath":"ui_kits/checkout/PurchaseConfirmation.jsx"},{"name":"DetectorLanding","sourcePath":"ui_kits/marketing/DetectorLanding.jsx"},{"name":"HumanizerLanding","sourcePath":"ui_kits/marketing/HumanizerLanding.jsx"},{"name":"MarketingFooter","sourcePath":"ui_kits/marketing/MarketingFooter.jsx"},{"name":"MarketingHome","sourcePath":"ui_kits/marketing/MarketingHome.jsx"},{"name":"PricingPage","sourcePath":"ui_kits/marketing/PricingPage.jsx"},{"name":"SiteHeader","sourcePath":"ui_kits/marketing/SiteHeader.jsx"},{"name":"TOOLS","sourcePath":"ui_kits/tools.js"}],"sourceHashes":{"components/billing/CheckoutModal.jsx":"b8af2eb29b3a","components/billing/OrderSummary.jsx":"c406b4dc99fd","components/billing/PaymentForm.jsx":"02a24cc8ccf8","components/billing/Paywall.jsx":"4881718e7db4","components/core/Badge.jsx":"05661ea3873b","components/core/Button.jsx":"30ba8d62fba7","components/feedback/QuotaBar.jsx":"5a226b997822","components/feedback/SignupInvite.jsx":"f5fc076cb3cb","components/feedback/UpsellBanner.jsx":"62afc2892e81","components/feedback/UsageMeter.jsx":"773dd2a76472","components/forms/Chip.jsx":"e3f7aabe04b7","components/forms/Input.jsx":"a0a1927f2c37","components/forms/Textarea.jsx":"6f4fc94c5378","components/navigation/ToolTabs.jsx":"f42845633bb6","components/surfaces/Card.jsx":"401f9c23b99e","components/tools/EvidenceBand.jsx":"ef0a848541a8","components/tools/Highlight.jsx":"2a0e7f1ef397","components/tools/LimitNotice.jsx":"7212419db776","components/tools/RunCost.jsx":"c8fca44e584b","components/tools/ToolEditor.jsx":"176cb7975cf2","ui_kits/admin/AdminBackoffice.jsx":"9c6b7de471c6","ui_kits/app/AppAccount.jsx":"e8bdd7d67c3b","ui_kits/app/AppLogin.jsx":"650d461f5e38","ui_kits/app/AppShell.jsx":"06b7a338e95b","ui_kits/app/AppToolPage.jsx":"40aee9f7fa94","ui_kits/auth/AuthPage.jsx":"53ac209601c9","ui_kits/checkout/CheckoutSummary.jsx":"ee44c65459e3","ui_kits/checkout/PurchaseConfirmation.jsx":"33fe1ca4ae00","ui_kits/marketing/DetectorLanding.jsx":"a0f92b00fcd0","ui_kits/marketing/HumanizerLanding.jsx":"4b221a79f398","ui_kits/marketing/MarketingFooter.jsx":"cde14e30342d","ui_kits/marketing/MarketingHome.jsx":"8af55a6e379f","ui_kits/marketing/PricingPage.jsx":"e42ee8071294","ui_kits/marketing/SiteHeader.jsx":"33c31e9deea5","ui_kits/tools.js":"127ebd8126b6"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.VerbalyxDesignSystem_caebf9 = window.VerbalyxDesignSystem_caebf9 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const __css = `
.vbx-badge{display:inline-flex;align-items:center;justify-content:center;gap:var(--space-1);width:fit-content;border:1px solid transparent;border-radius:var(--radius-md);padding:var(--space-0-5) var(--space-2);font-family:var(--font-sans);font-size:var(--text-xs);font-weight:var(--font-medium);line-height:1.4;white-space:nowrap;overflow:hidden;flex-shrink:0;transition:var(--transition-colors)}
.vbx-badge svg{width:0.75rem;height:0.75rem;pointer-events:none}
.vbx-badge-default{background:var(--primary);color:var(--primary-foreground)}
.vbx-badge-secondary{background:var(--secondary);color:var(--secondary-foreground)}
.vbx-badge-destructive{background:var(--danger);color:#fff}
.vbx-badge-outline{border-color:var(--border);color:var(--foreground);background:transparent}
.vbx-badge-brand{background:var(--brand-soft);border-color:var(--brand-line);color:var(--brand-ink)}
.vbx-badge-success{background:var(--success-soft);border-color:var(--success-line);color:var(--success-ink)}
.vbx-badge-warning{background:var(--warning-soft);border-color:var(--warning-line);color:var(--warning-ink)}
.vbx-badge-danger{background:var(--danger-soft);border-color:var(--danger-line);color:var(--danger-ink)}
.vbx-badge-pill{border-radius:var(--radius-full);padding:var(--space-1) var(--space-3)}
.vbx-badge-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-badge-css")) {
  const el = document.createElement("style");
  el.id = "vbx-badge-css";
  el.textContent = __css;
  document.head.appendChild(el);
}
const BADGE_VARIANTS = {
  default: "vbx-badge-default",
  secondary: "vbx-badge-secondary",
  destructive: "vbx-badge-destructive",
  outline: "vbx-badge-outline",
  brand: "vbx-badge-brand",
  success: "vbx-badge-success",
  warning: "vbx-badge-warning",
  danger: "vbx-badge-danger"
};
function Badge({
  variant = "default",
  pill = false,
  dot = false,
  className = "",
  children,
  ...props
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    "data-slot": "badge",
    className: ["vbx-badge", BADGE_VARIANTS[variant] || BADGE_VARIANTS.default, pill ? "vbx-badge-pill" : "", className].filter(Boolean).join(" ")
  }, props), dot && /*#__PURE__*/React.createElement("span", {
    className: "vbx-badge-dot"
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/billing/OrderSummary.jsx
try { (() => {
const __css = `
.vbx-os{display:flex;flex-direction:column;gap:var(--space-4)}
.vbx-os-head{display:flex;align-items:flex-start;gap:var(--space-3)}
.vbx-os-head h2{margin:0;font-size:var(--text-lg);font-weight:var(--font-semibold)}
.vbx-os-head p{margin:var(--space-1) 0 0;font-size:var(--text-sm);color:var(--muted-foreground)}
.vbx-os-label{font-size:var(--text-xs);font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--muted-foreground)}
.vbx-os-cycle{display:flex;flex-direction:column;gap:var(--space-2)}
.vbx-os-opt{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border);border-radius:var(--radius-md);cursor:pointer;transition:var(--transition-colors);background:var(--card)}
.vbx-os-opt:hover{background:var(--accent)}
.vbx-os-opt[data-on="true"]{border-color:var(--brand);background:var(--brand-softer);box-shadow:0 0 0 1px var(--brand)}
.vbx-os-radio{width:16px;height:16px;border-radius:50%;border:1.5px solid var(--border);flex:none;margin-top:2px;display:grid;place-items:center}
.vbx-os-opt[data-on="true"] .vbx-os-radio{border-color:var(--brand)}
.vbx-os-opt[data-on="true"] .vbx-os-radio::after{content:"";width:8px;height:8px;border-radius:50%;background:var(--brand)}
.vbx-os-opt b{display:block;font-size:var(--text-sm);font-weight:var(--font-medium)}
.vbx-os-opt em{display:block;font-style:normal;font-size:var(--text-sm);color:var(--muted-foreground);margin-top:2px;line-height:var(--leading-normal)}
.vbx-os-incl{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:var(--space-2)}
.vbx-os-incl li{display:flex;gap:var(--space-2);font-size:var(--text-sm);line-height:var(--leading-normal)}
.vbx-os-incl i{font-style:normal;color:var(--brand);font-weight:700;flex:none}
.vbx-os-lines{display:flex;flex-direction:column;gap:var(--space-2);border-top:1px solid var(--border);padding-top:var(--space-4)}
.vbx-os-line{display:flex;justify-content:space-between;gap:var(--space-4);font-size:var(--text-sm);color:var(--muted-foreground)}
.vbx-os-line span:last-child{font-variant-numeric:tabular-nums}
.vbx-os-total{display:flex;justify-content:space-between;gap:var(--space-4);font-size:var(--text-lg);font-weight:var(--font-semibold);padding-top:var(--space-2);border-top:1px solid var(--border);color:var(--foreground)}
.vbx-os-total span:last-child{font-variant-numeric:tabular-nums}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-order-css")) {
  const el = document.createElement("style");
  el.id = "vbx-order-css";
  el.textContent = __css;
  document.head.appendChild(el);
}
const CYCLES = {
  unlimited: {
    name: "Ilimitado",
    includes: ["500.000 palabras al mes, 8.000 por petición", "Las cuatro herramientas e historial cifrado", "Prioridad de cola"],
    options: [{
      id: "monthly",
      title: "Mensual con 3 días de prueba",
      note: "Hoy 0,00 US$. Después, 29,99 US$/mes.",
      today: "0,00 US$",
      full: "29,99 US$",
      next: "29,99 US$",
      date: "22 de septiembre de 2026",
      trial: true
    }, {
      id: "yearly",
      title: "Anual",
      note: "179,88 US$ hoy, una vez al año. Ahorras 180,00 US$.",
      today: "179,88 US$",
      full: "179,88 US$",
      next: "179,88 US$",
      date: "19 de septiembre de 2027",
      trial: false
    }]
  },
  pro: {
    name: "Pro",
    includes: ["60.000 palabras al mes, 3.000 por petición", "Las cuatro herramientas e historial cifrado", "Desglose por pasajes del detector"],
    options: [{
      id: "monthly",
      title: "Mensual",
      note: "14,99 US$ hoy y cada mes.",
      today: "14,99 US$",
      full: "14,99 US$",
      next: "14,99 US$",
      date: "19 de octubre de 2026",
      trial: false
    }, {
      id: "yearly",
      title: "Anual",
      note: "89,88 US$ hoy, una vez al año. Ahorras 90,00 US$.",
      today: "89,88 US$",
      full: "89,88 US$",
      next: "89,88 US$",
      date: "19 de septiembre de 2027",
      trial: false
    }]
  }
};
function OrderSummary({
  plan = "unlimited",
  cycle = "monthly",
  onCycle,
  compact = false
}) {
  const cfg = CYCLES[plan];
  const opt = cfg.options.find(o => o.id === cycle) || cfg.options[0];
  return /*#__PURE__*/React.createElement("div", {
    className: "vbx-os"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-os-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Verbalyx ", cfg.name), /*#__PURE__*/React.createElement("p", null, "Se activa en cuanto confirmes el pago, sin salir de esta p\xE1gina.")), opt.trial && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    variant: "success",
    style: {
      marginLeft: "auto"
    }
  }, "Prueba 3 d\xEDas")), onCycle && /*#__PURE__*/React.createElement("div", {
    className: "vbx-os-cycle"
  }, /*#__PURE__*/React.createElement("span", {
    className: "vbx-os-label"
  }, "Ciclo de facturaci\xF3n"), cfg.options.map(o => /*#__PURE__*/React.createElement("div", {
    key: o.id,
    className: "vbx-os-opt",
    "data-on": o.id === cycle,
    role: "radio",
    "aria-checked": o.id === cycle,
    tabIndex: 0,
    onClick: () => onCycle(o.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "vbx-os-radio"
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, o.title), /*#__PURE__*/React.createElement("em", null, o.note))))), !compact && /*#__PURE__*/React.createElement("ul", {
    className: "vbx-os-incl"
  }, cfg.includes.map(f => /*#__PURE__*/React.createElement("li", {
    key: f
  }, /*#__PURE__*/React.createElement("i", null, "\xB7"), /*#__PURE__*/React.createElement("span", null, f)))), /*#__PURE__*/React.createElement("div", {
    className: "vbx-os-lines"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-os-line"
  }, /*#__PURE__*/React.createElement("span", null, cfg.name, ", ciclo ", cycle === "yearly" ? "anual" : "mensual"), /*#__PURE__*/React.createElement("span", null, opt.trial ? `${opt.full}/mes` : opt.full)), opt.trial && /*#__PURE__*/React.createElement("div", {
    className: "vbx-os-line"
  }, /*#__PURE__*/React.createElement("span", null, "Prueba de 3 d\xEDas"), /*#__PURE__*/React.createElement("span", null, "\u2212", opt.full)), /*#__PURE__*/React.createElement("div", {
    className: "vbx-os-line"
  }, /*#__PURE__*/React.createElement("span", null, "Impuestos"), /*#__PURE__*/React.createElement("span", null, "Se calculan al pagar")), /*#__PURE__*/React.createElement("div", {
    className: "vbx-os-total"
  }, /*#__PURE__*/React.createElement("span", null, "Hoy pagas"), /*#__PURE__*/React.createElement("span", null, opt.today))));
}
Object.assign(__ds_scope, { CYCLES, OrderSummary });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/billing/OrderSummary.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const __css = `
.vbx-btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--space-2);white-space:nowrap;border:1px solid transparent;border-radius:var(--radius-md);font-family:var(--font-sans);font-size:var(--text-sm);font-weight:var(--font-medium);line-height:1.25;transition:var(--transition-control);cursor:pointer;flex-shrink:0;outline:none;text-decoration:none}
.vbx-btn:disabled{pointer-events:none;opacity:var(--disabled-opacity)}
.vbx-btn:focus-visible{border-color:var(--brand);box-shadow:0 0 0 3px color-mix(in oklab,var(--brand) 30%,transparent)}
.vbx-btn svg{width:1rem;height:1rem;flex-shrink:0;pointer-events:none}
.vbx-btn--default{height:var(--control-h);padding:var(--space-2) var(--space-4)}
.vbx-btn--sm{height:var(--control-h-sm);padding:0 var(--space-3);gap:var(--space-1-5)}
.vbx-btn--lg{height:var(--control-h-lg);padding:0 var(--space-6)}
.vbx-btn--icon{height:var(--control-h);width:var(--control-h);padding:0}
.vbx-btn-primary{background:var(--brand);color:var(--brand-fg);box-shadow:var(--shadow-xs)}
.vbx-btn-primary:hover{background:var(--brand-hover)}
.vbx-btn-primary:active{background:var(--brand-active)}
.vbx-btn-ink{background:var(--primary);color:var(--primary-foreground);box-shadow:var(--shadow-xs)}
.vbx-btn-ink:hover{background:color-mix(in oklab,var(--primary) var(--hover-mix),transparent)}
.vbx-btn-soft{background:var(--brand-soft);color:var(--brand-ink);border-color:var(--brand-line)}
.vbx-btn-soft:hover{background:#e4e9fc}
.vbx-btn-destructive{background:var(--danger);color:#fff;box-shadow:var(--shadow-xs)}
.vbx-btn-destructive:hover{background:color-mix(in oklab,var(--destructive) var(--hover-mix),transparent)}
.vbx-btn-outline{border-color:var(--border);background:var(--background);color:var(--foreground);box-shadow:var(--shadow-xs)}
.vbx-btn-outline:hover{background:var(--accent);color:var(--accent-foreground)}
.vbx-btn-secondary{background:var(--secondary);color:var(--secondary-foreground);box-shadow:var(--shadow-xs)}
.vbx-btn-secondary:hover{background:color-mix(in oklab,var(--secondary) var(--hover-mix-soft),transparent)}
.vbx-btn-ghost{background:transparent;color:var(--foreground)}
.vbx-btn-ghost:hover{background:var(--accent);color:var(--accent-foreground)}
.vbx-btn-link{background:transparent;color:var(--brand);text-underline-offset:4px;height:auto;padding:0}
.vbx-btn-link:hover{text-decoration:underline}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-button-css")) {
  const el = document.createElement("style");
  el.id = "vbx-button-css";
  el.textContent = __css;
  document.head.appendChild(el);
}
const VARIANTS = {
  default: "vbx-btn-primary",
  ink: "vbx-btn-ink",
  soft: "vbx-btn-soft",
  destructive: "vbx-btn-destructive",
  outline: "vbx-btn-outline",
  secondary: "vbx-btn-secondary",
  ghost: "vbx-btn-ghost",
  link: "vbx-btn-link"
};
function Button({
  variant = "default",
  size = "default",
  as = "button",
  className = "",
  children,
  ...props
}) {
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    "data-slot": "button",
    className: ["vbx-btn", "vbx-btn--" + size, VARIANTS[variant] || VARIANTS.default, className].filter(Boolean).join(" ")
  }, props), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/billing/PaymentForm.jsx
try { (() => {
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
function PaymentForm({
  amountToday = "0,00 US$",
  payLabel = "Empezar la prueba",
  trial = true,
  chargeDate = "22 de septiembre de 2026",
  nextAmount = "29,99 US$",
  email = "",
  status = "idle",
  onPay = () => {}
}) {
  const [agreed, setAgreed] = React.useState(false);
  const busy = status === "processing";
  return /*#__PURE__*/React.createElement("div", {
    className: "vbx-pay"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-pay-wallets"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "vbx-pay-wallet vbx-pay-wallet--dark",
    disabled: busy
  }, "Apple Pay"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "vbx-pay-wallet",
    disabled: busy
  }, "Google Pay")), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pay-or"
  }, "o paga con tarjeta"), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pay-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "vbx-pay-label",
    htmlFor: "vbx-pay-email"
  }, "Correo"), /*#__PURE__*/React.createElement("input", {
    id: "vbx-pay-email",
    className: "vbx-pay-input",
    type: "email",
    defaultValue: email,
    placeholder: "tu@correo.com",
    disabled: busy
  })), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pay-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "vbx-pay-label"
  }, "Datos de la tarjeta"), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pay-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-pay-card-num"
  }, /*#__PURE__*/React.createElement("input", {
    className: "vbx-pay-input",
    inputMode: "numeric",
    placeholder: "1234 1234 1234 1234",
    "aria-label": "N\xFAmero de tarjeta",
    disabled: busy
  }), /*#__PURE__*/React.createElement("span", {
    className: "vbx-pay-brands"
  }, /*#__PURE__*/React.createElement("span", {
    className: "vbx-pay-brand"
  }, "VISA"), /*#__PURE__*/React.createElement("span", {
    className: "vbx-pay-brand"
  }, "MC"), /*#__PURE__*/React.createElement("span", {
    className: "vbx-pay-brand"
  }, "AMEX"))), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pay-card-row"
  }, /*#__PURE__*/React.createElement("input", {
    className: "vbx-pay-input",
    inputMode: "numeric",
    placeholder: "MM / AA",
    "aria-label": "Caducidad",
    disabled: busy
  }), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pay-card-rule"
  }), /*#__PURE__*/React.createElement("input", {
    className: "vbx-pay-input",
    inputMode: "numeric",
    placeholder: "CVC",
    "aria-label": "C\xF3digo de seguridad",
    disabled: busy
  })))), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pay-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "vbx-pay-label",
    htmlFor: "vbx-pay-name"
  }, "Nombre en la tarjeta"), /*#__PURE__*/React.createElement("input", {
    id: "vbx-pay-name",
    className: "vbx-pay-input",
    placeholder: "Como aparece en la tarjeta",
    disabled: busy
  })), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pay-two"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-pay-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "vbx-pay-label",
    htmlFor: "vbx-pay-country"
  }, "Pa\xEDs o regi\xF3n"), /*#__PURE__*/React.createElement("select", {
    id: "vbx-pay-country",
    className: "vbx-pay-select",
    defaultValue: "Espa\xF1a",
    disabled: busy
  }, COUNTRIES.map(c => /*#__PURE__*/React.createElement("option", {
    key: c
  }, c)))), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pay-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "vbx-pay-label",
    htmlFor: "vbx-pay-zip"
  }, "C\xF3digo postal"), /*#__PURE__*/React.createElement("input", {
    id: "vbx-pay-zip",
    className: "vbx-pay-input",
    inputMode: "numeric",
    placeholder: "28004",
    disabled: busy
  }))), /*#__PURE__*/React.createElement("p", {
    className: "vbx-pay-disc"
  }, trial ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, "Hoy no se te cobra nada."), " Guardamos tu tarjeta y el ", chargeDate, ", al terminar los 3 d\xEDas de prueba, se te cobrar\xE1n ", nextAmount, "/mes. La suscripci\xF3n se renueva autom\xE1ticamente cada mes hasta que la canceles, en dos clics desde tu cuenta y tambi\xE9n durante la prueba.") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, "Hoy se te cobran ", amountToday, "."), " La suscripci\xF3n se renueva autom\xE1ticamente el ", chargeDate, " por", " ", nextAmount, " y se repite cada ciclo hasta que la canceles, en dos clics desde tu cuenta.")), /*#__PURE__*/React.createElement("label", {
    className: "vbx-pay-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: agreed,
    onChange: e => setAgreed(e.target.checked),
    disabled: busy
  }), /*#__PURE__*/React.createElement("span", null, "Entiendo que la suscripci\xF3n se renueva autom\xE1ticamente y que puedo cancelarla online en cualquier momento.")), status === "error" && /*#__PURE__*/React.createElement("p", {
    className: "vbx-pay-error"
  }, "Tu banco ha rechazado la tarjeta. No se ha cobrado nada. Prueba con otra o revisa los datos."), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "lg",
    style: {
      width: "100%"
    },
    disabled: !agreed || busy,
    onClick: onPay
  }, busy ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "vbx-pay-spinner"
  }), "Procesando el pago\u2026") : `${payLabel} — ${amountToday} hoy`), /*#__PURE__*/React.createElement("p", {
    className: "vbx-pay-secure"
  }, "El pago lo procesa Stripe dentro de esta misma p\xE1gina. Los datos de la tarjeta viajan cifrados directamente a Stripe: no pasan por nuestros servidores ni los guardamos."));
}
Object.assign(__ds_scope, { PaymentForm });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/billing/PaymentForm.jsx", error: String((e && e.message) || e) }); }

// components/billing/CheckoutModal.jsx
try { (() => {
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
function CheckoutModal({
  plan = "unlimited",
  cycle = "monthly",
  fixed = false,
  onBack = () => {},
  onDismiss = () => {},
  onDone = () => {}
}) {
  const [status, setStatus] = React.useState("idle");
  const cfg = __ds_scope.CYCLES[plan];
  const opt = cfg.options.find(o => o.id === cycle) || cfg.options[0];
  function pay() {
    setStatus("processing");
    setTimeout(() => setStatus("done"), 1500);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "vbx-cm-scrim",
    "data-fixed": fixed,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": `Pagar Verbalyx ${cfg.name}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-cm"
  }, status === "done" ? /*#__PURE__*/React.createElement("div", {
    className: "vbx-cm-done"
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    variant: "success",
    dot: true
  }, opt.trial ? "Prueba activa" : "Suscripción activa"), /*#__PURE__*/React.createElement("h2", null, opt.trial ? "Tu prueba empieza ahora" : `Ya estás en ${cfg.name}`), /*#__PURE__*/React.createElement("p", null, opt.trial ? "Tienes 3 días con todo desbloqueado y no se te ha cobrado nada. Tu texto sigue en el editor, tal cual lo dejaste." : "El pago se ha completado. Tu texto sigue en el editor, tal cual lo dejaste."), /*#__PURE__*/React.createElement("div", {
    className: "vbx-cm-donebox"
  }, /*#__PURE__*/React.createElement("span", null, opt.trial ? "Primer cobro" : "Próxima renovación"), /*#__PURE__*/React.createElement("b", null, opt.date), /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 4
    }
  }, opt.next, opt.trial ? "/mes, salvo que canceles antes" : ", renovación automática")), /*#__PURE__*/React.createElement("div", {
    className: "vbx-cm-doneacts"
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "lg",
    onClick: onDone
  }, "Seguir donde estaba"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "outline",
    onClick: onDone
  }, "Gestionar suscripci\xF3n")), /*#__PURE__*/React.createElement("p", null, "Te hemos enviado un correo con la fecha y el importe. ", opt.trial && "Te avisamos otra vez 24 h antes del cobro.")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "vbx-cm-top"
  }, /*#__PURE__*/React.createElement("button", {
    className: "vbx-cm-back",
    onClick: onBack
  }, "\u2190"), /*#__PURE__*/React.createElement("span", {
    className: "vbx-cm-title"
  }, "Pagar sin salir de aqu\xED"), /*#__PURE__*/React.createElement("button", {
    className: "vbx-cm-close",
    onClick: onDismiss,
    "aria-label": "Cerrar"
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    className: "vbx-cm-sum"
  }, /*#__PURE__*/React.createElement(__ds_scope.OrderSummary, {
    plan: plan,
    cycle: cycle,
    compact: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "vbx-cm-pay"
  }, /*#__PURE__*/React.createElement(__ds_scope.PaymentForm, {
    amountToday: opt.today,
    payLabel: opt.trial ? "Empezar la prueba" : "Pagar",
    trial: opt.trial,
    chargeDate: opt.date,
    nextAmount: opt.next,
    status: status,
    onPay: pay
  })))));
}
Object.assign(__ds_scope, { CheckoutModal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/billing/CheckoutModal.jsx", error: String((e && e.message) || e) }); }

// components/billing/Paywall.jsx
try { (() => {
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
function Legal({
  chargeDate
}) {
  return /*#__PURE__*/React.createElement("p", {
    className: "vbx-pw-legal"
  }, "Hoy no se te cobra nada. El ", chargeDate, ", al terminar los 3 d\xEDas de prueba, se te cobrar\xE1n ", UNLIMITED, "/mes salvo que canceles antes. Puedes cancelar o cambiar a Pro (", PRO, "/mes) en dos clics desde tu cuenta.");
}
function Trust() {
  return /*#__PURE__*/React.createElement("p", {
    className: "vbx-pw-trust"
  }, /*#__PURE__*/React.createElement("span", null, "Cancela online en dos clics"), /*#__PURE__*/React.createElement("span", null, "En los planes gratuitos no guardamos tu texto, solo el recuento"));
}
function Paywall({
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
  onSecondary = () => {}
}) {
  const anon = account === "anonymous";

  /* A — exceso por petición. Estado del editor: ni scrim ni modal. */
  if (trigger === "overflow") {
    return /*#__PURE__*/React.createElement("div", {
      className: "vbx-pw-overflow",
      role: "status"
    }, /*#__PURE__*/React.createElement("span", {
      className: "vbx-pw-count"
    }, perRequest, " / ", perRequest), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "Procesamos las primeras ", perRequest, " palabras"), " de las ", attempted.toLocaleString("es-ES"), " que has pegado. Pro ampl\xEDa el l\xEDmite a 3.000 por petici\xF3n; Ilimitado, a 8.000."), /*#__PURE__*/React.createElement(__ds_scope.Button, {
      variant: "soft",
      size: "sm",
      onClick: onPrimary
    }, "Ver planes"));
  }

  /* D — función de pago. Popover anclado al candado. */
  if (trigger === "feature") {
    return /*#__PURE__*/React.createElement("div", {
      className: "vbx-pw-pop",
      style: popoverStyle,
      role: "dialog",
      "aria-label": `Desbloquear ${featureName}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "vbx-pw-pop-arrow"
    }), /*#__PURE__*/React.createElement("h3", null, "El ", featureName, " es de los planes de pago"), /*#__PURE__*/React.createElement("p", null, "Pro guarda tus textos cifrados y te deja volver a cualquier resultado. En los planes gratuitos no se almacena el texto, solo el recuento."), /*#__PURE__*/React.createElement("div", {
      className: "vbx-pw-pop-actions"
    }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
      size: "sm",
      onClick: onPrimary
    }, "Desbloquear con Pro"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
      variant: "ghost",
      size: "sm",
      onClick: onDismiss
    }, "Cerrar")));
  }

  /* E — fin del trial. Pantalla completa, no descartable, dos CTA iguales. */
  if (trigger === "trialEnd") {
    return /*#__PURE__*/React.createElement("div", {
      className: "vbx-pw-full",
      "data-fixed": fixed,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "vbx-pw-full-title"
    }, /*#__PURE__*/React.createElement("div", {
      className: "vbx-pw-full-inner"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
      variant: "warning"
    }, "Tu prueba termina hoy"), /*#__PURE__*/React.createElement("h2", {
      id: "vbx-pw-full-title",
      style: {
        marginTop: "var(--space-4)"
      }
    }, "Elige c\xF3mo sigues. Hoy todav\xEDa no se te ha cobrado nada."), /*#__PURE__*/React.createElement("p", {
      className: "vbx-pw-sub",
      style: {
        fontSize: "var(--text-base)"
      }
    }, "Has usado Ilimitado durante 3 d\xEDas. Puedes continuar, bajar a Pro o cancelar: las tres opciones est\xE1n aqu\xED y ninguna requiere escribirnos.")), /*#__PURE__*/React.createElement("div", {
      className: "vbx-pw-plans"
    }, /*#__PURE__*/React.createElement("div", {
      className: "vbx-pw-plan"
    }, /*#__PURE__*/React.createElement("h3", null, "Ilimitado"), /*#__PURE__*/React.createElement("span", {
      className: "price"
    }, UNLIMITED, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 400,
        color: "var(--muted-foreground)"
      }
    }, "/mes")), /*#__PURE__*/React.createElement("p", null, "500.000 palabras al mes, 8.000 por petici\xF3n y prioridad de cola."), /*#__PURE__*/React.createElement(__ds_scope.Button, {
      size: "lg",
      onClick: onPrimary
    }, "Continuar en Ilimitado")), /*#__PURE__*/React.createElement("div", {
      className: "vbx-pw-plan"
    }, /*#__PURE__*/React.createElement("h3", null, "Pro"), /*#__PURE__*/React.createElement("span", {
      className: "price"
    }, PRO, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 400,
        color: "var(--muted-foreground)"
      }
    }, "/mes")), /*#__PURE__*/React.createElement("p", null, "60.000 palabras al mes, 3.000 por petici\xF3n. Todas las herramientas e historial."), /*#__PURE__*/React.createElement(__ds_scope.Button, {
      variant: "ink",
      size: "lg",
      onClick: onSecondary
    }, "Cambiar a Pro"))), /*#__PURE__*/React.createElement("p", {
      className: "vbx-pw-legal"
    }, "Si no eliges nada, hoy se te cobrar\xE1n ", UNLIMITED, " y la suscripci\xF3n de Ilimitado seguir\xE1 activa mes a mes. Cambiar a Pro aplica el prorrateo autom\xE1ticamente. Cancelar lleva dos clics desde tu cuenta y puedes hacerlo ahora mismo."), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(__ds_scope.Button, {
      variant: "ghost",
      onClick: onDismiss
    }, "Cancelar mi suscripci\xF3n"))));
  }

  /* C — herramienta de pago. Velo suave sobre el editor, candado. */
  if (trigger === "tool") {
    return /*#__PURE__*/React.createElement("div", {
      className: "vbx-pw-scrim",
      "data-fixed": fixed,
      "data-soft": "true",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "vbx-pw-title"
    }, /*#__PURE__*/React.createElement("div", {
      className: "vbx-pw vbx-pw--narrow"
    }, /*#__PURE__*/React.createElement("button", {
      className: "vbx-pw-close",
      onClick: onDismiss,
      "aria-label": "Cerrar"
    }, "\xD7"), /*#__PURE__*/React.createElement("div", {
      className: "vbx-pw-head"
    }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
      variant: "brand"
    }, "Plan de pago"), /*#__PURE__*/React.createElement("h2", {
      className: "vbx-pw-title",
      id: "vbx-pw-title"
    }, "El ", toolName.toLowerCase(), " est\xE1 en los planes de pago"), /*#__PURE__*/React.createElement("p", {
      className: "vbx-pw-sub"
    }, "El humanizador y el detector siguen siendo gratis, con o sin cuenta. El resto de herramientas entran con Pro o Ilimitado.")), /*#__PURE__*/React.createElement("div", {
      className: "vbx-pw-body"
    }, /*#__PURE__*/React.createElement("ul", {
      className: "vbx-pw-gain"
    }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
      className: "vbx-pw-tick"
    }, "\xB7"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Las cuatro herramientas"), ", sin cambiar de plan.")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
      className: "vbx-pw-tick"
    }, "\xB7"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Historial cifrado"), " y desglose por pasajes del detector."))), /*#__PURE__*/React.createElement("div", {
      className: "vbx-pw-actions"
    }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
      size: "lg",
      onClick: onPrimary
    }, "Probar Ilimitado 3 d\xEDas gratis"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
      variant: "outline",
      onClick: onSecondary
    }, "Ver planes")), /*#__PURE__*/React.createElement(Legal, {
      chargeDate: chargeDate
    }), /*#__PURE__*/React.createElement(Trust, null))));
  }

  /* B — cuota diaria agotada. */
  return /*#__PURE__*/React.createElement("div", {
    className: "vbx-pw-scrim",
    "data-fixed": fixed,
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": "vbx-pw-title"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-pw"
  }, /*#__PURE__*/React.createElement("button", {
    className: "vbx-pw-close",
    onClick: onDismiss,
    "aria-label": "Cerrar"
  }, "\xD7"), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pw-head"
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    variant: "warning"
  }, usedToday, " / ", limitToday, " palabras de hoy"), /*#__PURE__*/React.createElement("h2", {
    className: "vbx-pw-title",
    id: "vbx-pw-title"
  }, "Tu texto est\xE1 humanizado. Has agotado las palabras de hoy."), /*#__PURE__*/React.createElement("p", {
    className: "vbx-pw-sub"
  }, anon ? "Te enseñamos el principio. Crea una cuenta gratis y pasas a 500 palabras al día, o prueba Ilimitado y lo lees entero ahora." : "Te enseñamos el principio. Con Ilimitado lo lees entero ahora y dejas de tener límite diario.")), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pw-result"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-pw-result-label"
  }, "Resultado"), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pw-result-body"
  }, /*#__PURE__*/React.createElement("span", null, partialResult.slice(0, 210)), /*#__PURE__*/React.createElement("span", {
    className: "vbx-pw-locked"
  }, " ", partialResult.slice(210)), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pw-fade"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pw-body"
  }, /*#__PURE__*/React.createElement("ul", {
    className: "vbx-pw-gain"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
    className: "vbx-pw-tick"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Sin l\xEDmite diario"), " y hasta 8.000 palabras por petici\xF3n.")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
    className: "vbx-pw-tick"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Las cuatro herramientas"), ", historial cifrado y desglose por pasajes."))), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pw-actions"
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "lg",
    onClick: onPrimary
  }, "Probar Ilimitado 3 d\xEDas gratis"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "outline",
    onClick: onSecondary
  }, anon ? "Crear cuenta gratis — 500 palabras al día" : `Ver Pro — ${PRO}/mes`)), /*#__PURE__*/React.createElement(Legal, {
    chargeDate: chargeDate
  }), /*#__PURE__*/React.createElement(Trust, null))));
}
Object.assign(__ds_scope, { Paywall });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/billing/Paywall.jsx", error: String((e && e.message) || e) }); }

// components/feedback/QuotaBar.jsx
try { (() => {
const __css = `
.vbx-quota{display:flex;flex-direction:column;gap:var(--space-2)}
.vbx-quota-top{display:flex;align-items:baseline;gap:var(--space-2);font-size:var(--text-sm)}
.vbx-quota-top b{font-weight:var(--font-medium);white-space:nowrap}
.vbx-quota-top span{color:var(--muted-foreground);font-size:var(--text-xs);white-space:nowrap}
.vbx-quota-track{height:6px;border-radius:var(--radius-full);background:var(--border);overflow:hidden}
.vbx-quota-fill{display:block;height:100%;border-radius:var(--radius-full);background:var(--brand);transition:width var(--duration-fast) var(--easing-default)}
.vbx-quota-fill--warn{background:var(--warning-fill)}
.vbx-quota-fill--full{background:var(--danger)}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-quota-css")) {
  const el = document.createElement("style");
  el.id = "vbx-quota-css";
  el.textContent = __css;
  document.head.appendChild(el);
}
function QuotaBar({
  used = 0,
  total = 500,
  plan = "Gratis",
  unit = "palabras hoy",
  showPlan = true
}) {
  const pct = total ? Math.min(100, Math.round(used / total * 100)) : 0;
  const tone = pct >= 100 ? "full" : pct >= 80 ? "warn" : "brand";
  return /*#__PURE__*/React.createElement("div", {
    className: "vbx-quota"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-quota-top"
  }, /*#__PURE__*/React.createElement("b", null, used.toLocaleString("es-ES"), " / ", total.toLocaleString("es-ES"), " ", unit), showPlan && /*#__PURE__*/React.createElement("span", null, "Plan ", plan)), /*#__PURE__*/React.createElement("div", {
    className: "vbx-quota-track"
  }, /*#__PURE__*/React.createElement("span", {
    className: ["vbx-quota-fill", tone === "warn" ? "vbx-quota-fill--warn" : "", tone === "full" ? "vbx-quota-fill--full" : ""].filter(Boolean).join(" "),
    style: {
      width: pct + "%"
    }
  })));
}
Object.assign(__ds_scope, { QuotaBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/QuotaBar.jsx", error: String((e && e.message) || e) }); }

// components/feedback/SignupInvite.jsx
try { (() => {
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
function SignupInvite({
  anonDaily = 300,
  freeDaily = 500,
  dismissed = false,
  onSignup = () => {},
  onDismiss = () => {}
}) {
  if (dismissed) {
    return /*#__PURE__*/React.createElement("p", {
      className: "vbx-si-done",
      role: "status"
    }, "Hecho, no volveremos a mostrarlo. Si cambias de idea, \xABCrear cuenta gratis\xBB est\xE1 arriba a la derecha.");
  }
  return /*#__PURE__*/React.createElement("aside", {
    className: "vbx-si",
    "aria-label": "Crear una cuenta gratis"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-si-copy"
  }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "Con una cuenta gratis tienes ", /*#__PURE__*/React.createElement("span", {
    className: "vbx-si-num"
  }, freeDaily), " palabras al d\xEDa"), ", no", " ", /*#__PURE__*/React.createElement("span", {
    className: "vbx-si-num"
  }, anonDaily), "."), /*#__PURE__*/React.createElement("p", null, "Sin contrase\xF1a ni tarjeta: con Google o con un enlace a tu correo. Este resultado se queda aqu\xED.")), /*#__PURE__*/React.createElement("div", {
    className: "vbx-si-acts"
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    variant: "soft",
    onClick: onSignup
  }, "Crear cuenta gratis"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    variant: "ghost",
    onClick: onDismiss
  }, "Ahora no")));
}
Object.assign(__ds_scope, { SignupInvite });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/SignupInvite.jsx", error: String((e && e.message) || e) }); }

// components/feedback/UpsellBanner.jsx
try { (() => {
const __css = `
.vbx-upsell{display:flex;align-items:center;gap:var(--space-4);flex-wrap:wrap;border:1px solid var(--brand-line);border-radius:var(--radius-xl);background:var(--brand-soft);padding:var(--space-4) var(--space-6)}
.vbx-upsell p{margin:0;font-size:var(--text-sm);color:var(--brand-ink);line-height:var(--leading-normal);flex:1 1 320px}
.vbx-upsell b{font-weight:var(--font-semibold)}
.vbx-upsell--quota{border-color:var(--danger-line);background:var(--danger-soft)}
.vbx-upsell--quota p{color:var(--danger-ink)}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-upsell-css")) {
  const el = document.createElement("style");
  el.id = "vbx-upsell-css";
  el.textContent = __css;
  document.head.appendChild(el);
}
function UpsellBanner({
  tone = "brand",
  title,
  children,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ["vbx-upsell", tone === "quota" ? "vbx-upsell--quota" : ""].filter(Boolean).join(" ")
  }, /*#__PURE__*/React.createElement("p", null, title && /*#__PURE__*/React.createElement("b", null, title, " "), children), action);
}
Object.assign(__ds_scope, { UpsellBanner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/UpsellBanner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/UsageMeter.jsx
try { (() => {
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
const n = v => Number(v).toLocaleString("es-ES");
function UsageMeter({
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
  onManage = () => {}
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const id = React.useId ? React.useId() : "vbx-um-tip";
  const metered = plan === "free" || plan === "pro";
  const spent = metered && used >= limit;
  const pct = metered && limit ? Math.min(100, Math.round(used / limit * 100)) : 0;
  const tone = pct >= 100 ? "full" : pct >= 80 ? "warn" : "brand";
  const label = (() => {
    if (plan === "free") return compact ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, n(used), "/", n(limit)), /*#__PURE__*/React.createElement("span", null, "hoy")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "Hoy:"), /*#__PURE__*/React.createElement("b", null, n(used), " / ", n(limit)), /*#__PURE__*/React.createElement("span", null, "palabras"), spent && /*#__PURE__*/React.createElement("span", {
      className: "vbx-um-reset"
    }, "\xB7 se recargan en ", resetsIn));
    if (plan === "pro") return compact ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, n(used), "/", n(limit)), /*#__PURE__*/React.createElement("span", null, "mes")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "Este mes:"), /*#__PURE__*/React.createElement("b", null, n(used), " / ", n(limit)), /*#__PURE__*/React.createElement("span", null, "palabras"));
    return null;
  })();
  const tip = (() => {
    if (plan === "free") return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
      className: "t"
    }, "Plan Gratis \xB7 ", n(limit), " palabras al d\xEDa"), /*#__PURE__*/React.createElement("p", null, spent ? /*#__PURE__*/React.createElement(React.Fragment, null, "Has usado las ", n(limit), " de hoy. ") : /*#__PURE__*/React.createElement(React.Fragment, null, "Te quedan ", n(limit - used), ". "), "Se recargan en ", resetsIn, "."), /*#__PURE__*/React.createElement("p", {
      className: "m"
    }, "Pro quita el l\xEDmite diario: ", n(proMonthly), " palabras al mes y hasta ", n(proRequest), " por petici\xF3n."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("a", {
      onClick: onUpgrade
    }, "Ver planes")));
    if (plan === "pro") return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
      className: "t"
    }, "Plan Pro \xB7 ", n(limit), " palabras al mes"), /*#__PURE__*/React.createElement("p", null, "Te quedan ", n(Math.max(0, limit - used)), ". Se renuevan el ", renewsOn, ", con tu pr\xF3ximo cobro."), topup > 0 && /*#__PURE__*/React.createElement("p", null, "Recarga disponible: ", n(topup), " palabras. No caducan."), /*#__PURE__*/React.createElement("p", {
      className: "m"
    }, "Ilimitado sube a ", n(unlimitedMonthly), " al mes y ", n(unlimitedRequest), " por petici\xF3n."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("a", {
      onClick: onUpgrade
    }, "Pasar a Ilimitado")));
    if (plan === "trial") return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
      className: "t"
    }, "Prueba de Ilimitado"), /*#__PURE__*/React.createElement("p", null, "El ", trialEndsOn, " se te cobrar\xE1n ", trialAmount, "/mes salvo que canceles antes."), /*#__PURE__*/React.createElement("p", {
      className: "m"
    }, "Cancelar o bajar a Pro: Mi cuenta \u2192 Suscripci\xF3n. Dos clics."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("a", {
      onClick: onManage
    }, "Gestionar suscripci\xF3n")));
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
      className: "t"
    }, "Plan Ilimitado"), /*#__PURE__*/React.createElement("p", null, "Sin l\xEDmite diario. Hasta ", n(unlimitedRequest), " palabras por petici\xF3n."));
  })();
  const show = () => setOpen(true);
  const hide = () => setOpen(defaultOpen);
  return /*#__PURE__*/React.createElement("div", {
    className: "vbx-um",
    "data-compact": compact,
    onMouseEnter: show,
    onMouseLeave: hide
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "vbx-um-trigger",
    "aria-describedby": open ? id : undefined,
    "aria-expanded": open,
    onClick: () => setOpen(o => !o),
    onFocus: show,
    onBlur: hide
  }, metered ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "vbx-um-label"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "vbx-um-track",
    role: "progressbar",
    "aria-valuemin": 0,
    "aria-valuemax": limit,
    "aria-valuenow": Math.min(used, limit),
    "aria-label": `${n(used)} de ${n(limit)} palabras`
  }, /*#__PURE__*/React.createElement("span", {
    className: "vbx-um-fill",
    "data-tone": tone,
    style: {
      width: pct + "%"
    }
  }))) : plan === "trial" ? /*#__PURE__*/React.createElement("span", {
    className: "vbx-um-flat"
  }, "Ilimitado ", /*#__PURE__*/React.createElement("span", null, "\xB7 ", compact ? "prueba" : `prueba hasta el ${trialEndsOn}`)) : /*#__PURE__*/React.createElement("span", {
    className: "vbx-um-flat"
  }, "Ilimitado")), plan === "free" && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    variant: spent ? "soft" : "outline",
    onClick: onUpgrade
  }, "Mejorar"), plan === "pro" && !compact && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    variant: "link",
    onClick: onUpgrade
  }, "Pasar a Ilimitado"), open && /*#__PURE__*/React.createElement("div", {
    className: "vbx-um-tip",
    role: "tooltip",
    id: id
  }, tip));
}
Object.assign(__ds_scope, { UsageMeter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/UsageMeter.jsx", error: String((e && e.message) || e) }); }

// components/forms/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const __css = `
.vbx-chip{display:inline-flex;align-items:center;justify-content:center;height:var(--control-h-sm);padding:0 var(--space-3);border:1px solid var(--border);border-radius:var(--radius-md);background:var(--background);color:var(--muted-foreground);font-family:var(--font-sans);font-size:var(--text-sm);font-weight:var(--font-medium);cursor:pointer;transition:var(--transition-colors);white-space:nowrap}
.vbx-chip:hover{background:var(--accent);color:var(--foreground)}
.vbx-chip[aria-pressed="true"]{background:var(--brand);border-color:var(--brand);color:var(--brand-fg)}
.vbx-chip[aria-pressed="true"]:hover{background:var(--brand-hover)}
.vbx-chip:disabled{opacity:var(--disabled-opacity);pointer-events:none}
.vbx-chip:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in oklab,var(--brand) 30%,transparent)}
.vbx-chip--round{border-radius:var(--radius-full)}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-chip-css")) {
  const el = document.createElement("style");
  el.id = "vbx-chip-css";
  el.textContent = __css;
  document.head.appendChild(el);
}
function Chip({
  pressed = false,
  round = false,
  className = "",
  children,
  ...props
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-pressed": pressed,
    className: ["vbx-chip", round ? "vbx-chip--round" : "", className].filter(Boolean).join(" ")
  }, props), children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Chip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const __css = `
.vbx-input{display:flex;width:100%;height:var(--control-h);border:1px solid var(--input);border-radius:var(--radius-md);background:transparent;color:var(--foreground);padding:0 var(--space-3);font-family:var(--font-sans);font-size:var(--text-sm);outline:none;transition:var(--transition-colors),box-shadow var(--duration-fast) var(--easing-default)}
.vbx-input::placeholder{color:var(--muted-foreground)}
.vbx-input:focus-visible{border-color:var(--ring);box-shadow:var(--ring-focus)}
.vbx-input[aria-invalid="true"]{border-color:var(--destructive);box-shadow:var(--ring-invalid)}
.vbx-input:disabled{cursor:not-allowed;opacity:var(--disabled-opacity)}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-input-css")) {
  const el = document.createElement("style");
  el.id = "vbx-input-css";
  el.textContent = __css;
  document.head.appendChild(el);
}
function Input({
  className = "",
  type = "text",
  ...props
}) {
  return /*#__PURE__*/React.createElement("input", _extends({
    "data-slot": "input",
    type: type,
    className: ["vbx-input", className].filter(Boolean).join(" ")
  }, props));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const __css = `
.vbx-textarea{display:flex;width:100%;min-height:4rem;field-sizing:content;border:1px solid var(--input);border-radius:var(--radius-md);background:transparent;color:var(--foreground);padding:var(--space-2) var(--space-3);font-family:var(--font-sans);font-size:var(--text-base);line-height:var(--leading-normal);box-shadow:var(--shadow-xs);outline:none;transition:var(--transition-colors),box-shadow var(--duration-fast) var(--easing-default);resize:vertical}
@media (min-width:768px){.vbx-textarea{font-size:var(--text-sm)}}
.vbx-textarea::placeholder{color:var(--muted-foreground)}
.vbx-textarea:focus-visible{border-color:var(--ring);box-shadow:var(--ring-focus)}
.vbx-textarea[aria-invalid="true"]{border-color:var(--destructive);box-shadow:var(--ring-invalid)}
.vbx-textarea:disabled{cursor:not-allowed;opacity:var(--disabled-opacity)}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-textarea-css")) {
  const el = document.createElement("style");
  el.id = "vbx-textarea-css";
  el.textContent = __css;
  document.head.appendChild(el);
}
function Textarea({
  className = "",
  ...props
}) {
  return /*#__PURE__*/React.createElement("textarea", _extends({
    "data-slot": "textarea",
    className: ["vbx-textarea", className].filter(Boolean).join(" ")
  }, props));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/ToolTabs.jsx
try { (() => {
const __css = `
.vbx-tabs{display:flex;gap:2px;border-bottom:1px solid var(--border);overflow-x:auto;scrollbar-width:none}
.vbx-tabs::-webkit-scrollbar{display:none}
.vbx-tab{position:relative;padding:var(--space-3) var(--space-3);border:0;background:transparent;font-family:var(--font-sans);font-size:var(--text-sm);font-weight:var(--font-medium);color:var(--muted-foreground);cursor:pointer;white-space:nowrap;text-align:left;transition:var(--transition-colors)}
.vbx-tab:hover{color:var(--foreground)}
.vbx-tab[aria-selected="true"]{color:var(--brand)}
.vbx-tab[aria-selected="true"]::after{content:"";position:absolute;left:10px;right:10px;bottom:-1px;height:2px;background:var(--brand);border-radius:2px}
.vbx-tab:disabled{color:var(--muted-foreground);opacity:var(--disabled-opacity);cursor:not-allowed}
.vbx-tab small{display:block;font-weight:var(--font-normal);font-size:var(--text-xs);color:var(--muted-foreground);margin-top:2px}
.vbx-tab:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in oklab,var(--brand) 30%,transparent);border-radius:var(--radius-sm)}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-tooltabs-css")) {
  const el = document.createElement("style");
  el.id = "vbx-tooltabs-css";
  el.textContent = __css;
  document.head.appendChild(el);
}
function ToolTabs({
  items = [],
  value,
  onChange = () => {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "vbx-tabs",
    role: "tablist"
  }, items.map(item => /*#__PURE__*/React.createElement("button", {
    key: item.id,
    role: "tab",
    type: "button",
    className: "vbx-tab",
    "aria-selected": item.id === value,
    disabled: item.disabled,
    onClick: () => !item.disabled && onChange(item.id)
  }, item.label, item.hint && /*#__PURE__*/React.createElement("small", null, item.hint))));
}
Object.assign(__ds_scope, { ToolTabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/ToolTabs.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const __css = `
.vbx-card{display:flex;flex-direction:column;gap:var(--space-6);padding-top:var(--space-6);padding-bottom:var(--space-6);border:1px solid var(--border);border-radius:var(--radius-xl);background:var(--card);color:var(--card-foreground);box-shadow:var(--shadow-sm)}
.vbx-card-header{display:grid;grid-auto-rows:min-content;gap:var(--space-1-5);align-items:start;padding-left:var(--space-6);padding-right:var(--space-6)}
.vbx-card-header:has(.vbx-card-action){grid-template-columns:1fr auto}
.vbx-card-title{font-size:var(--text-base);font-weight:var(--font-semibold);line-height:var(--leading-none)}
.vbx-card-description{font-size:var(--text-sm);color:var(--muted-foreground)}
.vbx-card-action{grid-column-start:2;grid-row:1/span 2;align-self:start;justify-self:end}
.vbx-card-content{padding-left:var(--space-6);padding-right:var(--space-6)}
.vbx-card-footer{display:flex;align-items:center;padding-left:var(--space-6);padding-right:var(--space-6)}
.vbx-card--interactive{transition:var(--transition-colors);cursor:pointer}
.vbx-card--interactive:hover{background:color-mix(in oklab,var(--accent) 40%,var(--card))}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-card-css")) {
  const el = document.createElement("style");
  el.id = "vbx-card-css";
  el.textContent = __css;
  document.head.appendChild(el);
}
function Card({
  interactive = false,
  className = "",
  children,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    "data-slot": "card",
    className: ["vbx-card", interactive ? "vbx-card--interactive" : "", className].filter(Boolean).join(" ")
  }, props), children);
}
function CardHeader({
  className = "",
  children,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    "data-slot": "card-header",
    className: ["vbx-card-header", className].filter(Boolean).join(" ")
  }, props), children);
}
function CardTitle({
  className = "",
  children,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    "data-slot": "card-title",
    className: ["vbx-card-title", className].filter(Boolean).join(" ")
  }, props), children);
}
function CardDescription({
  className = "",
  children,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    "data-slot": "card-description",
    className: ["vbx-card-description", className].filter(Boolean).join(" ")
  }, props), children);
}
function CardAction({
  className = "",
  children,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    "data-slot": "card-action",
    className: ["vbx-card-action", className].filter(Boolean).join(" ")
  }, props), children);
}
function CardContent({
  className = "",
  children,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    "data-slot": "card-content",
    className: ["vbx-card-content", className].filter(Boolean).join(" ")
  }, props), children);
}
function CardFooter({
  className = "",
  children,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    "data-slot": "card-footer",
    className: ["vbx-card-footer", className].filter(Boolean).join(" ")
  }, props), children);
}
Object.assign(__ds_scope, { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// components/tools/EvidenceBand.jsx
try { (() => {
const __css = `
.vbx-eb{display:flex;flex-direction:column;gap:var(--space-4)}
.vbx-eb-head{display:flex;align-items:flex-start;gap:var(--space-3);flex-wrap:wrap}
.vbx-eb-band{display:inline-flex;align-items:center;gap:var(--space-2);height:30px;padding:0 var(--space-3);border-radius:var(--radius-md);font-size:var(--text-sm);font-weight:var(--font-semibold);flex:none}
.vbx-eb-band--none{background:var(--success-soft);border:1px solid var(--success-line);color:var(--success-ink)}
.vbx-eb-band--some{background:var(--warning-soft);border:1px solid var(--warning-line);color:var(--warning-ink)}
.vbx-eb-band--clear{background:var(--danger-soft);border:1px solid var(--danger-line);color:var(--danger-ink)}
.vbx-eb-band--gray{background:var(--muted);border:1px solid var(--border);color:var(--muted-foreground)}
.vbx-eb-dot{width:8px;height:8px;border-radius:50%;background:currentColor;flex:none}
.vbx-eb-scale{display:flex;gap:3px;flex:1;min-width:11rem;align-items:center}
.vbx-eb-step{flex:1;height:6px;border-radius:var(--radius-full);background:var(--border)}
.vbx-eb-step[data-on="true"]{background:currentColor}
.vbx-eb-title{margin:0;font-size:var(--text-base);font-weight:var(--font-semibold);line-height:1.35}
.vbx-eb-note{margin:var(--space-1) 0 0;font-size:var(--text-sm);color:var(--muted-foreground);line-height:var(--leading-normal)}
.vbx-eb-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:var(--space-2)}
.vbx-eb-item{display:flex;gap:var(--space-3);align-items:flex-start;font-size:var(--text-sm);line-height:var(--leading-normal)}
.vbx-eb-tag{display:inline-flex;align-items:center;height:20px;padding:0 var(--space-2);border-radius:var(--radius-sm);font-size:var(--text-xs);font-weight:var(--font-medium);flex:none;margin-top:1px;min-width:4.5rem;justify-content:center}
.vbx-eb-tag--good{background:var(--success-soft);color:var(--success-ink)}
.vbx-eb-tag--warn{background:var(--warning-soft);color:var(--warning-ink)}
.vbx-eb-tag--bad{background:var(--danger-soft);color:var(--danger-ink)}
.vbx-eb-disc{margin:0;font-size:var(--text-sm);color:var(--muted-foreground);line-height:var(--leading-normal)}
@media (max-width:520px){.vbx-eb-scale{min-width:100%;order:3}}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-band-css")) {
  const el = document.createElement("style");
  el.id = "vbx-band-css";
  el.textContent = __css;
  document.head.appendChild(el);
}
const BANDS = {
  none: {
    label: "Sin indicios",
    steps: 1,
    className: "none",
    title: "No hemos encontrado indicios de escritura automática"
  },
  some: {
    label: "Algunos indicios",
    steps: 2,
    className: "some",
    title: "Hay algunos indicios de escritura automática"
  },
  clear: {
    label: "Indicios claros",
    steps: 3,
    className: "clear",
    title: "Hay indicios claros de escritura automática"
  },
  insufficient: {
    label: "Texto insuficiente",
    steps: 0,
    className: "gray",
    title: "No hay texto suficiente para decir nada"
  }
};
const DEFAULT_NOTE = "Esto es una lectura de patrones, no un veredicto. No existe ninguna prueba que determine con certeza quién escribió un texto, y entre dejar pasar un texto generado y señalar a alguien que escribió el suyo, los dos errores no cuestan lo mismo.";
function EvidenceBand({
  band = "some",
  findings = [],
  note,
  minWords = 200,
  minSentences = 8,
  children
}) {
  const cfg = BANDS[band] || BANDS.some;
  const insufficient = band === "insufficient";
  return /*#__PURE__*/React.createElement("div", {
    className: "vbx-eb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-eb-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: `vbx-eb-band vbx-eb-band--${cfg.className}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "vbx-eb-dot"
  }), cfg.label), /*#__PURE__*/React.createElement("span", {
    className: `vbx-eb-scale vbx-eb-band--${cfg.className}`,
    style: {
      background: "none",
      border: 0,
      height: "auto",
      padding: 0
    },
    "aria-hidden": "true"
  }, [1, 2, 3].map(n => /*#__PURE__*/React.createElement("span", {
    key: n,
    className: "vbx-eb-step",
    "data-on": n <= cfg.steps
  }))), children), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "vbx-eb-title"
  }, cfg.title), /*#__PURE__*/React.createElement("p", {
    className: "vbx-eb-note"
  }, insufficient ? `Necesitamos al menos ${minWords} palabras y ${minSentences} frases para que el análisis signifique algo. Con menos, cualquier lectura sería ruido.` : "Estos son los rasgos concretos en los que nos basamos. Léelos: dicen más que una etiqueta.")), !insufficient && findings.length > 0 && /*#__PURE__*/React.createElement("ul", {
    className: "vbx-eb-list"
  }, findings.map(f => /*#__PURE__*/React.createElement("li", {
    className: "vbx-eb-item",
    key: f.label
  }, /*#__PURE__*/React.createElement("span", {
    className: `vbx-eb-tag vbx-eb-tag--${f.tone}`
  }, f.tone === "good" ? "Bien" : f.tone === "warn" ? "Revisa" : "Señal"), /*#__PURE__*/React.createElement("span", null, f.label)))), /*#__PURE__*/React.createElement("p", {
    className: "vbx-eb-disc"
  }, note ?? DEFAULT_NOTE));
}
Object.assign(__ds_scope, { EvidenceBand });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tools/EvidenceBand.jsx", error: String((e && e.message) || e) }); }

// components/tools/Highlight.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const __css = `
.vbx-hl{border-radius:2px;padding:0 1px;color:inherit;background:var(--hl-rewritten);box-shadow:inset 0 -2px 0 var(--hl-rewritten-line)}
.vbx-hl--added{background:var(--hl-added);box-shadow:inset 0 -2px 0 var(--hl-added-line)}
.vbx-hl-legend{display:inline-flex;align-items:center;gap:var(--space-1-5);font-size:var(--text-xs);color:var(--muted-foreground)}
.vbx-hl-swatch{width:10px;height:10px;border-radius:2px;background:var(--hl-rewritten);box-shadow:inset 0 -2px 0 var(--hl-rewritten-line);flex:none}
.vbx-hl-swatch--added{background:var(--hl-added);box-shadow:inset 0 -2px 0 var(--hl-added-line)}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-highlight-css")) {
  const el = document.createElement("style");
  el.id = "vbx-highlight-css";
  el.textContent = __css;
  document.head.appendChild(el);
}
function Highlight({
  kind = "rewritten",
  children,
  ...props
}) {
  return /*#__PURE__*/React.createElement("mark", _extends({
    className: ["vbx-hl", kind === "added" ? "vbx-hl--added" : ""].filter(Boolean).join(" ")
  }, props), children);
}
function HighlightLegend({
  kind = "rewritten",
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "vbx-hl-legend"
  }, /*#__PURE__*/React.createElement("span", {
    className: ["vbx-hl-swatch", kind === "added" ? "vbx-hl-swatch--added" : ""].filter(Boolean).join(" ")
  }), children ?? (kind === "added" ? "Añadido" : "Reescrito"));
}
Object.assign(__ds_scope, { Highlight, HighlightLegend });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tools/Highlight.jsx", error: String((e && e.message) || e) }); }

// components/tools/LimitNotice.jsx
try { (() => {
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
const n = v => Number(v).toLocaleString("es-ES");
function LimitNotice({
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
  onAction = () => {}
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
  return /*#__PURE__*/React.createElement("div", {
    className: "vbx-ln",
    role: "status",
    "data-kind": kind
  }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, lead), body), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    variant: "soft",
    onClick: onAction
  }, action));
}
Object.assign(__ds_scope, { LimitNotice });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tools/LimitNotice.jsx", error: String((e && e.message) || e) }); }

// components/tools/RunCost.jsx
try { (() => {
// D3 · What the next run will cost, next to the button: before the click,
// not after. «923 palabras · se procesarán 200 · te quedan 200».

const __css = `
.vbx-rc{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 6px;font-size:var(--text-sm);line-height:1.4;color:var(--muted-foreground);font-variant-numeric:tabular-nums}
.vbx-rc i{font-style:normal;color:var(--muted-foreground);opacity:.55}
.vbx-rc .over{color:var(--danger-ink);font-weight:var(--font-medium)}
.vbx-rc .cut{color:var(--warning-ink);font-weight:var(--font-medium)}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-rc-css")) {
  const el = document.createElement("style");
  el.id = "vbx-rc-css";
  el.textContent = __css;
  document.head.appendChild(el);
}
const n = v => Number(v).toLocaleString("es-ES");
function RunCost({
  words = 0,
  ceiling = 300,
  remaining = null,
  window = "hoy",
  detector = false
}) {
  if (words === 0) return null;
  const cap = remaining === null ? ceiling : Math.min(ceiling, remaining);
  const processable = Math.min(words, cap);
  const over = words > cap;
  const Sep = () => /*#__PURE__*/React.createElement("i", {
    "aria-hidden": "true"
  }, "\xB7");
  return /*#__PURE__*/React.createElement("p", {
    className: "vbx-rc",
    style: {
      margin: 0
    },
    "data-testid": "run-cost"
  }, /*#__PURE__*/React.createElement("span", {
    className: over ? "over" : ""
  }, n(words), " palabras"), remaining === 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Sep, null), /*#__PURE__*/React.createElement("span", {
    className: "cut"
  }, "no te quedan palabras ", window)) : detector && over && remaining !== null && remaining < Math.min(words, ceiling) ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Sep, null), /*#__PURE__*/React.createElement("span", {
    className: "cut"
  }, "necesita ", n(Math.min(words, ceiling))), /*#__PURE__*/React.createElement(Sep, null), /*#__PURE__*/React.createElement("span", null, "te quedan ", n(remaining))) : /*#__PURE__*/React.createElement(React.Fragment, null, over && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Sep, null), /*#__PURE__*/React.createElement("span", {
    className: "cut"
  }, "se procesar\xE1n ", n(processable))), remaining !== null && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Sep, null), /*#__PURE__*/React.createElement("span", null, "te quedan ", n(remaining), over ? "" : ` ${window}`))));
}
Object.assign(__ds_scope, { RunCost });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tools/RunCost.jsx", error: String((e && e.message) || e) }); }

// components/tools/ToolEditor.jsx
try { (() => {
const __css = `
.vbx-editor{border:1px solid var(--border);border-radius:var(--radius-xl);background:var(--card);box-shadow:var(--shadow-sm);overflow:hidden}
.vbx-editor-bar{display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap;padding:var(--space-2) var(--space-3);border-bottom:1px solid var(--border);background:var(--muted)}
.vbx-editor-panes{display:grid;grid-template-columns:1fr 1px 1fr}
@media (max-width:720px){.vbx-editor-panes{grid-template-columns:1fr}.vbx-editor-rule{display:none}}
.vbx-editor-rule{background:var(--border)}
.vbx-editor-pane{display:flex;flex-direction:column;padding:var(--space-4) var(--space-5);min-height:var(--min-editor)}
.vbx-editor-pane textarea{flex:1;border:0;outline:none;resize:none;background:transparent;color:var(--foreground);font-family:var(--font-sans);font-size:1rem;line-height:var(--leading-relaxed)}
.vbx-editor-pane textarea::placeholder{color:var(--muted-foreground)}
.vbx-editor-out{flex:1;font-size:1rem;line-height:var(--leading-relaxed);white-space:pre-wrap}
.vbx-editor-foot{display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap;margin-top:var(--space-3);font-size:var(--text-sm);color:var(--muted-foreground)}
.vbx-editor-run{display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap;padding:var(--space-3) var(--space-4);border-top:1px solid var(--border);background:var(--muted)}
.vbx-editor-legend{display:flex;align-items:center;gap:var(--space-3);margin-left:auto}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-editor-css")) {
  const el = document.createElement("style");
  el.id = "vbx-editor-css";
  el.textContent = __css;
  document.head.appendChild(el);
}
const MODE_LABELS = {
  academico: "Académico",
  neutro: "Neutro",
  informal: "Informal",
  estandar: "Estándar",
  fluido: "Fluido",
  formal: "Formal",
  simple: "Simple",
  creativo: "Creativo",
  general: "General"
};
const DEMO_SEGMENTS = [{
  kind: "rewritten",
  text: "Estas metodologías cambian bastante los resultados"
}, {
  kind: "plain",
  text: ", y por eso vale la pena implementarlas con cuidado. "
}, {
  kind: "added",
  text: "Dicho de otro modo"
}, {
  kind: "plain",
  text: ": el proceso llega al objetivo sin dar vueltas de más."
}];
function countWords(text) {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}
function ToolEditor({
  name = "Humanizador",
  modes = ["academico", "neutro", "informal"],
  wordsRemaining = null,
  segments = DEMO_SEGMENTS,
  initialText = "",
  footer = null
}) {
  const [mode, setMode] = React.useState(modes[1] ?? modes[0]);
  const [input, setInput] = React.useState(initialText);
  const [status, setStatus] = React.useState("idle");
  const [shown, setShown] = React.useState(0);
  const words = countWords(input);
  const total = segments.reduce((n, s) => n + s.text.length, 0);
  function run() {
    setStatus("loading");
    setShown(0);
    let i = 0;
    const timer = setInterval(() => {
      i += 4;
      setShown(i);
      if (i >= total) {
        clearInterval(timer);
        setStatus("done");
      }
    }, 16);
  }
  let budget = shown;
  const visible = segments.map(seg => {
    const slice = seg.text.slice(0, Math.max(0, budget));
    budget -= seg.text.length;
    return {
      ...seg,
      slice
    };
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "vbx-editor"
  }, modes.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "vbx-editor-bar"
  }, modes.map(m => /*#__PURE__*/React.createElement(__ds_scope.Chip, {
    key: m,
    pressed: m === mode,
    onClick: () => setMode(m)
  }, MODE_LABELS[m] ?? m))), /*#__PURE__*/React.createElement("div", {
    className: "vbx-editor-panes"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-editor-pane"
  }, /*#__PURE__*/React.createElement("textarea", {
    value: input,
    onChange: e => setInput(e.target.value),
    placeholder: "Pega aqu\xED tu texto\u2026"
  }), /*#__PURE__*/React.createElement("div", {
    className: "vbx-editor-foot"
  }, /*#__PURE__*/React.createElement("span", null, words, " palabras", wordsRemaining !== null && ` · Te quedan ${wordsRemaining.toLocaleString("es-ES")} hoy`))), /*#__PURE__*/React.createElement("div", {
    className: "vbx-editor-rule"
  }), /*#__PURE__*/React.createElement("div", {
    className: "vbx-editor-pane"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-editor-out"
  }, shown === 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--muted-foreground)"
    }
  }, status === "loading" ? "Escribiendo…" : "El resultado aparecerá aquí") : visible.map((seg, i) => seg.kind === "plain" ? /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, seg.slice) : /*#__PURE__*/React.createElement(__ds_scope.Highlight, {
    key: i,
    kind: seg.kind
  }, seg.slice))), status === "done" && /*#__PURE__*/React.createElement("div", {
    className: "vbx-editor-foot"
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "outline",
    size: "sm"
  }, "Copiar resultado"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "ghost",
    size: "sm",
    onClick: run
  }, "Rehacer")))), /*#__PURE__*/React.createElement("div", {
    className: "vbx-editor-run"
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "lg",
    onClick: run,
    disabled: status === "loading" || words === 0
  }, status === "loading" ? "Procesando…" : name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--muted-foreground)"
    }
  }, footer ?? "No guardamos tu texto."), status === "done" && /*#__PURE__*/React.createElement("span", {
    className: "vbx-editor-legend"
  }, /*#__PURE__*/React.createElement(__ds_scope.HighlightLegend, {
    kind: "rewritten"
  }), /*#__PURE__*/React.createElement(__ds_scope.HighlightLegend, {
    kind: "added"
  }))));
}
Object.assign(__ds_scope, { ToolEditor });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tools/ToolEditor.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/AdminBackoffice.jsx
try { (() => {
const STATUS_LABELS = {
  trialing: "En prueba",
  active: "Activa",
  past_due: "Pago pendiente",
  canceled: "Cancelada",
  unpaid: "Impagada"
};
const ROWS = [{
  id: 1,
  email: "laura.mendez@gmail.com",
  plan: "pro",
  interval: "year",
  status: "active",
  end: "12/3/2027",
  words: 41230,
  cost: 612,
  created: "8/1/2026"
}, {
  id: 2,
  email: "j.ferrer@uab.cat",
  plan: "pro",
  interval: "month",
  status: "trialing",
  end: "18/9/2026",
  words: 8940,
  cost: 134,
  created: "12/9/2026"
}, {
  id: 3,
  email: "contenidos@lunamkt.es",
  plan: "pro",
  interval: "month",
  status: "past_due",
  end: "1/10/2026",
  words: 22110,
  cost: 331,
  created: "3/5/2026"
}, {
  id: 4,
  email: "diego.sanroman@outlook.com",
  plan: "free",
  interval: null,
  status: null,
  end: null,
  words: 1420,
  cost: 21,
  created: "14/9/2026"
}, {
  id: 5,
  email: "maria.ocampo@unam.mx",
  plan: "pro",
  interval: "year",
  status: "active",
  cancel: true,
  end: "2/2/2027",
  words: 63870,
  cost: 958,
  created: "2/2/2026"
}, {
  id: 6,
  email: "hola@estudiotinta.co",
  plan: "free",
  interval: null,
  status: null,
  end: null,
  words: 380,
  cost: 5,
  created: "15/9/2026"
}];
const euros = n => n.toLocaleString("es-ES", {
  style: "currency",
  currency: "EUR"
});
const th = {
  padding: "var(--space-2) var(--space-3)",
  fontWeight: "var(--font-medium)",
  textAlign: "left"
};
const td = {
  padding: "var(--space-2) var(--space-3)"
};
function AdminBackoffice() {
  const stats = [{
    label: "Usuarios",
    value: "1.284"
  }, {
    label: "Pro activos",
    value: "96"
  }, {
    label: "En prueba",
    value: "14"
  }, {
    label: "MRR",
    value: euros(742.1)
  }, {
    label: "Coste IA (mes)",
    value: euros(118.4)
  }];
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: "var(--width-wide)",
      margin: "0 auto",
      padding: "var(--pad-page-y) var(--gutter-page)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: "var(--text-2xl)",
      fontWeight: "var(--font-semibold)"
    }
  }, "Backoffice"), /*#__PURE__*/React.createElement("a", {
    href: "../app/index.html",
    style: {
      fontSize: "var(--text-sm)",
      textDecoration: "underline",
      color: "inherit"
    }
  }, "Volver a la app")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-8)",
      display: "grid",
      gridTemplateColumns: "repeat(5,1fr)",
      gap: "var(--space-4)"
    }
  }, stats.map(({
    label,
    value
  }) => /*#__PURE__*/React.createElement(__ds_scope.Card, {
    key: label
  }, /*#__PURE__*/React.createElement(__ds_scope.CardHeader, {
    style: {
      paddingBottom: 0
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.CardTitle, {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--font-normal)",
      color: "var(--muted-foreground)"
    }
  }, label)), /*#__PURE__*/React.createElement(__ds_scope.CardContent, {
    style: {
      fontSize: "var(--text-2xl)",
      fontWeight: "var(--font-semibold)"
    }
  }, value)))), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "var(--space-12) 0 0",
      fontSize: "var(--text-lg)",
      fontWeight: "var(--font-semibold)"
    }
  }, "Usuarios (", ROWS.length, ")"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-4)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      overflowX: "auto"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      fontSize: "var(--text-sm)",
      borderCollapse: "collapse"
    }
  }, /*#__PURE__*/React.createElement("thead", {
    style: {
      background: "color-mix(in oklab, var(--muted) 50%, transparent)"
    }
  }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Email"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Plan"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Estado"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Renueva"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: "right"
    }
  }, "Palabras/mes"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: "right"
    }
  }, "Coste IA"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Alta"))), /*#__PURE__*/React.createElement("tbody", null, ROWS.map(row => /*#__PURE__*/React.createElement("tr", {
    key: row.id,
    style: {
      borderTop: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: td
  }, row.email), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    variant: row.plan === "pro" ? "default" : "secondary"
  }, row.plan === "pro" ? "Pro" : "Gratis"), row.interval && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "var(--space-2)",
      color: "var(--muted-foreground)"
    }
  }, row.interval === "year" ? "anual" : "mensual")), /*#__PURE__*/React.createElement("td", {
    style: td
  }, row.status ? STATUS_LABELS[row.status] : "—", row.cancel && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "var(--space-1)",
      color: "var(--destructive)"
    }
  }, "(cancela)")), /*#__PURE__*/React.createElement("td", {
    style: td
  }, row.end ?? "—"), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      textAlign: "right"
    }
  }, row.words.toLocaleString("es-ES")), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      textAlign: "right"
    }
  }, euros(row.cost / 100)), /*#__PURE__*/React.createElement("td", {
    style: td
  }, row.created)))))), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: "var(--space-4)",
      marginBottom: 0,
      fontSize: "var(--text-xs)",
      color: "var(--muted-foreground)"
    }
  }, "El coste de IA es el acumulado del mes en curso. Las suscripciones se gestionan en Stripe; aqu\xED solo se consultan."));
}
Object.assign(__ds_scope, { AdminBackoffice });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/AdminBackoffice.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/AppAccount.jsx
try { (() => {
function AppAccount({
  email = "hola@verbalyx.es",
  plan = "Gratis",
  onNavigate = () => {}
}) {
  const [confirming, setConfirming] = React.useState(false);
  const isPro = plan === "Pro";
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: "var(--width-narrow)",
      margin: "0 auto",
      padding: "var(--space-8) var(--gutter-page) var(--pad-page-y)"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: "var(--text-2xl)",
      fontWeight: "var(--font-semibold)"
    }
  }, "Mi cuenta"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-8)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Card, null, /*#__PURE__*/React.createElement(__ds_scope.CardHeader, null, /*#__PURE__*/React.createElement(__ds_scope.CardTitle, null, "Datos"), /*#__PURE__*/React.createElement(__ds_scope.CardDescription, null, email)), /*#__PURE__*/React.createElement(__ds_scope.CardContent, {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--muted-foreground)"
    }
  }, "Cuenta creada el 4/2/2026")), /*#__PURE__*/React.createElement(__ds_scope.Card, null, /*#__PURE__*/React.createElement(__ds_scope.CardHeader, null, /*#__PURE__*/React.createElement(__ds_scope.CardTitle, null, "Suscripci\xF3n"), /*#__PURE__*/React.createElement(__ds_scope.CardDescription, null, "Plan ", plan)), /*#__PURE__*/React.createElement(__ds_scope.CardContent, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      fontSize: "var(--text-sm)"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: "var(--muted-foreground)"
    }
  }, isPro ? "10.000 palabras por petición, sin límite diario." : "500 palabras al día."), isPro ? /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "outline"
  }, "Gestionar suscripci\xF3n y facturas") : /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    onClick: () => onNavigate("precios")
  }, "Probar Pro 3 d\xEDas")))), /*#__PURE__*/React.createElement(__ds_scope.Card, null, /*#__PURE__*/React.createElement(__ds_scope.CardHeader, null, /*#__PURE__*/React.createElement(__ds_scope.CardTitle, null, "Uso este mes")), /*#__PURE__*/React.createElement(__ds_scope.CardContent, {
    style: {
      fontSize: "var(--text-sm)"
    }
  }, /*#__PURE__*/React.createElement("dl", {
    style: {
      margin: 0,
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--space-4)"
    }
  }, [["Hoy", "148"], ["Este mes", "3.902"], ["Peticiones", "27"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k
  }, /*#__PURE__*/React.createElement("dt", {
    style: {
      color: "var(--muted-foreground)"
    }
  }, k), /*#__PURE__*/React.createElement("dd", {
    style: {
      margin: 0,
      fontSize: "var(--text-lg)",
      fontWeight: "var(--font-medium)"
    }
  }, v)))))), /*#__PURE__*/React.createElement(__ds_scope.Card, {
    style: {
      borderColor: "var(--danger-line)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.CardHeader, null, /*#__PURE__*/React.createElement(__ds_scope.CardTitle, null, "Eliminar mi cuenta y datos"), /*#__PURE__*/React.createElement(__ds_scope.CardDescription, null, "Borra tu cuenta, tu suscripci\xF3n y todos tus datos de forma permanente. No se puede deshacer.")), /*#__PURE__*/React.createElement(__ds_scope.CardContent, null, confirming ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)"
    }
  }, "\xBFSeguro? Se borrar\xE1n tu cuenta, tu historial y tu suscripci\xF3n."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "destructive"
  }, "S\xED, eliminar"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "outline",
    onClick: () => setConfirming(false)
  }, "Cancelar"))) : /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "outline",
    onClick: () => setConfirming(true)
  }, "Eliminar mi cuenta")))));
}
Object.assign(__ds_scope, { AppAccount });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/AppAccount.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/AppLogin.jsx
try { (() => {
function AppLogin({
  onSignedIn = () => {}
}) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState("idle");
  function submit(e) {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 900);
  }
  return /*#__PURE__*/React.createElement("main", {
    style: {
      display: "flex",
      minHeight: "100vh",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 var(--gutter-page)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Card, {
    style: {
      width: "100%",
      maxWidth: "var(--width-form)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.CardHeader, null, /*#__PURE__*/React.createElement(__ds_scope.CardTitle, null, "Inicia sesi\xF3n"), /*#__PURE__*/React.createElement(__ds_scope.CardDescription, null, "Con Google o con un enlace m\xE1gico a tu correo. Sin contrase\xF1as.")), /*#__PURE__*/React.createElement(__ds_scope.CardContent, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "outline",
    onClick: onSignedIn
  }, "Continuar con Google"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      fontSize: "var(--text-xs)",
      color: "var(--muted-foreground)"
    }
  }, "o"), status === "sent" ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)"
    }
  }, "Revisa tu correo: te hemos enviado un enlace para entrar."), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "outline",
    size: "sm",
    onClick: onSignedIn
  }, "(demo) Abrir el enlace")) : /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Input, {
    type: "email",
    required: true,
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "tu@correo.com"
  }), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    type: "submit",
    disabled: status === "sending" || !email
  }, status === "sending" ? "Enviando…" : "Enviarme el enlace")))));
}
Object.assign(__ds_scope, { AppLogin });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/AppLogin.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/AppShell.jsx
try { (() => {
function AppShell({
  tools = [],
  tool,
  onTool = () => {},
  page = "herramienta",
  plan = "Gratis",
  used = 235,
  total = 500,
  isAdmin = true,
  onNavigate = () => {},
  onSignOut = () => {},
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      borderBottom: "1px solid var(--border)",
      background: "var(--card)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "65rem",
      margin: "0 auto",
      padding: "0 var(--gutter-page)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      height: 56,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => onNavigate("herramienta"),
    style: {
      fontWeight: "var(--font-bold)",
      fontSize: "var(--text-base)",
      letterSpacing: "-0.02em",
      cursor: "pointer"
    }
  }, "Verbaly", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--brand)"
    }
  }, "x")), /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    variant: plan === "Pro" ? "brand" : "secondary"
  }, "Plan ", plan), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 200
    }
  }, plan === "Pro" ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--muted-foreground)",
      whiteSpace: "nowrap"
    }
  }, used.toLocaleString("es-ES"), " palabras hoy") : /*#__PURE__*/React.createElement(__ds_scope.QuotaBar, {
    used: used,
    total: total,
    plan: plan,
    showPlan: false
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)"
    }
  }, plan !== "Pro" && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    onClick: () => onNavigate("precios")
  }, "Probar Pro 3 d\xEDas"), /*#__PURE__*/React.createElement("a", {
    onClick: () => onNavigate("cuenta"),
    style: {
      fontSize: "var(--text-sm)",
      color: page === "cuenta" ? "var(--foreground)" : "var(--muted-foreground)",
      cursor: "pointer"
    }
  }, "Mi cuenta"), isAdmin && /*#__PURE__*/React.createElement("a", {
    href: "../admin/index.html",
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--muted-foreground)"
    }
  }, "Admin"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "outline",
    size: "sm",
    onClick: onSignOut
  }, "Salir"))), /*#__PURE__*/React.createElement(__ds_scope.ToolTabs, {
    items: tools.map(t => ({
      id: t.id,
      label: t.label,
      hint: t.hint,
      disabled: !t.live
    })),
    value: tool,
    onChange: id => {
      onTool(id);
      onNavigate("herramienta");
    }
  }))), children);
}
Object.assign(__ds_scope, { AppShell });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/AppToolPage.jsx
try { (() => {
function AppToolPage({
  tool = {
    id: "humanize",
    label: "Humanizador",
    modes: []
  },
  plan = "Gratis",
  remaining = 265,
  onNavigate = () => {}
}) {
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: "65rem",
      margin: "0 auto",
      padding: "var(--space-8) var(--gutter-page) var(--pad-page-y)"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: "var(--text-2xl)",
      fontWeight: "var(--font-semibold)",
      letterSpacing: "-0.01em"
    }
  }, tool.label), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-2) 0 var(--space-6)",
      fontSize: "var(--text-sm)",
      color: "var(--muted-foreground)"
    }
  }, "Elige el registro, pega tu texto y pulsa ", tool.label, ". El resultado se escribe en directo y te marcamos qu\xE9 hemos cambiado."), /*#__PURE__*/React.createElement(__ds_scope.ToolEditor, {
    name: tool.label,
    modes: tool.modes,
    wordsRemaining: remaining,
    initialText: "Es importante destacar que la implementaci\xF3n de estas metodolog\xEDas resulta fundamental para optimizar los resultados obtenidos. En resumen, dichos procesos permiten alcanzar objetivos de manera eficiente y efectiva.",
    footer: "No guardamos tu texto en el plan Gratis."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-6)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-xl)",
      background: "var(--card)",
      boxShadow: "var(--shadow-sm)",
      padding: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.EvidenceBand, {
    band: "none",
    findings: [{
      label: "Longitud de frase variable, como en la escritura humana",
      tone: "good"
    }, {
      label: "Conectores sin repetición mecánica",
      tone: "good"
    }, {
      label: "Dos párrafos mantienen un ritmo algo uniforme",
      tone: "warn"
    }]
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "outline",
    size: "sm",
    style: {
      marginLeft: "auto",
      flex: "none"
    }
  }, "Ver detalle"))), plan !== "Pro" && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.UpsellBanner, {
    title: `Te quedan ${remaining} palabras hoy.`,
    action: /*#__PURE__*/React.createElement(__ds_scope.Button, {
      size: "sm",
      onClick: () => onNavigate("precios")
    }, "Probar Pro 3 d\xEDas")
  }, "Pro sube el l\xEDmite a 10.000 por petici\xF3n, quita el l\xEDmite diario y guarda tu historial. Cancela antes y no pagas nada.")));
}
Object.assign(__ds_scope, { AppToolPage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/AppToolPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auth/AuthPage.jsx
try { (() => {
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
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 48 48",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    fill: "#EA4335",
    d: "M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#4285F4",
    d: "M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#FBBC05",
    d: "M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#34A853",
    d: "M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
  }));
}
const PLAN_COPY = {
  "unlimited-monthly": {
    name: "Ilimitado",
    cycle: "mensual",
    rows: [["Prueba", "3 días gratis"], ["Hoy pagas", "0,00 US$", true], ["Primer cobro", "26 sept. 2026"], ["Después", "29,99 US$/mes"]],
    note: "Hoy no se te cobra nada. El 26 de septiembre de 2026 se te cobrarán 29,99 US$/mes salvo que canceles antes, en dos clics desde tu cuenta.",
    mini: ["Ilimitado · mensual", "0,00 US$ hoy", "Primer cobro el 26 de septiembre de 2026: 29,99 US$/mes."]
  },
  "unlimited-yearly": {
    name: "Ilimitado",
    cycle: "anual",
    rows: [["Hoy pagas", "179,88 US$", true], ["Equivale a", "14,99 US$/mes"], ["Renovación", "23 sept. 2027"]],
    note: "El plan anual no lleva prueba gratuita: se cobra entero al confirmar el pago, en el paso siguiente.",
    mini: ["Ilimitado · anual", "179,88 US$ hoy", "Sin prueba gratuita. Renovación el 23 de septiembre de 2027."]
  },
  "pro-yearly": {
    name: "Pro",
    cycle: "anual",
    rows: [["Hoy pagas", "89,88 US$", true], ["Equivale a", "7,49 US$/mes"], ["Renovación", "23 sept. 2027"]],
    note: "Se cobra al confirmar el pago, en el paso siguiente. Nada se cobra al crear la cuenta.",
    mini: ["Pro · anual", "89,88 US$ hoy", "Se cobra en el paso siguiente. Renovación el 23 de septiembre de 2027."]
  },
  "pro-monthly": {
    name: "Pro",
    cycle: "mensual",
    rows: [["Hoy pagas", "14,99 US$", true], ["Renovación", "23 oct. 2026"], ["Después", "14,99 US$/mes"]],
    note: "Se cobra al confirmar el pago, en el paso siguiente. Nada se cobra al crear la cuenta.",
    mini: ["Pro · mensual", "14,99 US$ hoy", "Se cobra en el paso siguiente. Después, 14,99 US$ cada mes."]
  }
};
function AuthPage({
  mode = "registro",
  keptText = true,
  plan = null,
  initialSent = false,
  initialEmail = "",
  onSwitch = () => {},
  onDone = () => {},
  onChangePlan = () => {}
}) {
  const [email, setEmail] = React.useState(initialEmail);
  const [sent, setSent] = React.useState(initialSent);
  const signup = mode === "registro";
  const p = plan ? PLAN_COPY[plan] : null;
  const title = p ? "Primero, tu cuenta. Después, el pago." : signup ? "Crea tu cuenta gratis: 500 palabras al día" : "Vuelve a tu cuenta";
  const lede = p ? "Sin contraseña. En tu cuenta vive la suscripción, y desde ella la cancelas cuando quieras." : signup ? "Sin contraseña y sin tarjeta. Entras con Google o con un enlace a tu correo." : "Entra con Google o pídenos un enlace de acceso. Nunca hubo contraseña que recordar.";
  return /*#__PURE__*/React.createElement("div", {
    className: "vbx-auth"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-auth-top"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--font-bold)",
      fontSize: "var(--text-base)",
      letterSpacing: "-0.02em"
    }
  }, "Verbaly", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--brand)"
    }
  }, "x")), p && /*#__PURE__*/React.createElement("div", {
    className: "vbx-auth-steps",
    "aria-label": "Paso 1 de 2"
  }, /*#__PURE__*/React.createElement("div", {
    "data-on": "true",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("b", null, "1"), /*#__PURE__*/React.createElement("span", null, "Cuenta")), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("b", null, "2"), /*#__PURE__*/React.createElement("span", null, "Pago")))), /*#__PURE__*/React.createElement("div", {
    className: "vbx-auth-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-auth-grid",
    "data-plan": !!p
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-auth-card"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, title), /*#__PURE__*/React.createElement("p", {
    className: "lede"
  }, lede)), p && /*#__PURE__*/React.createElement("div", {
    className: "vbx-plan-mini"
  }, /*#__PURE__*/React.createElement("b", null, p.mini[0]), /*#__PURE__*/React.createElement("span", null, p.mini[1]), /*#__PURE__*/React.createElement("p", null, p.mini[2], " ", /*#__PURE__*/React.createElement("a", {
    onClick: onChangePlan
  }, "Cambiar"))), signup && !p && /*#__PURE__*/React.createElement("ul", {
    className: "vbx-auth-gain"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("span", null, "De 300 a ", /*#__PURE__*/React.createElement("b", {
    style: {
      fontWeight: 600
    }
  }, "500 palabras al d\xEDa"), ", desde hoy.")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("span", null, "Humanizador y detector, sin coste."))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "vbx-gbtn",
    onClick: onDone
  }, /*#__PURE__*/React.createElement(GoogleG, null), "Continuar con Google"), /*#__PURE__*/React.createElement("div", {
    className: "vbx-auth-or"
  }, "o con tu correo"), sent ? /*#__PURE__*/React.createElement("div", {
    className: "vbx-auth-sent",
    role: "status"
  }, /*#__PURE__*/React.createElement("p", null, "Te hemos enviado un enlace a ", /*#__PURE__*/React.createElement("b", null, email || "tu@correo.com"), ". \xC1brelo desde este mismo dispositivo y vuelves justo donde estabas", p ? ", con tu plan elegido" : "", "."), /*#__PURE__*/React.createElement("p", null, "\xBFNo llega en un minuto? Mira en spam o ", /*#__PURE__*/React.createElement("a", {
    onClick: () => setSent(false)
  }, "usa otra direcci\xF3n"), ".")) : /*#__PURE__*/React.createElement("form", {
    className: "vbx-auth-form",
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Input, {
    type: "email",
    required: true,
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "tu@correo.com",
    "aria-label": "Correo electr\xF3nico",
    autoComplete: "email"
  }), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    type: "submit",
    variant: "outline",
    disabled: !email
  }, "Enviarme un enlace de acceso")), keptText && !p && /*#__PURE__*/React.createElement("p", {
    className: "vbx-auth-p"
  }, "Tu texto sigue en el editor. Al volver lo encuentras tal cual."), signup && !p && /*#__PURE__*/React.createElement("p", {
    className: "vbx-auth-p"
  }, "En el plan gratuito no guardamos tus textos: solo el recuento de palabras para aplicar los l\xEDmites."), /*#__PURE__*/React.createElement("p", {
    className: "vbx-auth-p"
  }, signup ? "¿Ya tienes cuenta? " : "¿Aún no tienes cuenta? ", /*#__PURE__*/React.createElement("a", {
    onClick: onSwitch
  }, signup ? "Iniciar sesión" : "Crear cuenta gratis")), signup && /*#__PURE__*/React.createElement("p", {
    className: "vbx-auth-p vbx-auth-legal"
  }, "Al crear la cuenta aceptas los ", /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "t\xE9rminos del servicio"), " y la", " ", /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "pol\xEDtica de privacidad"), ".")), p && /*#__PURE__*/React.createElement("aside", {
    className: "vbx-plan",
    "aria-label": "Plan elegido"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "vbx-plan-k"
  }, "Tu elecci\xF3n"), /*#__PURE__*/React.createElement("p", {
    className: "vbx-plan-name"
  }, p.name, " ", /*#__PURE__*/React.createElement("span", null, "\xB7 ", p.cycle))), /*#__PURE__*/React.createElement("dl", null, p.rows.map(([k, v, key]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    "data-key": !!key
  }, /*#__PURE__*/React.createElement("dt", null, k), /*#__PURE__*/React.createElement("dd", null, v)))), /*#__PURE__*/React.createElement("p", {
    className: "vbx-plan-note"
  }, p.note), /*#__PURE__*/React.createElement("p", {
    className: "vbx-plan-change"
  }, /*#__PURE__*/React.createElement("a", {
    onClick: onChangePlan
  }, "Cambiar de plan"))))));
}
Object.assign(__ds_scope, { AuthPage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auth/AuthPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/checkout/CheckoutSummary.jsx
try { (() => {
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
function CheckoutSummary({
  plan = "unlimited",
  initialCycle = "monthly",
  onBack = () => {},
  onPaid = () => {}
}) {
  const [cycle, setCycle] = React.useState(initialCycle);
  const [status, setStatus] = React.useState("idle");
  const [howTo, setHowTo] = React.useState(false);
  const cfg = __ds_scope.CYCLES[plan];
  const opt = cfg.options.find(o => o.id === cycle) || cfg.options[0];
  function pay() {
    setStatus("processing");
    setTimeout(() => {
      setStatus("idle");
      onPaid();
    }, 1500);
  }
  return /*#__PURE__*/React.createElement("main", {
    className: "vbx-co"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-co-top"
  }, /*#__PURE__*/React.createElement("a", {
    onClick: onBack
  }, "\u2190 Precios")), /*#__PURE__*/React.createElement("h1", null, "Completa tu suscripci\xF3n"), /*#__PURE__*/React.createElement("p", {
    className: "vbx-co-lede"
  }, "Se paga aqu\xED mismo. No te mandamos a ninguna otra p\xE1gina."), /*#__PURE__*/React.createElement("div", {
    className: "vbx-co-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-co-panel"
  }, /*#__PURE__*/React.createElement(__ds_scope.OrderSummary, {
    plan: plan,
    cycle: cycle,
    onCycle: setCycle
  }), /*#__PURE__*/React.createElement("div", {
    className: "vbx-co-cancel"
  }, /*#__PURE__*/React.createElement("button", {
    className: "vbx-co-cancel-link",
    onClick: () => setHowTo(!howTo)
  }, "\xBFC\xF3mo cancelo?"), howTo && /*#__PURE__*/React.createElement("div", {
    className: "vbx-co-pop"
  }, /*#__PURE__*/React.createElement("h3", null, "Dos pasos, sin escribirnos"), /*#__PURE__*/React.createElement("ol", null, /*#__PURE__*/React.createElement("li", null, "Entra en Mi cuenta \u2192 Suscripci\xF3n."), /*#__PURE__*/React.createElement("li", null, "Pulsa \xABCancelar suscripci\xF3n\xBB y confirma."))))), /*#__PURE__*/React.createElement("div", {
    className: "vbx-co-panel"
  }, /*#__PURE__*/React.createElement(__ds_scope.PaymentForm, {
    amountToday: opt.today,
    payLabel: opt.trial ? "Empezar la prueba" : "Pagar",
    trial: opt.trial,
    chargeDate: opt.date,
    nextAmount: opt.next,
    email: "hola@verbalyx.ai",
    status: status,
    onPay: pay
  }))));
}
Object.assign(__ds_scope, { CheckoutSummary });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/checkout/CheckoutSummary.jsx", error: String((e && e.message) || e) }); }

// ui_kits/checkout/PurchaseConfirmation.jsx
try { (() => {
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
function PurchaseConfirmation({
  plan = "Ilimitado",
  trial = true,
  chargeDate = "21 de septiembre de 2026",
  amount = "29,99 US$",
  email = "hola@verbalyx.ai",
  onOpenApp = () => {},
  onManage = () => {}
}) {
  return /*#__PURE__*/React.createElement("main", {
    className: "vbx-cf"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    variant: "success",
    dot: true
  }, trial ? "Prueba activa" : "Suscripción activa"), /*#__PURE__*/React.createElement("h1", null, trial ? "Tu prueba de Ilimitado empieza ahora" : `Ya estás en ${plan}`), /*#__PURE__*/React.createElement("p", {
    className: "vbx-cf-lede"
  }, trial ? "Tienes 3 días con todo desbloqueado. No se te ha cobrado nada todavía." : "El pago se ha completado y tu plan ya está activo.")), /*#__PURE__*/React.createElement("div", {
    className: "vbx-cf-date"
  }, /*#__PURE__*/React.createElement("span", null, trial ? "Primer cobro" : "Próxima renovación"), /*#__PURE__*/React.createElement("b", null, chargeDate), /*#__PURE__*/React.createElement("em", null, amount, trial ? "/mes, salvo que canceles antes" : ", renovación automática")), /*#__PURE__*/React.createElement("div", {
    className: "vbx-cf-rows"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-cf-row"
  }, /*#__PURE__*/React.createElement("span", null, "Plan"), /*#__PURE__*/React.createElement("span", null, "Verbalyx ", plan)), /*#__PURE__*/React.createElement("div", {
    className: "vbx-cf-row"
  }, /*#__PURE__*/React.createElement("span", null, "Hoy has pagado"), /*#__PURE__*/React.createElement("span", null, trial ? "0,00 US$" : amount)), /*#__PURE__*/React.createElement("div", {
    className: "vbx-cf-row"
  }, /*#__PURE__*/React.createElement("span", null, "Confirmaci\xF3n enviada a"), /*#__PURE__*/React.createElement("span", null, email))), /*#__PURE__*/React.createElement("div", {
    className: "vbx-cf-actions"
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "lg",
    onClick: onOpenApp
  }, "Ir a la app"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "outline",
    onClick: onManage
  }, "Gestionar suscripci\xF3n")), /*#__PURE__*/React.createElement("p", {
    className: "vbx-cf-note"
  }, "Te hemos enviado un correo con la fecha y el importe exactos. ", trial && "El día antes del cobro te avisamos otra vez. ", "Puedes cancelar en dos clics desde tu cuenta, sin llamadas ni correos."));
}
Object.assign(__ds_scope, { PurchaseConfirmation });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/checkout/PurchaseConfirmation.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/DetectorLanding.jsx
try { (() => {
function DetectorLanding({
  onNavigate = () => {}
}) {
  const [text, setText] = React.useState("Es importante destacar que la implementación de estas metodologías resulta fundamental para optimizar los resultados obtenidos.");
  const [result, setResult] = React.useState(false);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: "65rem",
      margin: "0 auto",
      padding: "var(--pad-page-y) var(--gutter-page)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    variant: "secondary"
  }, "Muy pronto"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "var(--space-4) 0 0",
      fontSize: "var(--text-4xl)",
      fontWeight: "var(--font-bold)",
      letterSpacing: "var(--tracking-tight)"
    }
  }, "Detector de IA en espa\xF1ol"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-3) 0 0",
      maxWidth: "42rem",
      fontSize: "var(--text-lg)",
      color: "var(--muted-foreground)"
    }
  }, "Te decimos en qu\xE9 nos basamos, pasaje a pasaje. Sin porcentajes: una cifra dar\xEDa una precisi\xF3n que ninguna herramienta tiene."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-8)",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "var(--space-4)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Textarea, {
    value: text,
    onChange: e => setText(e.target.value),
    style: {
      minHeight: "var(--min-editor)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    onClick: () => setResult(true),
    disabled: words === 0
  }, "Analizar"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--muted-foreground)"
    }
  }, words, " palabras \xB7 m\xEDnimo 200 y 8 frases"))), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-xl)",
      padding: "var(--space-5)",
      background: "var(--card)",
      boxShadow: "var(--shadow-sm)"
    }
  }, !result ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)",
      color: "var(--muted-foreground)"
    }
  }, "El an\xE1lisis aparecer\xE1 aqu\xED.") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.EvidenceBand, {
    band: "clear",
    findings: [{
      label: "Frases de longitud casi idéntica en todo el texto",
      tone: "bad"
    }, {
      label: "Conectores de relleno repetidos («es importante destacar», «en resumen»)",
      tone: "bad"
    }, {
      label: "Terminología técnica coherente y bien empleada",
      tone: "good"
    }]
  }), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "soft",
    size: "sm",
    onClick: () => onNavigate("humanizador")
  }, "Humanizar este texto \u2192")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.UpsellBanner, {
    title: "El detector entra en el plan Pro cuando salga.",
    action: /*#__PURE__*/React.createElement(__ds_scope.Button, {
      size: "sm",
      onClick: () => onNavigate("precios")
    }, "Ver precios")
  }, "Mientras tanto, el humanizador ya funciona gratis y sin registro.")));
}
Object.assign(__ds_scope, { DetectorLanding });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/DetectorLanding.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/HumanizerLanding.jsx
try { (() => {
const FAQ = [{
  q: "¿Qué hace un humanizador de texto IA?",
  a: "Reescribe un texto generado por inteligencia artificial para que suene natural y humano: varía la estructura de las frases, elimina las muletillas típicas de la IA y ajusta el tono, sin cambiar el significado ni los datos."
}, {
  q: "¿Es gratis?",
  a: "Sí. Puedes humanizar hasta 300 palabras al día sin registrarte, y 500 al día con una cuenta gratuita. El plan Pro amplía el límite a 10.000 palabras por petición."
}, {
  q: "¿Funciona con textos académicos?",
  a: "Sí. El registro «académico» mantiene el tono formal, los conectores propios de trabajos universitarios y la terminología técnica, cuidando las normas del español."
}, {
  q: "¿El texto humanizado pasa los detectores de IA?",
  a: "El objetivo es que el texto suene natural y humano. Ningún servicio puede garantizar un resultado concreto frente a detectores de terceros, cuyos resultados son orientativos y cambian con frecuencia."
}, {
  q: "¿Guardáis mis textos?",
  a: "No. Los textos de usuarios anónimos y gratuitos no se almacenan: solo registramos métricas de uso. El historial es una función opcional del plan Pro."
}];
const h2 = {
  margin: 0,
  fontSize: "var(--text-2xl)",
  fontWeight: "var(--font-semibold)"
};
const p = {
  marginTop: "var(--space-3)",
  marginBottom: 0,
  color: "var(--muted-foreground)"
};
function HumanizerLanding({
  onNavigate = () => {}
}) {
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: "65rem",
      margin: "0 auto",
      padding: "var(--pad-page-y) var(--gutter-page)"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: "var(--text-4xl)",
      fontWeight: "var(--font-bold)",
      letterSpacing: "var(--tracking-tight)"
    }
  }, "Humanizador de texto IA en espa\xF1ol"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: "var(--space-3)",
      marginBottom: 0,
      maxWidth: "42rem",
      fontSize: "var(--text-lg)",
      color: "var(--muted-foreground)"
    }
  }, "Pega un texto generado por ChatGPT u otra IA y convi\xE9rtelo en un texto natural, fluido y con tu registro: acad\xE9mico, neutro o informal. Gratis y sin registro."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.ToolEditor, {
    name: "Humanizador",
    wordsRemaining: 300,
    initialText: "Es importante destacar que la implementaci\xF3n de estas metodolog\xEDas resulta fundamental para optimizar los resultados obtenidos.",
    footer: "Sin registro. No guardamos tu texto."
  })), /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: "var(--space-16)"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: h2
  }, "C\xF3mo humanizar un texto de IA (bien)"), /*#__PURE__*/React.createElement("p", {
    style: p
  }, "Los textos generados por IA se reconocen por sus tics: frases de longitud uniforme, conectores repetidos (\xABen resumen\xBB, \xABes importante destacar\xBB), un tono impersonal y p\xE1rrafos que dicen mucho sin decir nada. Humanizar un texto no es cambiar palabras por sin\xF3nimos: es reescribirlo como lo har\xEDa una persona, conservando el significado, los datos y la terminolog\xEDa."), /*#__PURE__*/React.createElement("p", {
    style: p
  }, "Nuestro humanizador est\xE1 construido espec\xEDficamente para el espa\xF1ol \u2014 de Espa\xF1a y de LATAM \u2014 y no es una traducci\xF3n de una herramienta en ingl\xE9s. Respeta las normas de la RAE en el registro acad\xE9mico, var\xEDa la estructura sint\xE1ctica de forma natural y nunca a\xF1ade informaci\xF3n que no estaba en el original."), /*#__PURE__*/React.createElement("h2", {
    style: {
      ...h2,
      marginTop: "var(--space-8)"
    }
  }, "Tres registros, un mismo significado"), /*#__PURE__*/React.createElement("p", {
    style: p
  }, "El registro \xABacad\xE9mico\xBB mantiene la formalidad y los conectores propios de la escritura universitaria. El \xABneutro\xBB produce un espa\xF1ol claro y directo, v\xE1lido a ambos lados del Atl\xE1ntico. El \xABinformal\xBB acerca el tono a una conversaci\xF3n, ideal para redes sociales o newsletters.")), /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: "var(--space-16)"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: h2
  }, "Preguntas frecuentes"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-6)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, FAQ.map(({
    q,
    a
  }) => /*#__PURE__*/React.createElement("div", {
    key: q
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: "var(--text-base)",
      fontWeight: "var(--font-medium)"
    }
  }, q), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-1) 0 0",
      fontSize: "var(--text-sm)",
      color: "var(--muted-foreground)"
    }
  }, a))))), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: "var(--space-16)",
      marginBottom: 0,
      fontSize: "var(--text-sm)",
      color: "var(--muted-foreground)"
    }
  }, "\xBFNecesitas m\xE1s palabras o el registro acad\xE9mico a diario?", " ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate("precios");
    },
    style: {
      textDecoration: "underline",
      color: "inherit"
    }
  }, "Consulta el plan Pro"), "."));
}
Object.assign(__ds_scope, { HumanizerLanding });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/HumanizerLanding.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/MarketingFooter.jsx
try { (() => {
const GROUPS = [{
  title: "Herramientas",
  links: ["Humanizador de texto IA", "Detector de IA", "Parafraseador", "Corrector ortográfico"]
}, {
  title: "Para quién",
  links: ["Trabajos universitarios (TFG, TFM)", "Oposiciones", "Blog y SEO", "Marketing de contenidos"]
}, {
  title: "Producto",
  links: ["Precios", "Plan Pro", "Ayuda"]
}, {
  title: "Legal",
  links: ["Aviso legal", "Términos", "Privacidad", "Cookies"]
}];
function MarketingFooter({
  onNavigate = () => {}
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      marginTop: "var(--space-16)",
      borderTop: "1px solid var(--border)",
      background: "var(--muted)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "65rem",
      margin: "0 auto",
      padding: "var(--space-10) var(--gutter-page)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "var(--space-8)"
    }
  }, GROUPS.map(group => /*#__PURE__*/React.createElement("div", {
    key: group.title
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-xs)",
      fontWeight: 600,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "var(--muted-foreground)"
    }
  }, group.title), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-3)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)"
    }
  }, group.links.map(link => /*#__PURE__*/React.createElement("a", {
    key: link,
    onClick: () => link === "Precios" && onNavigate("precios"),
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--muted-foreground)",
      cursor: "pointer"
    }
  }, link)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-10)",
      paddingTop: "var(--space-6)",
      borderTop: "1px solid var(--border)",
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-4)",
      fontSize: "var(--text-xs)",
      color: "var(--muted-foreground)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Verbalyx"), /*#__PURE__*/React.createElement("span", null, "Espa\xF1ol de Espa\xF1a y LATAM"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto"
    }
  }, "No guardamos los textos de los planes gratuitos."))));
}
Object.assign(__ds_scope, { MarketingFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/MarketingFooter.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/MarketingHome.jsx
try { (() => {
const AUDIENCES = [{
  title: "Estudiantes",
  body: "TFG, TFM y trabajos de clase con el registro académico y las normas de la RAE."
}, {
  title: "Oposiciones",
  body: "Temarios y supuestos prácticos en un español formal y legible."
}, {
  title: "Blog y SEO",
  body: "Textos que no suenan a plantilla, sin perder las palabras clave."
}, {
  title: "Marketing",
  body: "Newsletters y redes con el tono informal, listos para publicar."
}];
const CLAIMS = [{
  title: "Español nativo, no traducido",
  body: "El registro académico respeta las normas de la RAE; el neutro funciona a los dos lados del Atlántico."
}, {
  title: "Sin promesas falsas",
  body: "Ningún servicio puede garantizar un resultado frente a detectores de terceros. Te decimos qué hace la herramienta y qué no."
}, {
  title: "Tus textos no se guardan",
  body: "En los planes gratuitos solo registramos métricas de uso. El historial es opcional y solo en Pro."
}];
function MarketingHome({
  tools = [],
  tool = "humanize",
  onTool = () => {},
  onNavigate = () => {}
}) {
  const current = tools.find(t => t.id === tool) || tools[0] || {
    label: "Humanizador",
    modes: []
  };
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: "65rem",
      margin: "0 auto",
      padding: "0 var(--gutter-page)"
    }
  }, /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "var(--space-16) 0 var(--space-8)",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    variant: "brand",
    pill: true,
    dot: true
  }, "Sin registro \xB7 300 palabras al d\xEDa"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "var(--space-5) 0 0",
      fontSize: "3.25rem",
      lineHeight: 1.04,
      fontWeight: "var(--font-bold)",
      letterSpacing: "-0.03em"
    }
  }, "Que tu texto suene", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--brand)"
    }
  }, "a persona"), ", en espa\xF1ol"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-4) auto 0",
      maxWidth: "39rem",
      fontSize: "var(--text-lg)",
      color: "var(--muted-foreground)"
    }
  }, "Pega lo que te ha dado la IA y recup\xE9ralo con tu voz. Hecho para el espa\xF1ol de Espa\xF1a y LATAM, no traducido de una herramienta inglesa.")), /*#__PURE__*/React.createElement(__ds_scope.ToolEditor, {
    name: current.label,
    modes: current.modes,
    wordsRemaining: 266,
    initialText: "Es importante destacar que la implementaci\xF3n de estas metodolog\xEDas resulta fundamental para optimizar los resultados obtenidos. En resumen, dichos procesos permiten alcanzar objetivos de manera eficiente y efectiva.",
    footer: "Sin registro. No guardamos tu texto."
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: "var(--space-16)"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: "var(--text-2xl)",
      fontWeight: "var(--font-semibold)",
      letterSpacing: "-0.01em"
    }
  }, "Las cuatro herramientas"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-2) 0 0",
      color: "var(--muted-foreground)"
    }
  }, "Empieza por el humanizador. El resto llega muy pronto y entran en el mismo plan."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-6)",
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "var(--space-4)"
    }
  }, tools.map(t => /*#__PURE__*/React.createElement(__ds_scope.Card, {
    key: t.id,
    interactive: t.live,
    onClick: t.live ? () => onTool(t.id) : undefined
  }, /*#__PURE__*/React.createElement(__ds_scope.CardHeader, null, /*#__PURE__*/React.createElement(__ds_scope.CardTitle, {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)"
    }
  }, t.label, !t.live && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    variant: "secondary"
  }, "Muy pronto")), /*#__PURE__*/React.createElement(__ds_scope.CardDescription, null, t.live ? "Pruébalo gratis →" : t.hint)))))), /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: "var(--space-16)",
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "var(--space-4)"
    }
  }, CLAIMS.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.title,
    style: {
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-xl)",
      padding: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: "var(--text-base)",
      fontWeight: "var(--font-semibold)"
    }
  }, c.title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-2) 0 0",
      fontSize: "var(--text-sm)",
      color: "var(--muted-foreground)",
      lineHeight: "var(--leading-normal)"
    }
  }, c.body)))), /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: "var(--space-16)"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: "var(--text-2xl)",
      fontWeight: "var(--font-semibold)",
      letterSpacing: "-0.01em"
    }
  }, "\xBFPara qu\xE9 se usa?"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-6)",
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "var(--space-4)"
    }
  }, AUDIENCES.map(a => /*#__PURE__*/React.createElement("div", {
    key: a.title
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)",
      fontWeight: "var(--font-semibold)",
      color: "var(--brand)"
    }
  }, a.title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-2) 0 0",
      fontSize: "var(--text-sm)",
      color: "var(--muted-foreground)",
      lineHeight: "var(--leading-normal)"
    }
  }, a.body))))), /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: "var(--space-16)",
      border: "1px solid var(--brand-line)",
      background: "var(--brand-soft)",
      borderRadius: "var(--radius-xl)",
      padding: "var(--space-8)",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: "var(--text-2xl)",
      fontWeight: "var(--font-semibold)",
      color: "var(--brand-ink)"
    }
  }, "Empieza sin registrarte"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-2) auto 0",
      maxWidth: "34rem",
      fontSize: "var(--text-sm)",
      color: "var(--brand-ink)"
    }
  }, "300 palabras al d\xEDa sin cuenta, 500 con cuenta gratis. Pro quita el l\xEDmite diario y sube a 10.000 palabras por petici\xF3n."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-5)",
      display: "flex",
      gap: "var(--space-3)",
      justifyContent: "center",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "lg",
    onClick: () => onNavigate("login")
  }, "Crear cuenta gratis"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "lg",
    variant: "outline",
    onClick: () => onNavigate("precios")
  }, "Ver precios"))));
}
Object.assign(__ds_scope, { MarketingHome });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/MarketingHome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/PricingPage.jsx
try { (() => {
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
const ROWS = [["Palabras al día", "500", "—", "—"], ["Palabras al mes", "—", "60.000", "500.000"], ["Palabras por petición", "300", "3000", "8000"], ["Herramientas", "Humanizador y detector", "Las cuatro", "Las cuatro"], ["Historial cifrado", false, true, true], ["Desglose por pasajes", false, true, true], ["Prioridad de cola", false, false, true], ["Recarga de palabras", "Requiere un plan de pago", "9,99 US$ por 25.000, sin caducidad", "9,99 US$ por 25.000, sin caducidad"]];
const FAQ = [["¿Cuándo se me cobra?", "En Pro y en Ilimitado anual, hoy mismo al completar el pago. En la prueba de Ilimitado, al cuarto día: los tres primeros no se cobra nada y verás la fecha exacta antes de dar la tarjeta."], ["¿Cómo cancelo?", "Desde tu cuenta, en dos clics, cuando quieras. No hay que llamar ni escribir un correo. Si cancelas durante la prueba, no se cobra nada."], ["¿Qué pasa cuando termina la prueba?", "El día 3, al entrar, te preguntamos qué quieres hacer: seguir en Ilimitado, bajar a Pro con prorrateo o cancelar. Si no haces nada, se renueva en Ilimitado."], ["¿Las palabras caducan?", "Las del plan se reinician cada mes. Las de una recarga no caducan mientras tengas una suscripción activa."], ["¿Los precios llevan impuestos?", "Sí. El precio que ves es el que se cobra: el impuesto sobre ventas de EE. UU. o el IVA de tu país, cuando corresponda, ya está incluido. No hay sorpresas en el último paso."], ["¿Hacéis reembolsos?", "Si algo ha ido mal, escríbenos y lo miramos caso por caso. La prueba de 3 días existe precisamente para que no tengas que pedir uno."]];
function PricingPage({
  initialCycle = "yearly",
  session = "anon",
  wordsProcessed = null,
  since = "marzo de 2026",
  trialEndsOn = "26 de septiembre de 2026",
  onNavigate = () => {}
}) {
  const [cycle, setCycle] = React.useState(initialCycle);
  const yearly = cycle === "yearly";
  const signedIn = session !== "anon";
  const plans = [{
    id: "free",
    name: "Gratis",
    price: "0 US$",
    total: null,
    billed: "Sin tarjeta. Para siempre.",
    features: ["500 palabras al día", "Hasta 300 por petición", "Humanizador y detector (banda y evidencia)"],
    cta: session === "free" ? {
      current: true
    } : session === "anon" ? {
      label: "Crear cuenta gratis",
      variant: "outline",
      to: "registro"
    } : null
  }, {
    id: "pro",
    name: "Pro",
    price: yearly ? "7,49 US$" : "14,99 US$",
    total: yearly ? "89,88 US$ al año" : null,
    billed: yearly ? "Se cobran 89,88 US$ hoy, una vez al año." : "Se cobran 14,99 US$ hoy y cada mes.",
    features: ["60.000 palabras al mes", "Hasta 3000 por petición", "Las cuatro herramientas", "Historial cifrado y desglose por pasajes"],
    cta: session === "pro" ? {
      current: true
    } : session === "unlimited" ? {
      label: "Cambiar a Pro",
      variant: "outline",
      to: "cuenta"
    } : {
      label: yearly ? "Elegir Pro anual" : "Elegir Pro mensual",
      variant: "outline",
      to: "checkout"
    }
  }, {
    id: "unlimited",
    name: "Ilimitado",
    featured: true,
    price: yearly ? "14,99 US$" : "29,99 US$",
    total: yearly ? "179,88 US$ al año" : null,
    billed: yearly ? "Se cobran 179,88 US$ hoy, una vez al año." : "3 días gratis. Después, 29,99 US$ al mes.",
    features: ["500.000 palabras al mes", "Hasta 8000 por petición", "Prioridad de cola", "Todo lo de Pro"],
    cta: session === "unlimited" ? {
      current: true
    } : session === "pro" ? {
      label: "Cambiar a Ilimitado",
      variant: "default",
      to: "cuenta"
    } : {
      label: yearly ? "Elegir Ilimitado anual" : "Probar 3 días gratis",
      variant: "default",
      to: "checkout"
    },
    disclosure: session === "pro" ? "El cambio se hace desde Mi cuenta. Antes de confirmar verás el importe exacto que se ajusta en tu próxima factura." : session === "unlimited" ? null : yearly ? "El plan anual se cobra hoy, entero: 179,88 US$. No lleva prueba gratuita — la prueba de 3 días solo existe en el ciclo mensual, para que nadie acabe con un cargo anual que no esperaba." : `Hoy no se te cobra nada. El ${trialEndsOn}, al terminar los 3 días de prueba, se te cobrarán 29,99 US$/mes salvo que canceles antes. Puedes cancelar o cambiar a Pro (14,99 US$/mes) en dos clics desde tu cuenta.`
  }];
  return /*#__PURE__*/React.createElement("main", {
    className: "vbx-pr"
  }, /*#__PURE__*/React.createElement("h1", null, "Precios"), /*#__PURE__*/React.createElement("p", {
    className: "vbx-pr-lede"
  }, session === "pro" || session === "unlimited" ? "Tu plan está marcado. Los cambios de plan se hacen desde Mi cuenta, con el importe a la vista antes de confirmar." : "Empieza gratis. Paga solo si necesitas más palabras o las cuatro herramientas."), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pr-cycle"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-pr-cycle-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-pr-toggle",
    role: "radiogroup",
    "aria-label": "Ciclo de facturaci\xF3n"
  }, /*#__PURE__*/React.createElement("button", {
    role: "radio",
    "aria-checked": yearly,
    onClick: () => setCycle("yearly")
  }, "Anual"), /*#__PURE__*/React.createElement("button", {
    role: "radio",
    "aria-checked": !yearly,
    onClick: () => setCycle("monthly")
  }, "Mensual")), yearly && /*#__PURE__*/React.createElement("span", {
    className: "vbx-pr-save"
  }, "Ahorra 50 % (seis meses gratis)")), session !== "pro" && session !== "unlimited" && /*#__PURE__*/React.createElement("p", {
    className: "vbx-pr-hint"
  }, yearly ? /*#__PURE__*/React.createElement(React.Fragment, null, "\xBFPrefieres probar antes? La prueba gratis de 3 d\xEDas est\xE1 en Ilimitado mensual.", " ", /*#__PURE__*/React.createElement("button", {
    onClick: () => setCycle("monthly")
  }, "Ver precios mensuales")) : /*#__PURE__*/React.createElement(React.Fragment, null, "Pagando al a\xF1o ahorras un 50 % (seis meses gratis), sin prueba gratuita.", " ", /*#__PURE__*/React.createElement("button", {
    onClick: () => setCycle("yearly")
  }, "Ver precios anuales")))), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pr-grid"
  }, plans.map(plan => /*#__PURE__*/React.createElement("section", {
    className: "vbx-pr-card",
    key: plan.id,
    "data-featured": !!plan.featured,
    "aria-label": `Plan ${plan.name}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-pr-head"
  }, /*#__PURE__*/React.createElement("h2", null, plan.name), plan.featured && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    variant: "brand"
  }, "M\xE1s popular")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "vbx-pr-price",
    "data-testid": "plan-price"
  }, /*#__PURE__*/React.createElement("b", null, plan.price), plan.id !== "free" && /*#__PURE__*/React.createElement("span", null, "/mes")), plan.id !== "free" && /*#__PURE__*/React.createElement("p", {
    className: "vbx-pr-total",
    "data-testid": "plan-total"
  }, plan.total || "\u00a0"), /*#__PURE__*/React.createElement("p", {
    className: "vbx-pr-billed"
  }, plan.billed)), /*#__PURE__*/React.createElement("ul", {
    className: "vbx-pr-feat"
  }, plan.features.map(f => /*#__PURE__*/React.createElement("li", {
    key: f
  }, /*#__PURE__*/React.createElement("i", null, "\xB7"), /*#__PURE__*/React.createElement("span", null, f)))), plan.cta && (plan.cta.current ? /*#__PURE__*/React.createElement("div", {
    className: "vbx-pr-current"
  }, "Tu plan actual") : /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: plan.cta.variant,
    size: "lg",
    style: {
      width: "100%"
    },
    onClick: () => onNavigate(plan.cta.to)
  }, plan.cta.label)), plan.disclosure && /*#__PURE__*/React.createElement("p", {
    className: "vbx-pr-disc",
    "data-testid": "trial-disclosure"
  }, plan.disclosure)))), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pr-bands"
  }, wordsProcessed && /*#__PURE__*/React.createElement("div", {
    className: "vbx-pr-band"
  }, /*#__PURE__*/React.createElement("b", null, wordsProcessed), /*#__PURE__*/React.createElement("span", null, "de palabras procesadas en Verbalyx desde ", since, ".")), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pr-band",
    "data-tone": "success",
    style: wordsProcessed ? null : {
      gridColumn: "1 / -1"
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Cancela online en dos clics"), ", cuando quieras: Mi cuenta \u2192 Suscripci\xF3n \u2192 Cancelar. Sin llamadas ni correos."))), /*#__PURE__*/React.createElement("section", {
    className: "vbx-pr-sec"
  }, /*#__PURE__*/React.createElement("h2", null, "Qu\xE9 incluye cada plan"), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pr-tablewrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "vbx-pr-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: -9999
    }
  }, "Caracter\xEDstica")), /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, "Gratis"), /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, "Pro"), /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, "Ilimitado"))), /*#__PURE__*/React.createElement("tbody", null, ROWS.map(row => /*#__PURE__*/React.createElement("tr", {
    key: row[0]
  }, /*#__PURE__*/React.createElement("th", {
    scope: "row"
  }, row[0]), row.slice(1).map((cell, i) => /*#__PURE__*/React.createElement("td", {
    key: i
  }, cell === true ? /*#__PURE__*/React.createElement("span", {
    className: "vbx-pr-yes"
  }, "S\xED") : cell === false ? /*#__PURE__*/React.createElement("span", {
    className: "vbx-pr-no"
  }, "No") : cell)))))))), /*#__PURE__*/React.createElement("section", {
    className: "vbx-pr-sec"
  }, /*#__PURE__*/React.createElement("h2", null, "Preguntas sobre la facturaci\xF3n"), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pr-faq"
  }, FAQ.map(([q, a]) => /*#__PURE__*/React.createElement("div", {
    key: q
  }, /*#__PURE__*/React.createElement("h3", null, q), /*#__PURE__*/React.createElement("p", null, a))))), /*#__PURE__*/React.createElement("div", {
    className: "vbx-pr-topup"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Recarga de palabras"), /*#__PURE__*/React.createElement("p", null, "9,99 US$ por 25.000 palabras adicionales. No caducan. Requiere una suscripci\xF3n activa.")), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "outline",
    onClick: () => onNavigate(signedIn ? "recarga" : "registro")
  }, "Comprar recarga")), /*#__PURE__*/React.createElement("p", {
    className: "vbx-pr-foot"
  }, "Precios en d\xF3lares estadounidenses, impuestos incluidos: el impuesto sobre ventas de EE. UU. o el IVA de tu pa\xEDs, cuando corresponda, ya est\xE1 dentro del precio que ves. La renovaci\xF3n es autom\xE1tica y puedes cancelar en l\xEDnea, en cualquier momento, desde tu cuenta. Consulta los ", /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "t\xE9rminos del servicio"), "."));
}
Object.assign(__ds_scope, { PricingPage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/PricingPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/SiteHeader.jsx
try { (() => {
const NAV = [{
  id: "precios",
  label: "Precios"
}, {
  id: "blog",
  label: "Blog"
}, {
  id: "ayuda",
  label: "Ayuda"
}];
function SiteHeader({
  tools = [],
  tool,
  onTool = () => {},
  page,
  onNavigate = () => {}
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 20,
      background: "color-mix(in oklab, var(--background) 90%, transparent)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "65rem",
      margin: "0 auto",
      padding: "0 var(--gutter-page)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-6)",
      height: 56
    }
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => onNavigate("home"),
    style: {
      fontWeight: "var(--font-bold)",
      fontSize: "var(--text-base)",
      letterSpacing: "-0.02em",
      cursor: "pointer"
    }
  }, "Verbaly", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--brand)"
    }
  }, "x")), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      gap: "var(--space-5)",
      color: "var(--muted-foreground)",
      fontSize: "var(--text-sm)"
    }
  }, NAV.map(item => /*#__PURE__*/React.createElement("a", {
    key: item.id,
    onClick: () => onNavigate(item.id),
    style: {
      cursor: "pointer",
      color: page === item.id ? "var(--foreground)" : "inherit",
      fontWeight: page === item.id ? 500 : 400
    }
  }, item.label))), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      display: "flex",
      gap: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "ghost",
    size: "sm",
    onClick: () => onNavigate("login")
  }, "Entrar"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    onClick: () => onNavigate("login")
  }, "Crear cuenta gratis"))), /*#__PURE__*/React.createElement(__ds_scope.ToolTabs, {
    items: tools.map(t => ({
      id: t.id,
      label: t.label,
      hint: t.hint,
      disabled: !t.live
    })),
    value: tool,
    onChange: onTool
  })));
}
Object.assign(__ds_scope, { SiteHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/SiteHeader.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tools.js
try { (() => {
// Mirrors lib/ai/tools.ts. Hints are marketing-side one-liners.
const TOOLS = [{
  id: "humanize",
  label: "Humanizador",
  hint: "Que suene a persona",
  path: "/humanizador-de-texto-ia",
  live: true,
  modes: ["academico", "neutro", "informal"]
}, {
  id: "detect",
  label: "Detector de IA",
  hint: "Mide antes de entregar",
  path: "/detector-de-ia",
  live: false,
  modes: []
}, {
  id: "paraphrase",
  label: "Parafraseador",
  hint: "Seis registros",
  path: "/parafrasear-texto",
  live: false,
  modes: ["estandar", "fluido", "formal", "simple", "creativo", "academico"]
}, {
  id: "correct",
  label: "Corrector",
  hint: "Ortografía y gramática",
  path: "/corrector-ortografico-gramatical",
  live: false,
  modes: ["general", "academico"]
}];
Object.assign(__ds_scope, { TOOLS });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tools.js", error: String((e && e.message) || e) }); }

__ds_ns.CheckoutModal = __ds_scope.CheckoutModal;

__ds_ns.CYCLES = __ds_scope.CYCLES;

__ds_ns.OrderSummary = __ds_scope.OrderSummary;

__ds_ns.PaymentForm = __ds_scope.PaymentForm;

__ds_ns.Paywall = __ds_scope.Paywall;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.QuotaBar = __ds_scope.QuotaBar;

__ds_ns.SignupInvite = __ds_scope.SignupInvite;

__ds_ns.UpsellBanner = __ds_scope.UpsellBanner;

__ds_ns.UsageMeter = __ds_scope.UsageMeter;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.ToolTabs = __ds_scope.ToolTabs;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CardHeader = __ds_scope.CardHeader;

__ds_ns.CardTitle = __ds_scope.CardTitle;

__ds_ns.CardDescription = __ds_scope.CardDescription;

__ds_ns.CardAction = __ds_scope.CardAction;

__ds_ns.CardContent = __ds_scope.CardContent;

__ds_ns.CardFooter = __ds_scope.CardFooter;

__ds_ns.EvidenceBand = __ds_scope.EvidenceBand;

__ds_ns.Highlight = __ds_scope.Highlight;

__ds_ns.HighlightLegend = __ds_scope.HighlightLegend;

__ds_ns.LimitNotice = __ds_scope.LimitNotice;

__ds_ns.RunCost = __ds_scope.RunCost;

__ds_ns.ToolEditor = __ds_scope.ToolEditor;

__ds_ns.AdminBackoffice = __ds_scope.AdminBackoffice;

__ds_ns.AppAccount = __ds_scope.AppAccount;

__ds_ns.AppLogin = __ds_scope.AppLogin;

__ds_ns.AppShell = __ds_scope.AppShell;

__ds_ns.AppToolPage = __ds_scope.AppToolPage;

__ds_ns.AuthPage = __ds_scope.AuthPage;

__ds_ns.CheckoutSummary = __ds_scope.CheckoutSummary;

__ds_ns.PurchaseConfirmation = __ds_scope.PurchaseConfirmation;

__ds_ns.DetectorLanding = __ds_scope.DetectorLanding;

__ds_ns.HumanizerLanding = __ds_scope.HumanizerLanding;

__ds_ns.MarketingFooter = __ds_scope.MarketingFooter;

__ds_ns.MarketingHome = __ds_scope.MarketingHome;

__ds_ns.PricingPage = __ds_scope.PricingPage;

__ds_ns.SiteHeader = __ds_scope.SiteHeader;

__ds_ns.TOOLS = __ds_scope.TOOLS;

})();
