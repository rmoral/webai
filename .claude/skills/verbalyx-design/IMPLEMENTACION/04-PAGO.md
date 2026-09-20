# Fase 3 · Pago integrado

**El cobro ocurre dentro de Verbalyx.** Nada de `redirectToCheckout` ni de URLs de Checkout alojadas por Stripe. Referencia: `components/billing/PaymentForm.jsx`, `CheckoutModal.jsx`, `OrderSummary.jsx`. Estimación: 2-3 jornadas, la mitad backend.

## Por qué, y qué no cambia

El muro B aparece justo después de enseñarle al usuario su resultado a medias. Mandarlo en ese momento a otro dominio es pedirle que abandone su texto para ir a rellenar una tarjeta.

Lo que **no** cambia: la tarjeta la sigue procesando Stripe. El Payment Element es un iframe de Stripe; los datos van cifrados directamente a ellos y **no pasan por vuestro servidor**. El alcance PCI sigue siendo **SAQ A**, igual que con la redirección. Dilo en la pantalla: un formulario embebido sin esa nota genera más desconfianza que la redirección.

## 3.1 · Dependencias

```bash
pnpm add @stripe/stripe-js @stripe/react-stripe-js
```

`stripe` (servidor) ya debería estar. Verifica la versión de API fijada en el cliente y no la cambies sin revisar los webhooks.

## 3.2 · Los dos casos de cobro

Esta es la parte que más se equivoca. Son mecanismos distintos de Stripe:

### Caso 1 — Con prueba (Ilimitado mensual)

Hoy no se cobra nada, así que **no hay factura que pagar**: hay que **guardar la tarjeta**. La suscripción genera un `pending_setup_intent`.

```ts
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: PLANS.unlimited.stripePriceId.monthly }],
  trial_period_days: 3,
  payment_behavior: "default_incomplete",
  payment_settings: { save_default_payment_method: "on_subscription" },
  trial_settings: {
    end_behavior: { missing_payment_method: "cancel" },
  },
  expand: ["pending_setup_intent"],
  metadata: { userId, plan: "unlimited", cycle: "monthly" },
});

const clientSecret = subscription.pending_setup_intent.client_secret;
```

En el cliente se confirma con `stripe.confirmSetup()`.

### Caso 2 — Cobro inmediato (Pro, y los anuales)

Hay factura desde el minuto uno: es un `PaymentIntent`.

```ts
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  payment_behavior: "default_incomplete",
  payment_settings: { save_default_payment_method: "on_subscription" },
  expand: ["latest_invoice.payment_intent"],
  metadata: { userId, plan, cycle },
});

const clientSecret = subscription.latest_invoice.payment_intent.client_secret;
```

En el cliente, `stripe.confirmPayment()`.

> **Verifica la forma exacta contra la versión de API que tengáis fijada.** Stripe ha movido estos campos entre versiones (`confirmation_secret` en las recientes). Lee la respuesta real en modo test antes de dar el flujo por bueno — no asumas la forma de este documento.

**Regla de negocio, no de Stripe:** `trial_period_days` solo cuando `plan === "unlimited" && cycle === "monthly"`. Valídalo en servidor. Si llega una petición pidiendo prueba en anual, recházala: es la incoherencia que estamos arreglando.

## 3.3 · Endpoint

`POST /api/billing/subscribe`

```ts
// entrada
{ plan: "pro" | "unlimited", cycle: "monthly" | "yearly" }

// salida
{ clientSecret: string, mode: "setup" | "payment", subscriptionId: string }
```

Obligatorio en servidor:

1. Usuario autenticado. Si no, 401 y el cliente manda a `/registro` conservando la intención.
2. **Precio desde `PLANS`, nunca desde el cuerpo de la petición.** Que el cliente mande un precio es el agujero clásico.
3. Rechaza prueba en anual.
4. Rechaza si ya hay suscripción activa o en prueba: manda al portal.
5. `Customer` de Stripe idempotente por usuario, guardado en vuestra tabla.
6. Registra el consentimiento: `{ userId, acceptedAt, ip, userAgent, termsVersion, plan, cycle, amountToday, nextChargeDate }`. **Esto es lo que os salva en una disputa.** Tabla nueva `billing_consents`.

## 3.4 · Payment Element

Monta el Element con la apariencia de los tokens. Esto no es cosmética: un formulario de pago que no parece de la casa reduce la conversión.

```ts
const appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#2b45c4",
    colorBackground: "#ffffff",
    colorText: "#252525",
    colorDanger: "#8f2018",
    fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif',
    fontSizeBase: "14px",
    borderRadius: "8px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid #ebebeb", boxShadow: "none", padding: "10px 12px" },
    ".Input:focus": { border: "1px solid #2b45c4", boxShadow: "0 0 0 3px rgba(43,69,196,.3)" },
    ".Label": { fontWeight: "500", fontSize: "14px" },
  },
};
```

Opciones del Element:

```ts
<PaymentElement options={{
  layout: "tabs",
  wallets: { applePay: "auto", googlePay: "auto" },
  fields: { billingDetails: { address: { country: "auto", postalCode: "auto" } } },
}} />
```

