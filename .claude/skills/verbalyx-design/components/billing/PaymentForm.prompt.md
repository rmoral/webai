Formulario de pago embebido. **Verbalyx no redirige a Stripe Checkout**: se paga dentro del sitio.

```jsx
<PaymentForm trial amountToday="0,00 US$" payLabel="Empezar la prueba"
             chargeDate="22 de septiembre de 2026" nextAmount="29,99 US$" />
```

- **Monederos arriba, tarjeta debajo.** Apple Pay y Google Pay resuelven el pago en móvil en un gesto; son la mitad de las conversiones móviles del sector.
- El bloque de tarjeta es un solo recuadro con divisiones internas (número arriba; caducidad y CVC abajo). En producción es un Stripe Payment Element: replica esta apariencia con la opción `appearance`, no lo reconstruyas.
- **La divulgación va dentro del formulario, encima de la casilla**, a 14px. El botón está deshabilitado hasta marcarla.
- **El botón dice el importe de hoy**: "Empezar la prueba — 0,00 US$ hoy". Nunca un "Pagar" a secas.
- El error de rechazo aclara que no se ha cobrado nada. Es la duda inmediata del usuario.
- La nota de seguridad explica por qué es seguro pagar aquí: los datos van cifrados a Stripe y no pasan por nuestros servidores. Sin ella, el formulario embebido genera más desconfianza que la redirección.
