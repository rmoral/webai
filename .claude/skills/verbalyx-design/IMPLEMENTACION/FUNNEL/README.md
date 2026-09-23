# Funnel · encargos D1–D6 → tickets C7–C14

Guía para Claude Code. Parte de `main` con C0–C6 hechos (comprobado el 23-09-2026 sobre `rmoral/webai@main`). Cada ticket dice qué archivo cambia, de dónde sale cada cifra, qué claves de `messages/es.json` se añaden o cambian y qué evento lleva.

| Encargo | Ticket | Guía | Diseño (en esta skill) |
| --- | --- | --- | --- |
| D1 · Cabecera de `/app` | C7 | `C7-C8.md` | `explorations/D1 Cabecera app.html`, `components/feedback/UsageMeter.*` |
| D3 · Límites en el editor | C8 | `C7-C8.md` | `explorations/D3 Limites editor.html`, `components/tools/LimitNotice.*`, `RunCost.*` |
| D2 · Precios | C9 (+ C12) | `C9-C13.md` | `explorations/D2 Precios.html`, `ui_kits/marketing/PricingPage.*` |
| D4 · Registro | C10 | `C9-C13.md` | `explorations/D4 Registro.html`, `ui_kits/auth/AuthPage.*` |
| — | C11, C12 | `C9-C13.md` | aparecen dentro de D1 y D2 |
| D5 · Invitación | C13 | `C9-C13.md` | `explorations/D5 Invitacion.html`, `components/feedback/SignupInvite.*` |
| D6 · Emails | C14 | `C14.md` | `explorations/D6 Emails.html`, `emails/*.html` |

Los `.jsx` de la skill son referencia visual y de copy, no código para copiar tal cual. El repo usa Tailwind y shadcn: traduce las clases `vbx-*` a utilidades con los tokens que ya están en `app/globals.css` (`bg-brand-soft`, `text-warning-ink`, `border-danger-line`…).

## Decisiones cerradas con producto (23-09-2026)

1. `/precios` se abre en **Anual**. La prueba se explica en una línea bajo el selector, que además cambia a mensual.
2. «Más popular» va en **Ilimitado**, en los dos ciclos. Producto confirma que hay datos que lo respaldan. Es la única insignia de la página: la de «Prueba 3 días» desaparece.
3. Prueba social: **palabras procesadas en total**, `sum(usage_daily.words_in)`. No hay testimonios.
4. Cabecera en Pro: «Este mes: X / 60.000 palabras» con barra, y «Pasar a Ilimitado» como enlace secundario.
5. Recarga diaria: se muestra el **tiempo que falta** («se recargan en 5 h»), no la hora del reloj.
6. Detector con saldo parcial: **botón desactivado** y la franja explica por qué, con salida a cuenta o a precios.
7. Los precios **llevan impuestos incluidos**. El FAQ y la nota de `/precios` ya lo dicen. **Los términos legales dicen lo contrario** (ver «Pendiente»).
8. Correos: **un solo botón**. «Cancelar» va como enlace de texto visible, nunca en el pie.
9. Remitente: `Verbalyx <hola@verbalyx.ai>`, que ya es el de `lib/email.ts`. Descriptor del extracto: `VERBALYX`.

## Incoherencias encontradas en `main` (arréglalas en el ticket indicado)

- **Términos frente a precios** (C9): `legal.terms.sections[«Precios e impuestos»]` dice que los precios «no incluyen impuestos». `pricing.taxNote`, `pricing.faq[4]` y `subscriptionParams` (IVA incluido) dicen que sí. Hay que reescribir la cláusula. Es texto legal: que lo revise quien lleve lo legal.
- **Detector recortado** (C8): en `app/api/ai/[tool]/route.ts`, `wanted = Math.min(submitted, ceiling)` también se aplica a `detect`. Así, un texto de 923 palabras se puntúa sobre las primeras 300. Es justo lo que el comentario de `reserveWords` llama «una puntuación equivocada sobre el texto entero». Propuesta: por encima del límite por petición, el detector responde `request_too_long` y la franja D3 lo dice. Si producto prefiere mantener el recorte, la franja lo tiene que decir («Analizaremos solo las primeras 300»).
- **«Dos meses gratis»** (C9): `pricing.twoMonthsFree` es falso. El descuento es del 50 %, es decir, seis meses.
- **`auth.signupTitle`** (C10) promete «historial de sesión», que es de pago.
- **`OverflowNotice`** (C8) enseña «300 / 300» en rojo mono sin decir qué es, y dice «Procesamos las primeras 300» aunque el saldo sea 0.
- **Números de cuatro cifras**: `Intl` en `es-ES` escribe «3000» sin punto (norma RAE) y «60.000» con punto. Es correcto: no metas «3.000» a mano en ningún texto.

## Pendiente de decidir (no bloquea)

- **Prueba repetida**: `trialDaysFor` no mira si la cuenta ya tuvo una prueba. Quien cancela en el día 2 puede empezar otra. Si se limita, la línea de D2 bajo el selector se oculta para esa cuenta.
- **Historial tras cancelar**: el correo de cancelación no dice qué pasa con los textos guardados, porque no hay política escrita. Cuando la haya, va una fila más en el bloque de datos.
- **Cifra de prueba social**: falta el número real y la fecha desde la que se cuenta. La franja no se publica sin los dos.
