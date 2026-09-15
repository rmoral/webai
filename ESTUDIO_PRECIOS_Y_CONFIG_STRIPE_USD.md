# ESTUDIO DE PRECIOS COMPETITIVO Y CONFIGURACIÓN DE STRIPE (USD / VENTA DESDE EE. UU.)

> Complemento de `PLAN_DESARROLLO_WRITE_AI.md`. Sustituye a la sección 4 (Monetización y pagos) del plan original y a la versión anterior en euros.
> Datos de competencia verificados en septiembre de 2026 sobre páginas oficiales y reseñas independientes.
> **Entidad vendedora: LLC de Wyoming. Moneda de venta y de cuenta: USD. Producto en español.**

---

## 0. Qué cambia al vender desde EE. UU.

Vender desde una LLC estadounidense en dólares es la decisión correcta para este producto, por cuatro motivos concretos:

1. **Comparación directa con la competencia.** Todo el sector cotiza en USD. Desaparece la distorsión de tipo de cambio al fijar precio.
2. **Andorra no es país soportado por Stripe.** La LLC resuelve el acceso a la pasarela sin montar una estructura de _merchant of record_ para terceros.
3. **No hay IVA repercutido al consumidor.** En EE. UU. el impuesto sobre ventas de SaaS es estatal y depende del _nexus_ económico; con volumen bajo al principio, la carga es cero en la mayoría de estados.
4. **El mercado natural del producto se amplía.** Un SaaS en español vendido en dólares se dirige a tres bolsas a la vez: hispanohablantes en EE. UU. (el mayor mercado de habla hispana por poder adquisitivo), LATAM (que ya piensa en dólares) y España.

Lo que se complica: la fiscalidad interna del grupo y el cumplimiento de la normativa de suscripciones estadounidense. Ambas cosas están tratadas en las secciones 5 y 6.

---

## 1. Mapa de precios de la competencia (todos en USD)

### 1.1 Humanizadores (competidores directos)

| Producto                         | Gratis                                 | Mensual                                         | Anual (equiv./mes)                                       | Volumen incluido                                                            | Modelo de entrada                              |
| -------------------------------- | -------------------------------------- | ----------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------- |
| **WriteHuman** (datos oficiales) | 3 peticiones/mes, 250 palabras         | Basic $20 · Pro $29 · Ultra $59                 | Basic $12 ($144/año) · Pro $19 ($228) · Ultra $39 ($468) | 80 / 200 / ilimitadas peticiones; 600 / 1.200 / 3.000 palabras por petición | Free tier sin tarjeta                          |
| **Undetectable AI**              | 250 palabras (pide tarjeta)            | $9,99 (10K palabras) · $19 (20K) · $31 (35K)    | ~$5 / ~$10                                               | Cuota de palabras que **no** acumula                                        | Trial de 250 palabras con tarjeta              |
| **JustDone**                     | 3 comprobaciones de 250 palabras       | $19,99–29,99                                    | $119,88–299,88/año                                       | "Ilimitado", 35+ herramientas                                               | **Trial 7 días por $2 → renueva a $39,99/mes** |
| **TextGuardAI**                  | No hay                                 | ~$32 · ~$43 (publicado en EUR: €29,90 / €39,90) | No publicado                                             | 100K / 1M palabras/mes                                                      | **Trial 24 h por ~$0,75**                      |
| **QuillBot**                     | Parafraseo hasta 125 palabras, 2 modos | $19,95                                          | $8,33 ($99,95/año, −58 %)                                | Ilimitado + plagio + citas                                                  | Free tier generoso, sin tarjeta                |

### 1.2 Detectores (referencia para tarificar nuestra herramienta de detección)

| Producto       | Gratis                           | Mensual                                                 | Anual (equiv./mes)              | Volumen                         |
| -------------- | -------------------------------- | ------------------------------------------------------- | ------------------------------- | ------------------------------- |
| **GPTZero**    | 10.000 palabras/mes, sin tarjeta | Essential $14,99 · Premium $23,99 · Professional $45,99 | $8,33 / $12,99 / $24,99 (−45 %) | 150K / 300K / 500K palabras/mes |
| Originality.ai | No                               | ~$14,95                                                 | —                               | Por créditos                    |

