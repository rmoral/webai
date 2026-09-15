Use `Textarea` wherever the user pastes text — in practice, the left pane of a tool editor.

```jsx
<Textarea placeholder="Pega aquí tu texto…" style={{minHeight:"var(--min-editor)"}} />
```

The tool editor sets `min-height: 14rem` (min-h-56) and puts a 14px muted word count directly underneath: "148 palabras · Te quedan 352 hoy". The result pane opposite it is not a textarea — it is a read-only `--muted` box at 40% with the same min-height.
