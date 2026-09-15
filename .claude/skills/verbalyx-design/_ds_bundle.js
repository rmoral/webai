/* @ds-bundle: {"format":4,"namespace":"VerbalyxDesignSystem_caebf9","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"QuotaBar","sourcePath":"components/feedback/QuotaBar.jsx"},{"name":"UpsellBanner","sourcePath":"components/feedback/UpsellBanner.jsx"},{"name":"Chip","sourcePath":"components/forms/Chip.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"ToolTabs","sourcePath":"components/navigation/ToolTabs.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardHeader","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardTitle","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardDescription","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardAction","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardContent","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardFooter","sourcePath":"components/surfaces/Card.jsx"},{"name":"Highlight","sourcePath":"components/tools/Highlight.jsx"},{"name":"HighlightLegend","sourcePath":"components/tools/Highlight.jsx"},{"name":"ScoreGauge","sourcePath":"components/tools/ScoreGauge.jsx"},{"name":"ToolEditor","sourcePath":"components/tools/ToolEditor.jsx"},{"name":"AdminBackoffice","sourcePath":"ui_kits/admin/AdminBackoffice.jsx"},{"name":"AppAccount","sourcePath":"ui_kits/app/AppAccount.jsx"},{"name":"AppLogin","sourcePath":"ui_kits/app/AppLogin.jsx"},{"name":"AppShell","sourcePath":"ui_kits/app/AppShell.jsx"},{"name":"AppToolPage","sourcePath":"ui_kits/app/AppToolPage.jsx"},{"name":"DetectorLanding","sourcePath":"ui_kits/marketing/DetectorLanding.jsx"},{"name":"HumanizerLanding","sourcePath":"ui_kits/marketing/HumanizerLanding.jsx"},{"name":"MarketingFooter","sourcePath":"ui_kits/marketing/MarketingFooter.jsx"},{"name":"MarketingHome","sourcePath":"ui_kits/marketing/MarketingHome.jsx"},{"name":"PricingPage","sourcePath":"ui_kits/marketing/PricingPage.jsx"},{"name":"SiteHeader","sourcePath":"ui_kits/marketing/SiteHeader.jsx"},{"name":"TOOLS","sourcePath":"ui_kits/tools.js"}],"sourceHashes":{"components/core/Badge.jsx":"05661ea3873b","components/core/Button.jsx":"30ba8d62fba7","components/feedback/QuotaBar.jsx":"5a226b997822","components/feedback/UpsellBanner.jsx":"62afc2892e81","components/forms/Chip.jsx":"e3f7aabe04b7","components/forms/Input.jsx":"a0a1927f2c37","components/forms/Textarea.jsx":"6f4fc94c5378","components/navigation/ToolTabs.jsx":"f42845633bb6","components/surfaces/Card.jsx":"401f9c23b99e","components/tools/Highlight.jsx":"2a0e7f1ef397","components/tools/ScoreGauge.jsx":"fc3b185a3195","components/tools/ToolEditor.jsx":"176cb7975cf2","ui_kits/admin/AdminBackoffice.jsx":"9c6b7de471c6","ui_kits/app/AppAccount.jsx":"e8bdd7d67c3b","ui_kits/app/AppLogin.jsx":"650d461f5e38","ui_kits/app/AppShell.jsx":"06b7a338e95b","ui_kits/app/AppToolPage.jsx":"5e0713fe1d78","ui_kits/marketing/DetectorLanding.jsx":"d28db46f7c1b","ui_kits/marketing/HumanizerLanding.jsx":"4b221a79f398","ui_kits/marketing/MarketingFooter.jsx":"cde14e30342d","ui_kits/marketing/MarketingHome.jsx":"8af55a6e379f","ui_kits/marketing/PricingPage.jsx":"e04f06ae1139","ui_kits/marketing/SiteHeader.jsx":"33c31e9deea5","ui_kits/tools.js":"127ebd8126b6"},"inlinedExternals":[],"unexposedExports":[]} */

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

