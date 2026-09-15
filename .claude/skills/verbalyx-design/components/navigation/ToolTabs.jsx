import React from "react";

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

export function ToolTabs({ items = [], value, onChange = () => {} }) {
  return (
    <div className="vbx-tabs" role="tablist">
      {items.map((item) => (
        <button
          key={item.id}
          role="tab"
          type="button"
          className="vbx-tab"
          aria-selected={item.id === value}
          disabled={item.disabled}
          onClick={() => !item.disabled && onChange(item.id)}
        >
          {item.label}
          {item.hint && <small>{item.hint}</small>}
        </button>
      ))}
    </div>
  );
}
