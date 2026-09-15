Use `Highlight` inside a result pane; always pair it with `HighlightLegend` in the pane footer so the colours are explained.

```jsx
<p><Highlight>Estas metodologías cambian los resultados</Highlight>, y por eso vale la pena aplicarlas.</p>
<HighlightLegend kind="rewritten" />
<HighlightLegend kind="added" />
```

Highlighting is a tinted background plus a 2px underline in the darker tint — never coloured text, because the result has to stay readable when copied. Highlight phrases, not single words, and never more than roughly a third of the output: if everything is marked, nothing is.