### 1.3 Lectura estratégica

Hay **dos modelos de monetización claramente diferenciados**, y hay que elegir conscientemente:

**Modelo A — suscripción transparente** (WriteHuman, QuillBot, Undetectable, GPTZero). Free tier real, precio visible, descuento anual del 45-58 %. Construye marca y SEO. Conversión más lenta, churn más bajo, reputación defendible.

**Modelo B — trial de pago con auto-renovación alta** (JustDone $2→$39,99; TextGuardAI ~$0,75→~$32). Es el modelo que financia los $1,45M/mes de JustDone y los $1,99M/mes de Textguard en Google Ads que viste en los dashboards: el trial de pago convierte tráfico frío a coste casi cero y la renovación al triple genera caja inmediata.

El coste del modelo B está documentado: las reseñas de JustDone en Trustpilot están dominadas por quejas de facturación, no de producto, con cargos sorpresa y dificultad para obtener reembolsos. **Y en EE. UU. ese patrón es exactamente el que está bajo el foco regulatorio** (ver sección 6): no es solo reputacional, es riesgo de expediente.

**Recomendación: modelo A con el gancho de entrada del modelo B, jugado limpio.** Trial gratuito de 3 días **sobre el plan Ilimitado** con tarjeta obligatoria, renovación **al precio de lista publicado** — no al triple —, aviso por email 24 h antes y cancelación online en dos clics.

El trial va sobre Ilimitado, no sobre Pro, por una razón de anclaje: quien prueba la versión sin límites durante tres días percibe el valor máximo del producto, y quien no quiera pagar $29,99 tiene la salida natural de bajar a Pro en lugar de cancelar. Convierte el flujo de cancelación en un flujo de downgrade.

### 1.4 Hueco de posicionamiento detectado

- El rango $12-16/mes está prácticamente vacío en humanizadores: o pagas $9,99 con cuota corta (10K palabras), o saltas a $20-29.
- Nadie tiene **plan estudiante verificado para el mercado hispano** (QuillBot lo tiene solo sobre email .edu estadounidense).
- Los volúmenes del sector son opacos: WriteHuman vende "peticiones", Undetectable vende palabras que caducan al cancelar. **Vender palabras/mes claras que no caducan es un argumento comercial en sí mismo.**
- Ningún competidor relevante trata el español como idioma nativo del producto: todos son productos en inglés con la interfaz traducida.

---

## 2. Plan de precios propuesto (USD)

Precios sin impuestos incluidos, como es estándar en EE. UU. Stripe Tax añade el impuesto estatal donde corresponda.

| Plan          | Mensual         | Anual                             | Palabras/mes                              | Máx. por petición | Notas                                                                   |
| ------------- | --------------- | --------------------------------- | ----------------------------------------- | ----------------- | ----------------------------------------------------------------------- |
| **Gratis**    | $0              | —                                 | 300/día sin registro · 500/día registrado | 300               | Humanizador + detector (puntuación global, sin resaltado por frase)     |
| **Pro**       | **$14,99/mes**  | **$89,88/año** ($7,49/mes, −50 %) | 60.000                                    | 3.000             | Todas las herramientas, historial, sin marca de agua                    |
| **Ilimitado** | **$29,99/mes**  | **$179,88/año** ($14,99/mes)      | 500.000 (soft cap)                        | 8.000             | **Trial de 3 días con tarjeta.** Marketing, agencias. Prioridad de cola |
| **Recarga**   | **$9,99** único | —                                 | +25.000 palabras                          | —                 | No caducan. Solo con suscripción activa                                 |

### Justificación de cada número

- **$14,99/mes**: por debajo de WriteHuman Pro ($29), QuillBot ($19,95) y TextGuardAI (~$32); por encima de Undetectable Basic ($9,99) pero con **6× más palabras**. Ocupa el hueco vacío del rango medio.
- **−50 % anual**: estándar del sector (GPTZero −45 %, QuillBot −58 %, WriteHuman −33/−40 %). Por debajo el anual no convierte; por encima regalas margen.
- **60.000 palabras/mes**: cubre con holgura al estudiante (≈15 trabajos de 4.000 palabras) y es 6× la cuota de Undetectable Basic. Coste de IA estimado en el peor caso (cuota agotada): $0,90-1,80/mes → margen bruto > 85 %.
- **Trial de 3 días sobre Ilimitado**: tres días es suficiente para un trabajo académico o un lote de artículos, y corto de más para explotarlo como suscripción gratuita. La tarjeta obligatoria filtra curiosos y deja el medio de pago verificado.
- **Downgrade a Pro como salida del trial**: al no existir un escalón intermedio de precio entre el trial y $29,99, Pro pasa a cumplir esa función. Es el movimiento que hay que instrumentar y medir.
- **Recarga que no caduca**: argumento directo contra Undetectable, cuyos créditos expiran al cancelar.

