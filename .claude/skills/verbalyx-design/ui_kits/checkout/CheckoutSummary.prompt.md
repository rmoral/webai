Página de pago (`/checkout`). **El cobro ocurre aquí; no hay redirección a Stripe.**

```jsx
<CheckoutSummary plan="unlimited" initialCycle="monthly" onPaid={() => router.push("/checkout/listo")} />
```

- Izquierda el resumen con el ciclo cambiable; derecha el `PaymentForm` embebido.
- Cambiar el ciclo actualiza a la vez el desglose, el importe del botón y la divulgación. Nunca dos precios compitiendo.
- **El trial solo existe en Ilimitado mensual.** En anual el botón dice "Pagar — 179,88 US$ hoy" y la divulgación dice que se cobra hoy.
- "¿Cómo cancelo?" abre los dos pasos reales antes de pedir la tarjeta, no después.
- Esta página es para quien llega desde precios. Quien choca con un muro paga sin salir del editor con `CheckoutModal`.
