# Fase 5 · Correos

Dos correos. Referencia: `emails/trial-confirmacion.html` y `emails/trial-recordatorio.html` de la skill — HTML listo, tradúcelo a React Email si el repo ya lo usa (`emails/welcome.tsx` sugiere que sí). Estimación: media jornada.

| Archivo | Cuándo | Asunto |
| --- | --- | --- |
| confirmación | inmediato, al iniciar la prueba | Tu prueba de Verbalyx empieza hoy — primer cobro el 21 de septiembre |
| recordatorio | **24 h antes del cobro** | Mañana se te cobran 29,99 US$ — cancela hoy si no quieres continuar |

## Reglas

- **Fecha e importe en bloque tintado, a 26 px.** Es el dato que evita la disputa, no una nota al pie.
- **Cancelar es un botón**, no un enlace escondido. En el recordatorio es uno de los dos CTA.
- El recordatorio nombra **las tres salidas**, incluida «no hagas nada».
- **Preheader con la cifra y la fecha**: mucha gente solo lee esa línea en la bandeja.
- HTML de tabla, estilos en línea, 600 px, una sola media query para móvil (< 600 px: botones apilados a ancho completo, titulares a 22 px).
- **Sin imágenes.** Nada se rompe si el cliente las bloquea.
- **Tipografía de sistema**, no Geist: las webfonts no son fiables en clientes de correo.
- El pie identifica a YBB Solutions, LLC y aclara que es un **aviso de facturación, no publicidad** — eso lo mantiene fuera de las reglas de marketing y de la baja obligatoria.
- Sin emoji, sin superlativos.

## El disparo del recordatorio

Ya avisado en `04-PAGO.md` y se repite porque es el error fácil: **`trial_will_end` de Stripe se dispara 3 días antes del final**, así que en una prueba de 3 días llega casi al crearla. No sirve.

Cron diario (Vercel Cron, protegido con `CRON_SECRET`):

```
suscripciones donde
  status = 'trialing'
  y trial_end entre ahora+24h y ahora+48h
  y trialReminderSentAt es null
→ enviar recordatorio, marcar trialReminderSentAt
```

Corre cada hora si quieres precisión; con una vez al día basta si aceptas una ventana de ±12 h.

## Tercer correo, recomendado

No estaba en el encargo, así que **no lo construyas sin preguntar**, pero anótalo: **pago fallido** (`invoice.payment_failed`). Sin él, una tarjeta caducada convierte a un cliente que paga en un usuario enfadado sin acceso y sin saber por qué.