### Reglas de producto que sostienen el precio

1. Contador de palabras restantes visible siempre.
2. Al superar la cuota gratuita: resultado visible al 50 %, resto difuminado, CTA al trial de 3 días.
3. El detector gratuito da la puntuación global; el resaltado por frase es de pago.
4. Anual preseleccionado, con el ahorro en dólares ("ahorras $90 al año"), no solo en porcentaje.
5. Al cancelar o al terminar el trial, ofrecer bajar a Pro o pausar un mes **después** de que el usuario confirme que quiere oír alternativas (ver sección 6).

### Precios regionales (fase 2)

Activar **Adaptive Pricing** de Stripe o crear price sets manuales con −40/−50 % para MX, CO, AR, CL y PE. Son los mercados donde ChatOn compraba tráfico a CPC de $0,27-0,48 según tus dashboards. España se queda en el precio de lista USD o recibe un price set en EUR cuando haya volumen.

---

## 3. Configuración de Stripe

### 3.1 Ajustes de cuenta

| Ajuste                    | Valor                                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| País de la cuenta         | **Estados Unidos** (LLC de Wyoming). Requiere EIN, cuenta bancaria US (Mercury) y dirección de negocio          |
| Moneda de liquidación     | USD                                                                                                             |
| **Stripe Tax**            | Activado. Código de producto: `txcd_10103001` (SaaS B2C). Registrar solo los estados donde se supere el _nexus_ |
| Monitorización de _nexus_ | Activar las alertas de umbral de Stripe Tax ($100K de ventas o 200 transacciones anuales, según estado)         |
| Nombre en el extracto     | Marca corta y reconocible — reduce disputas por "no reconozco el cargo"                                         |
| Idiomas de Checkout       | ES por defecto, EN como fallback                                                                                |
| Métodos de pago           | Tarjeta, Apple Pay, Google Pay, Link, PayPal, Cash App Pay (US)                                                 |
| **Radar**                 | Bloquear si falla el CVC; revisar si riesgo > 75; bloquear > 3 intentos de tarjeta por email/hora               |
| **Dunning**               | Smart Retries, 4 reintentos en 15 días, email en cada uno, cancelar al final                                    |
| Portal del cliente        | Activado: cambiar plan, **cancelar online**, actualizar tarjeta, descargar recibos                              |
| Reserva de contracargos   | Mantener un colchón de caja en la LLC; es requisito de estabilidad ante la pasarela y ante el banco             |

### 3.2 Productos y precios a crear

Un producto por plan, varios precios dentro de cada uno. `lookup_key` en todos: es lo que permite cambiar precios sin tocar el código.

```
Producto: "Pro"                     (metadata: tier=pro)
  ├─ price  14,99 USD / month       lookup_key: pro_monthly_usd
  └─ price  89,88 USD / year        lookup_key: pro_yearly_usd

Producto: "Ilimitado"               (metadata: tier=unlimited)
  ├─ price  29,99 USD / month       lookup_key: unlimited_monthly_usd   (trial 3 días, ver 3.3)
  └─ price 179,88 USD / year        lookup_key: unlimited_yearly_usd

Producto: "Recarga 25.000 palabras" (metadata: tier=topup, words=25000)
  └─ price   9,99 USD / one_time    lookup_key: topup_25k_usd
```

Metadata obligatoria en cada producto, porque `entitlements.ts` la lee para aplicar límites sin desplegar código:

```json
{
  "tier": "pro",
  "words_per_month": "60000",
  "max_words_per_request": "3000",
  "tools": "humanize,detect,paraphrase,correct",
  "history": "true",
  "priority_queue": "false"
}
```