// components/tools/ScoreGauge.jsx
try { (() => {
const __css = `
.vbx-score{display:flex;align-items:center;gap:var(--space-4)}
.vbx-score-ring{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;flex:none}
.vbx-score-ring i{width:48px;height:48px;border-radius:50%;background:var(--card);display:grid;place-items:center;font-style:normal;font-weight:var(--font-semibold);font-size:var(--text-sm)}
.vbx-score-body{display:flex;flex-direction:column;gap:var(--space-1)}
.vbx-score-title{margin:0;font-size:var(--text-base);font-weight:var(--font-semibold)}
.vbx-score-note{margin:0;font-size:var(--text-sm);color:var(--muted-foreground);line-height:var(--leading-normal)}
`;
if (typeof document !== "undefined" && !document.getElementById("vbx-score-css")) {
  const el = document.createElement("style");
  el.id = "vbx-score-css";
  el.textContent = __css;
  document.head.appendChild(el);
}
const BANDS = [{
  min: 70,
  color: "var(--success)",
  label: "Suena humano"
}, {
  min: 40,
  color: "var(--warning-fill)",
  label: "Dudoso"
}, {
  min: 0,
  color: "var(--danger)",
  label: "Suena a IA"
}];
function ScoreGauge({
  value = 0,
  label,
  note,
  children
}) {
  const band = BANDS.find(b => value >= b.min) || BANDS[BANDS.length - 1];
  return /*#__PURE__*/React.createElement("div", {
    className: "vbx-score"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbx-score-ring",
    style: {
      background: `conic-gradient(${band.color} 0 ${value}%, var(--border) ${value}% 100%)`
    }
  }, /*#__PURE__*/React.createElement("i", null, value, "%")), /*#__PURE__*/React.createElement("div", {
    className: "vbx-score-body"
  }, /*#__PURE__*/React.createElement("p", {
    className: "vbx-score-title"
  }, label ?? `${band.label} en un ${value}%`), /*#__PURE__*/React.createElement("p", {
    className: "vbx-score-note"
  }, note ?? "Orientativo: medimos los patrones típicos de la IA. Ningún servicio puede garantizar un resultado frente a detectores de terceros.")), children);
}
Object.assign(__ds_scope, { ScoreGauge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tools/ScoreGauge.jsx", error: String((e && e.message) || e) }); }

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
  }, /*#__PURE__*/React.createElement(__ds_scope.ScoreGauge, {
    value: 72
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

// ui_kits/marketing/DetectorLanding.jsx
try { (() => {
function DetectorLanding({
  onNavigate = () => {}
}) {
  const [text, setText] = React.useState("Es importante destacar que la implementación de estas metodologías resulta fundamental para optimizar los resultados obtenidos.");
  const [score, setScore] = React.useState(null);
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
  }, "Mide cu\xE1nto suena a IA tu texto antes de entregarlo. Te decimos d\xF3nde est\xE1n los patrones, no solo un n\xFAmero."), /*#__PURE__*/React.createElement("div", {
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
    onClick: () => setScore(31),
    disabled: words === 0
  }, "Analizar"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--muted-foreground)"
    }
  }, words, " palabras"))), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-xl)",
      padding: "var(--space-5)",
      background: "var(--card)",
      boxShadow: "var(--shadow-sm)"
    }
  }, score === null ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)",
      color: "var(--muted-foreground)"
    }
  }, "La puntuaci\xF3n aparecer\xE1 aqu\xED.") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.ScoreGauge, {
    value: score,
    label: "Suena humano en un 31%"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      fontSize: "var(--text-sm)"
    }
  }, [["Frases de longitud casi idéntica", "warning"], ["Conectores de relleno («es importante destacar»)", "danger"], ["Terminología coherente", "success"]].map(([label, tone]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    variant: tone
  }, tone === "success" ? "Bien" : tone === "warning" ? "Revisa" : "Señal"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--muted-foreground)"
    }
  }, label)))), /*#__PURE__*/React.createElement(__ds_scope.Button, {
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
const ul = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-2)",
  fontSize: "var(--text-sm)",
  color: "var(--muted-foreground)"
};
function PricingPage({
  onNavigate = () => {}
}) {
  const [loading, setLoading] = React.useState(null);
  const checkout = interval => {
    setLoading(interval);
    setTimeout(() => setLoading(null), 1400);
  };
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: "65rem",
      margin: "0 auto",
      padding: "var(--pad-page-y) var(--gutter-page)"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: "var(--text-3xl)",
      fontWeight: "var(--font-bold)",
      letterSpacing: "var(--tracking-tight)"
    }
  }, "Precios"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: "var(--space-3)",
      marginBottom: 0,
      color: "var(--muted-foreground)"
    }
  }, "Empieza gratis. Prueba Pro 3 d\xEDas \u2014 cancela antes y no pagas nada."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-8)",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "var(--space-4)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Card, null, /*#__PURE__*/React.createElement(__ds_scope.CardHeader, null, /*#__PURE__*/React.createElement(__ds_scope.CardTitle, null, "Gratis"), /*#__PURE__*/React.createElement(__ds_scope.CardDescription, null, "0 \u20AC")), /*#__PURE__*/React.createElement(__ds_scope.CardContent, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("ul", {
    style: ul
  }, /*#__PURE__*/React.createElement("li", null, "\xB7 500 palabras al d\xEDa"), /*#__PURE__*/React.createElement("li", null, "\xB7 Humanizador (y pronto el resto de herramientas)")), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "outline",
    onClick: () => onNavigate("login")
  }, "Crear cuenta gratis"))), /*#__PURE__*/React.createElement(__ds_scope.Card, {
    style: {
      borderColor: "var(--brand)",
      boxShadow: "0 0 0 1px var(--brand)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.CardHeader, null, /*#__PURE__*/React.createElement(__ds_scope.CardTitle, {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)"
    }
  }, "Pro anual ", /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    variant: "brand"
  }, "Recomendado")), /*#__PURE__*/React.createElement(__ds_scope.CardDescription, null, "59,99 \u20AC/a\xF1o \u2014 sale a 5,00 \u20AC/mes")), /*#__PURE__*/React.createElement(__ds_scope.CardContent, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("ul", {
    style: ul
  }, /*#__PURE__*/React.createElement("li", null, "\xB7 10.000 palabras por petici\xF3n"), /*#__PURE__*/React.createElement("li", null, "\xB7 Sin l\xEDmite diario"), /*#__PURE__*/React.createElement("li", null, "\xB7 Historial de documentos"), /*#__PURE__*/React.createElement("li", null, "\xB7 Todas las herramientas")), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "lg",
    onClick: () => checkout("yearly"),
    disabled: loading === "yearly"
  }, loading === "yearly" ? "Abriendo el pago…" : "Probar Pro 3 días"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-xs)",
      color: "var(--muted-foreground)"
    }
  }, "\xBFPrefieres pagar mes a mes? Pro mensual por 9,99 \u20AC/mes:"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "lg",
    variant: "outline",
    onClick: () => checkout("monthly"),
    disabled: loading === "monthly"
  }, loading === "monthly" ? "Abriendo el pago…" : "Probar Pro 3 días")))), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: "var(--space-8)",
      marginBottom: 0,
      fontSize: "var(--text-xs)",
      color: "var(--muted-foreground)",
      maxWidth: "48rem"
    }
  }, "Precios con IVA incluido. La prueba requiere tarjeta; puedes cancelar en cualquier momento desde tu cuenta. Al activar la suscripci\xF3n aceptas los", " ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      textDecoration: "underline",
      color: "inherit"
    }
  }, "t\xE9rminos del servicio"), " ", "y renuncias al derecho de desistimiento al acceder de inmediato al contenido digital."));
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

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.QuotaBar = __ds_scope.QuotaBar;

__ds_ns.UpsellBanner = __ds_scope.UpsellBanner;

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

__ds_ns.Highlight = __ds_scope.Highlight;

__ds_ns.HighlightLegend = __ds_scope.HighlightLegend;

__ds_ns.ScoreGauge = __ds_scope.ScoreGauge;

__ds_ns.ToolEditor = __ds_scope.ToolEditor;

__ds_ns.AdminBackoffice = __ds_scope.AdminBackoffice;

__ds_ns.AppAccount = __ds_scope.AppAccount;

__ds_ns.AppLogin = __ds_scope.AppLogin;

__ds_ns.AppShell = __ds_scope.AppShell;

__ds_ns.AppToolPage = __ds_scope.AppToolPage;

__ds_ns.DetectorLanding = __ds_scope.DetectorLanding;

__ds_ns.HumanizerLanding = __ds_scope.HumanizerLanding;

__ds_ns.MarketingFooter = __ds_scope.MarketingFooter;

__ds_ns.MarketingHome = __ds_scope.MarketingHome;

__ds_ns.PricingPage = __ds_scope.PricingPage;

__ds_ns.SiteHeader = __ds_scope.SiteHeader;

__ds_ns.TOOLS = __ds_scope.TOOLS;

})();
