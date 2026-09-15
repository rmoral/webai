Use `Button` for every action in Verbalyx — there is no other button in the product.

```jsx
<Button size="lg">Probar gratis</Button>
<Button variant="outline">Continuar con Google</Button>
<Button variant="destructive" disabled>Eliminando…</Button>
```

- `variant="default"` (brand blue `--brand`) is the one primary action per view. `ink` is the original near-black fill — use it when a second solid button must not compete with the real CTA. `soft` is the tinted low-emphasis fill used inside upsell banners. `outline` is the standard secondary — it carries the OAuth button, "Copiar resultado", "Salir".
- `variant="destructive"` only for irreversible confirmation ("Sí, eliminar").
- `size="lg"` for marketing CTAs and the tool's run button; `sm` inside headers and mode pickers.
- Labels are Spanish sentence case, and the loading label replaces the idle one with an ellipsis character: "Enviando…", "Procesando…", "Abriendo el pago…".
- To wrap a link, pass `as="a"` (upstream uses `asChild` + next/link).