**Monederos arriba, siempre.** Apple Pay y Google Pay resuelven el pago móvil en un gesto y son la mitad de las conversiones móviles del sector. Apple Pay exige dominio verificado en Stripe y HTTPS: hazlo en la fase de configuración, no el día del lanzamiento.

### Envoltorio propio

Alrededor del Element van elementos nuestros que Stripe no da:

- **Divulgación a 14 px**, fondo tintado, encima de la casilla.
- **Casilla de consentimiento** específica: «Entiendo que la suscripción se renueva automáticamente y que puedo cancelarla online en cualquier momento.» El botón está deshabilitado hasta marcarla.
- **Botón con el importe**: «Empezar la prueba — 0,00 US$ hoy» / «Pagar — 179,88 US$ hoy». Nunca «Pagar» a secas.
- **Estado de proceso**: spinner dentro del botón, todo lo demás deshabilitado, texto «Procesando el pago…».
- **Error de rechazo** que aclara que **no se ha cobrado nada**. Es la duda inmediata del usuario.
- **Nota de seguridad** explicando que el pago lo procesa Stripe y que la tarjeta no pasa por vuestros servidores.

## 3.5 · Dos puertas al mismo pago

### `CheckoutModal` — desde el muro

Se abre desde el CTA primario del muro, encima del editor.

- **No deja cambiar el ciclo**: ya se decidió. Resumen compacto arriba, formulario debajo.
- Flecha atrás → vuelve al muro. X → cierra al editor **con el texto intacto**.
- El éxito ocurre **dentro del mismo modal**, con la fecha del cobro y dos salidas.
- CTA primario del éxito: **«Seguir donde estaba»**. El usuario vino a por su texto, no a por una bienvenida.
- Cabecera literal: «Pagar sin salir de aquí».

### `/checkout` — desde precios

Página completa. Resumen y ciclo a la izquierda, formulario a la derecha. Cambiar el ciclo actualiza **a la vez** el desglose, el importe del botón y la divulgación.

Tras pagar → `/checkout/listo` (confirmación).

## 3.6 · Webhooks

`POST /api/stripe/webhook`, firma verificada con `STRIPE_WEBHOOK_SECRET`, **idempotente por `event.id`** (tabla `stripe_events` con el id procesado; Stripe reintenta).

| Evento | Qué hacer |
| --- | --- |
| `customer.subscription.created` | crear la suscripción local, estado `trialing` o `active` |
| `customer.subscription.updated` | sincronizar estado, ciclo y `cancel_at_period_end` |
| `customer.subscription.deleted` | bajar a gratis |
| `invoice.paid` | activar o renovar; reiniciar el contador mensual |
| `invoice.payment_failed` | marcar `past_due`, avisar por correo, conservar acceso durante el periodo de gracia |
| `setup_intent.succeeded` | tarjeta guardada; confirmar que la prueba está en marcha |
| `customer.subscription.trial_will_end` | ver el aviso de abajo |

### El aviso de las 24 horas — atención

**`trial_will_end` se dispara tres días antes del final de la prueba.** Con una prueba de 3 días, eso es casi el mismo momento de crearla. **No sirve** para el correo de las 24 h.

El recordatorio de 24 h tiene que ser **una tarea programada vuestra**: un cron diario (Vercel Cron) que busque suscripciones con `trial_end` entre 24 y 48 horas y no avisadas, y envíe el correo. Marca `trialReminderSentAt` para no duplicar.

Es el detalle que, según el estudio, evita la mayoría de las disputas. Si no se implementa, la mitad del valor de esta fase se pierde.

## 3.7 · Portal de cliente

Cancelar tiene que costar **dos clics**: Mi cuenta → Suscripción → Cancelar. Usa el Stripe Customer Portal con `cancellation: { enabled: true, mode: "at_period_end" }`, o una acción propia que llame a `subscriptions.update({ cancel_at_period_end: true })`.

Si cancelar cuesta más de dos pasos, **arregla el producto, no el copy**: prometemos dos clics en el muro, en el checkout y en los dos correos.

## 3.8 · Variables de entorno

```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_YEARLY=
STRIPE_PRICE_UNLIMITED_MONTHLY=
STRIPE_PRICE_UNLIMITED_YEARLY=
CRON_SECRET=
```

## Criterio de aceptación

- Prueba de Ilimitado mensual: no se cobra nada, la tarjeta queda guardada, la suscripción queda `trialing`, y la fecha mostrada coincide con `trial_end` de Stripe.
- Anual: se cobra hoy, sin prueba, y la divulgación lo dice.
- Una petición forzada de prueba en anual se rechaza en servidor.
- Tarjeta rechazada (`4000 0000 0000 0002`): mensaje claro y ningún cargo.
- 3D Secure (`4000 0025 0000 3155`): el reto se resuelve **dentro del modal**, sin sacar al usuario.
- Reenviar el mismo webhook dos veces no duplica nada.
- Tras pagar desde el muro, el usuario vuelve al editor **con su texto**.
- El consentimiento queda registrado con fecha, IP y versión de términos.
