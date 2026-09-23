Resumen del pedido. Se usa en los dos sitios donde se paga: la página `/checkout` y el pago en contexto del muro.

```jsx
<OrderSummary plan="unlimited" cycle={cycle} onCycle={setCycle} />
<OrderSummary plan="unlimited" cycle="monthly" compact />
```

- El desglose muestra la prueba como una línea negativa ("−29,99 US$") para que "Hoy pagas 0,00 US$" sea verificable, no una afirmación.
- Omite `onCycle` cuando el ciclo ya viene decidido; entonces no se puede cambiar ahí.
- `CYCLES` es la única fuente de precios y fechas de la maqueta. En producción viene de `lib/billing/plans.ts`.
