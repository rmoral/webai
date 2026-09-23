# Correos transaccionales (D6)

Remitente: **Verbalyx <hola@verbalyx.ai>** (ya es el `FROM` de `lib/email.ts`). Extracto bancario: **VERBALYX**.

| Archivo | Cuándo se envía | Asunto | Quién lo envía |
| --- | --- | --- | --- |
| `01-confirmacion.html` | Alta o acceso con enlace mágico | Confirma tu correo para entrar en Verbalyx | Supabase Auth (plantilla del panel, `{{ .ConfirmationURL }}`) |
| `02-bienvenida.html` | Tras `signup_done`, una sola vez | Tu cuenta de Verbalyx está lista: 500 palabras al día | `/auth/callback`, primera vez que existe el usuario |
| `03-compra.html` | Primer `invoice.paid` con importe > 0 | Recibo de Verbalyx: {plan} {ciclo}, {importe} | Webhook de Stripe |
| `03b-compra-prueba.html` | Tarjeta guardada para la prueba | Tu prueba de Verbalyx empieza hoy — primer cobro el {fecha} | Webhook de Stripe |
| `04-fin-prueba.html` | 24 h antes del cobro | El {fecha} se te cobran {importe} — cancela antes si no quieres continuar | Cron `/api/cron/trial-reminder` |
| `05-cancelacion.html` | `customer.subscription.updated` con `cancel_at_period_end` | Has cancelado tu suscripción a Verbalyx | Webhook de Stripe |
| `05b-cancelacion-prueba.html` | Lo mismo, durante la prueba | Has cancelado tu prueba de Verbalyx — no se te cobrará nada | Webhook de Stripe |
| `00-cabecera-pie.html` | — | Muestra de las piezas comunes | — |

## Reglas

- **Un solo botón por correo.** Cancelar va como enlace de texto visible, subrayado y en negrita, junto a «Cómo cancelar» y nunca en el pie.
- **Fecha e importe en un bloque tintado a 26 px.** La fecha va siempre con el mes en palabras y fijada en UTC (`longDate` de `lib/billing/notify.ts`).
- **Bloque de datos en el correo de compra:** importe pagado, impuestos incluidos (el desglose de la factura de Stripe), plan, fecha del pago, método, cómo aparece en el extracto, factura, **próximo cobro con fecha e importe** y cómo cancelar.
- **La cancelación no intenta retener.** No hay oferta ni «¿seguro?». Si algún día hay oferta de retención, va en otro envío.
- **Modo oscuro:** `color-scheme`, `@media (prefers-color-scheme: dark)` y `[data-ogsc]` para Outlook. Todos los colores críticos van también en línea, así que en Gmail (que invierte a su manera y no lee la media query) el texto sigue siendo legible. La clase `.vx-dark` solo sirve para la vista previa: no hace falta en producción.
- **Sin imágenes ni webfonts.** El logotipo es texto. Tipografía de sistema.
- **Móvil:** a 600 px o menos, el titular baja a 22 px, el botón ocupa todo el ancho y las filas clave-valor se apilan.
- El pie dice por qué llega el correo y qué tipo de aviso es. Los de facturación dicen «aviso de facturación, no publicidad»: eso los deja fuera de la obligación de darse de baja.
