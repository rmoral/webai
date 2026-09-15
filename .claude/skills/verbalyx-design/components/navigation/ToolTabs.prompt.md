Use `ToolTabs` as the tool switcher. It belongs immediately under the site header, full width, never inside a card.

```jsx
<ToolTabs
  value={tool}
  onChange={setTool}
  items={[
    { id: "humanize", label: "Humanizador", hint: "Que suene a persona" },
    { id: "detect", label: "Detector de IA", hint: "Mide antes de entregar" },
    { id: "paraphrase", label: "Parafraseador", hint: "Seis registros", disabled: true },
    { id: "correct", label: "Corrector", hint: "Ortografía y gramática", disabled: true },
  ]}
/>
```

- The active tab is brand blue with a 2px underline; everything else is muted. No pills, no boxed tabs, no background fill.
- Keep the order of `lib/ai/tools.ts`: humanizador, detector, parafraseador, corrector.
- Tools that have not shipped stay visible but `disabled` — the roadmap is part of the pitch. Do not hide them and do not label them "muy pronto" in the tab; that copy belongs in the body.
