Use `Badge` to label state, never as a button.

```jsx
<Badge>Recomendado</Badge>
<Badge variant="secondary">Plan Gratis</Badge>
```

Tinted variants carry meaning, not decoration: `brand` for plan/state chips, `success` for a good detector score or an "Añadido" legend, `warning` for "Reescrito" and borderline scores, `danger` for failures. `pill` + `dot` is reserved for the hero's "Sin registro · 300 palabras al día" chip.

The product's rule: `default` (solid near-black) marks the good/paid state — Pro plan, recommended tier; `secondary` marks the neutral/free state. Badges are 12px, medium weight, 8px radius — never pill-shaped.
