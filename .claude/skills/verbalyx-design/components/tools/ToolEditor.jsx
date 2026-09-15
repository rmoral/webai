import React from "react";
import { Button } from "../core/Button.jsx";
import { Chip } from "../forms/Chip.jsx";
import { Highlight, HighlightLegend } from "./Highlight.jsx";

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
  general: "General",
};

const DEMO_SEGMENTS = [
  { kind: "rewritten", text: "Estas metodologías cambian bastante los resultados" },
  { kind: "plain", text: ", y por eso vale la pena implementarlas con cuidado. " },
  { kind: "added", text: "Dicho de otro modo" },
  { kind: "plain", text: ": el proceso llega al objetivo sin dar vueltas de más." },
];

function countWords(text) {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

export function ToolEditor({
  name = "Humanizador",
  modes = ["academico", "neutro", "informal"],
  wordsRemaining = null,
  segments = DEMO_SEGMENTS,
  initialText = "",
  footer = null,
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
  const visible = segments.map((seg) => {
    const slice = seg.text.slice(0, Math.max(0, budget));
    budget -= seg.text.length;
    return { ...seg, slice };
  });

  return (
    <div className="vbx-editor">
      {modes.length > 0 && (
        <div className="vbx-editor-bar">
          {modes.map((m) => (
            <Chip key={m} pressed={m === mode} onClick={() => setMode(m)}>
              {MODE_LABELS[m] ?? m}
            </Chip>
          ))}
        </div>
      )}

      <div className="vbx-editor-panes">
        <div className="vbx-editor-pane">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pega aquí tu texto…"
          />
          <div className="vbx-editor-foot">
            <span>
              {words} palabras
              {wordsRemaining !== null && ` · Te quedan ${wordsRemaining.toLocaleString("es-ES")} hoy`}
            </span>
          </div>
        </div>
        <div className="vbx-editor-rule" />
        <div className="vbx-editor-pane">
          <div className="vbx-editor-out">
            {shown === 0 ? (
              <span style={{ color: "var(--muted-foreground)" }}>
                {status === "loading" ? "Escribiendo…" : "El resultado aparecerá aquí"}
              </span>
            ) : (
              visible.map((seg, i) =>
                seg.kind === "plain" ? (
                  <React.Fragment key={i}>{seg.slice}</React.Fragment>
                ) : (
                  <Highlight key={i} kind={seg.kind}>
                    {seg.slice}
                  </Highlight>
                )
              )
            )}
          </div>
          {status === "done" && (
            <div className="vbx-editor-foot">
              <Button variant="outline" size="sm">Copiar resultado</Button>
              <Button variant="ghost" size="sm" onClick={run}>Rehacer</Button>
            </div>
          )}
        </div>
      </div>

      <div className="vbx-editor-run">
        <Button size="lg" onClick={run} disabled={status === "loading" || words === 0}>
          {status === "loading" ? "Procesando…" : name}
        </Button>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>
          {footer ?? "No guardamos tu texto."}
        </span>
        {status === "done" && (
          <span className="vbx-editor-legend">
            <HighlightLegend kind="rewritten" />
            <HighlightLegend kind="added" />
          </span>
        )}
      </div>
    </div>
  );
}
