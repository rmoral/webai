Use `UpsellBanner` to offer Pro in context — never as a modal, never over the editor.

```jsx
<UpsellBanner
  title="Te quedan 265 palabras hoy."
  action={<Button size="sm">Probar Pro 3 días</Button>}
>
  Pro sube el límite a 10.000 por petición, quita el límite diario y guarda tu historial.
</UpsellBanner>
```

Use `tone="quota"` only once the user is actually blocked, and keep the copy factual: state the limit, state what Pro changes, offer the trial. The product's standing promise is "cancela antes y no pagas nada" — say it wherever the trial is offered.