### 3.3 Trial de 3 días sobre el plan Ilimitado (tarjeta obligatoria)

```js
stripe.checkout.sessions.create({
  mode: "subscription",
  line_items: [{ price: UNLIMITED_MONTHLY_USD, quantity: 1 }],
  subscription_data: {
    trial_period_days: 3,
    trial_settings: { end_behavior: { missing_payment_method: "cancel" } },
    metadata: { plan: "unlimited", origin: "trial_3d" },
  },
  payment_method_collection: "always", // tarjeta obligatoria
  consent_collection: { terms_of_service: "required" },
  allow_promotion_codes: true,
  automatic_tax: { enabled: true },
  customer_update: { address: "auto", name: "auto" },
  client_reference_id: userId,
  locale: "es",
});
```

`customer_update.address: 'auto'` es obligatorio con Stripe Tax en EE. UU.: el impuesto se calcula por dirección del comprador, no por país.

### 3.4 Webhooks a implementar

| Evento                                 | Acción                                                                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `checkout.session.completed`           | Crear/actualizar `subscriptions`, asignar plan, email de bienvenida, disparar conversión de Google Ads con el `gclid` guardado |
| `customer.subscription.trial_will_end` | Email recordatorio a 24 h (obligatorio, ver sección 6)                                                                         |
| `customer.subscription.updated`        | Recalcular entitlements                                                                                                        |
| `customer.subscription.deleted`        | Bajar a Gratis, email de winback a los 7 días                                                                                  |
| `invoice.paid`                         | Resetear cuota mensual de palabras                                                                                             |
| `invoice.payment_failed`               | Marcar `past_due`, email para actualizar tarjeta                                                                               |
| `charge.dispute.created`               | Alerta inmediata al owner; suspender cuenta                                                                                    |

Idempotencia obligatoria: tabla `stripe_events(event_id PK, processed_at)` y salida temprana si el `event.id` ya existe.

### 3.5 Códigos promocionales de salida

| Código         | Descuento        | Uso                                    |
| -------------- | ---------------- | -------------------------------------- |
| `BIENVENIDA30` | 30 % primer mes  | Email de carrito abandonado            |
| `ANUAL20`      | 20 % sobre anual | Upsell dentro del producto al 3.er mes |
| `VUELTA25`     | 25 % primer mes  | Campaña de inicio de curso             |
| `WINBACK40`    | 40 % primer mes  | Reactivación de cancelados             |

---

## 4. Objetivos económicos derivados de este pricing

| Métrica                   | Objetivo            | Razonamiento                                                                                   |
| ------------------------- | ------------------- | ---------------------------------------------------------------------------------------------- |
| Conversión visita → trial | ≥ 4 %               | El trial gratuito con tarjeta convierte mejor en volumen que uno de pago, a costa de más abuso |
| Trial → downgrade a Pro   | 20-30 %             | Salida esperada de quien no justifica $29,99; hay que instrumentarla, no dejarla al azar       |
| Conversión trial → Pro    | ≥ 45 %              | Referencia del sector para trials de pago cortos                                               |
| CAC objetivo              | < $22               | Con LTV estimado de $60-78 (churn 12 %, ARPU $13) da ratio LTV/CAC ≈ 3                         |
| Mix anual                 | ≥ 35 % de las altas | Es lo que hace viable pagar Ads por adelantado                                                 |
| Margen bruto              | > 85 %              | Coste de IA de $0,90-1,80 sobre $14,99                                                         |
| Ratio de disputas         | < 0,4 %             | Umbral de los programas de monitorización de las redes de tarjeta                              |

El ratio de disputas es la métrica a vigilar semanalmente desde el primer día: es lo que diferencia el modelo A del modelo B y lo que puede cerrarte la pasarela.

---

## 5. Estructura fiscal e intercompañía (LLC de Wyoming)

Puntos ya establecidos en el trabajo previo sobre la entidad americana, que aplican directamente aquí:

