Use `ToolEditor` for any Verbalyx AI tool surface — it is the product's one real "app" component.

```jsx
<ToolEditor name="Humanizador" modes={["academico","neutro","informal"]} wordsRemaining={352} />
```

- Modes come from `lib/ai/tools.ts`: humanize → académico/neutro/informal, paraphrase → 6 modes, correct → 2, detect → none. The selected mode is a solid `default` button; the rest are `outline`.
- Layout is always two equal columns inside ONE bordered frame: editable pane left, result pane right, 1px rule between, mode chips in the top bar, run button in the bottom bar. It collapses to one column under 720px.
- The result marks its edits with `Highlight` (amber = reescrito, verde = añadido) and explains them with `HighlightLegend` in the bottom bar once the run finishes.
- The run button carries the tool's own name ("Humanizador"), not a generic verb, and becomes "Procesando…" while streaming. "Copiar resultado" appears only after a successful run.
- Quota errors render as a 14px `--destructive` line with an inline upsell link: "Desbloquea Pro con 3 días de prueba →".
