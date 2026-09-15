Use `Card` for any grouped block: tool tiles, plan tiers, account sections, admin stat tiles, the login form.

```jsx
<Card interactive>
  <CardHeader>
    <CardTitle>Humanizador</CardTitle>
    <CardDescription>Pruébalo gratis →</CardDescription>
  </CardHeader>
</Card>
```

- Header-only cards are normal — the tool grid and the marketing grid are nothing but `CardHeader`.
- `interactive` adds the `accent/40` hover tint; use it only when the card is wrapped in a link.
- A recommended or dangerous card changes only its border: `style={{borderColor:"var(--primary)"}}` for the recommended plan, `color-mix(...)` of `--destructive` at 40% for the delete-account card. Never a coloured background.
- Stat tiles put the label in `CardTitle` at 14px/400 muted, and the number in `CardContent` at 24px/600.
