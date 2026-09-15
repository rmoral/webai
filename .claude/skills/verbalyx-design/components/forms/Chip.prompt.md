Use `Chip` for a tool's mode row — exactly one chip is pressed at a time.

```jsx
{["Académico","Neutro","Informal"].map((m) => (
  <Chip key={m} pressed={m === mode} onClick={() => setMode(m)}>{m}</Chip>
))}
```

Mode labels are capitalised Spanish nouns/adjectives from `lib/ai/tools.ts`: Académico, Neutro, Informal (humanizador); Estándar, Fluido, Formal, Simple, Creativo, Académico (parafraseador); General, Académico (corrector). "Neutro" / "Estándar" is the default. Never use a `<select>` — the whole point is that the options are visible.