- **El acuerdo intercompañía debe redactarse como suministro de producto o servicio, nunca como licencia o royalty.** Estructurarlo como royalty activaría una retención del 30 % en origen bajo las reglas del IRC.
- **Precios de transferencia documentados y a valor de mercado.** Las operaciones entre la LLC y la entidad andorrana son reportables en el **Formulario 5472** (más un 1120 pro forma); la omisión conlleva una penalización automática de $25.000.
- **No interponer la SL española** como holding intermedio: elevaría el tipo efectivo al 25 % de sociedades y añadiría una tercera jurisdicción sin aportar nada.
- **Reserva de caja en la LLC** para contracargos y reembolsos.
- **Transferencias salientes recurrentes a Europa** atraerán atención de cumplimiento en el banco: documentar la relación con el proveedor desde la primera operación.
- Pendiente de resolver con asesoría antes de la primera venta: FinCEN BOI, FBAR si hay cuentas extranjeras, análisis de _effectively connected income_, y el tratamiento en Andorra de una LLC transparente gestionada desde allí. Requiere un CPA estadounidense especializado en LLC de propiedad extranjera y el asesor andorrano.

Una nota específica de este proyecto: si en algún momento se plantea cobrar a través de la LLC en nombre de terceros, eso es un modelo distinto (_merchant of record_) con su propio marco contractual. Para esta plataforma la LLC es simplemente el vendedor de su propio producto, que es el caso limpio.

---

## 6. Cumplimiento de la normativa de suscripciones en EE. UU.

Esta sección sustituye a las obligaciones del derecho de consumo europeo. Es el punto donde el modelo B se convierte en riesgo legal.

**Situación regulatoria actual.** La regla "Click-to-Cancel" de la FTC fue anulada por el Octavo Circuito en julio de 2025 por defectos de procedimiento, de modo que sus mandatos no están en vigor. Pero en marzo de 2026 la FTC lanzó un nuevo procedimiento (ANPRM) para revivirla, y ha señalado que los requisitos centrales seguirán siendo los mismos: divulgación clara y visible de los términos materiales, consentimiento expreso y afirmativo, y un mecanismo de cancelación sencillo. Mientras tanto, la FTC sigue actuando bajo ROSCA y la Sección 5 de la FTC Act, y alrededor de 30 estados tienen leyes de auto-renovación propias, algunas más estrictas que la regla federal anulada.

**Lo que hay que implementar desde el día 1** (cumple con ROSCA, con las ARL estatales y con la regla futura):

1. **Divulgación antes de pedir los datos de pago**, en el propio checkout y de forma destacada: "Hoy no se te cobra nada. El 13/09/2026, al terminar los 3 días de prueba, se te cobrarán $29,99/mes salvo que canceles antes. Puedes cancelar o cambiar a Pro ($14,99/mes) en dos clics desde tu cuenta."
2. **Consentimiento expreso e informado** para la renovación automática: casilla o botón que se refiera específicamente a ella, no enterrado en los términos generales.
3. **Cancelación online, por el mismo medio que el alta y al menos igual de fácil.** Si el alta es online en dos clics, la baja también. Esto es el Customer Portal de Stripe, sin email ni llamada.
4. **Email de confirmación inmediato** con la fecha exacta de renovación y el importe.
5. **Recordatorio 24 h antes del fin del trial** (webhook `trial_will_end`).
6. **En el flujo de cancelación, preguntar primero** si el usuario quiere oír alternativas antes de ofrecerle el downgrade o la pausa. Ofrecer retención sin preguntar es exactamente el tipo de fricción que la FTC considera injusta.
7. Conservar registro auditable del consentimiento (timestamp, IP, versión de los términos mostrada).

California es la referencia práctica: si el flujo cumple la ARL californiana, cumple en casi todas partes. Revisar el flujo con un abogado estadounidense de consumo antes de salir a producción; presupuestar $1.500-3.000.

---

## 7. Verificación pendiente

- Los precios de la competencia cambian con frecuencia y las fuentes secundarias se contradicen (QuillBot aparece con $9,95 y con $19,95 según fuente y fecha). Revisar las páginas oficiales de WriteHuman, Undetectable, QuillBot y TextGuardAI el mismo día del lanzamiento.
- El procedimiento de la FTC está abierto: comprobar el estado de la nueva regla antes de lanzar y de nuevo cada trimestre.
- Confirmar con el CPA la vía de facturación intercompañía **antes** de crear los productos en Stripe: cambiar el país de una cuenta de Stripe a posteriori obliga a abrir cuenta nueva y migrar clientes.
