Pago en contexto, abierto desde el muro. **No redirige a ningún sitio.**

```jsx
{step === "paywall" && <Paywall trigger="quota" onPrimary={() => setStep("pay")} />}
{step === "pay" && <CheckoutModal plan="unlimited" cycle="monthly" onBack={() => setStep("paywall")} onDone={resume} />}
```

- El modal **no cambia el ciclo**: eso ya se decidió en el muro o en precios. Aquí solo se paga.
- La flecha de volver lleva al muro, no cierra el flujo. Cerrar con la X devuelve al editor con el texto intacto.
- El éxito ocurre **dentro del mismo modal**, con la fecha del cobro y dos salidas. El CTA primario es "Seguir donde estaba": el usuario volvió a por su texto, no a por una pantalla de bienvenida.
- La cabecera dice literalmente "Pagar sin salir de aquí". Es la promesa que diferencia este flujo del de la competencia.
