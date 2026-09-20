# 00 · Contexto

## El producto

Verbalyx es un SaaS de escritura con IA en español: **humanizador, detector de IA, parafraseador y corrector**. Hecho para el español de España y LATAM, no traducido de una herramienta inglesa. Titularidad: YBB Solutions, LLC. Sitio: https://verbalyx.ai (bilingüe es/en).

La voz del producto es su mayor activo. Frases reales del sitio, para calibrar:

- «Humanizar no es un pase mágico por un detector.»
- «No lo prometemos, y desconfía de quien lo haga.»
- «Es menos vistoso y es más honesto.»
- «Entre dejar pasar un texto generado y señalar a alguien que escribió su trabajo, los dos errores no cuestan lo mismo.»

Cualquier texto que escribas tiene que poder convivir con esas frases. Sin superlativos, sin emoji, sin promesas.

## El repositorio

`rmoral/webai`, rama `main`. Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui estilo «new-york» con `baseColor: neutral` · Supabase · Drizzle · Stripe · Anthropic · Vercel.

Estructura relevante:

```
app/
  (marketing)/          layout.tsx (solo footer), page.tsx, precios/, humanizador-de-texto-ia/, legal/[slug]/
  (app)/                layout.tsx (cabecera), app/page.tsx, app/cuenta/page.tsx
  admin/page.tsx
  login/page.tsx
  auth/callback/, auth/finish/
  globals.css           ← todos los tokens
components/
  ui/                   button.tsx, card.tsx, badge.tsx, textarea.tsx
  tools/tool-editor.tsx ← el editor de dos paneles
  marketing/checkout-button.tsx
  app/delete-account-button.tsx
lib/
  ai/tools.ts           ← inventario de herramientas y modos
  billing/plans.ts      ← planes y límites
  billing/entitlements.ts
  usage/summary.ts
emails/
```

## Deriva importante: el sitio va por delante del repo

El repositorio tiene dos planes en euros (9,99 €/mes, 59,99 €/año) y tres herramientas marcadas «muy pronto». **El sitio en producción no.** Estado real:

| | Gratis | Pro | Ilimitado |
| --- | --- | --- | --- |
| Precio mensual | 0,00 US$ | 14,99 US$ | 29,99 US$ |
| Precio anual | — | 89,88 US$ (7,49/mes) | 179,88 US$ (14,99/mes) |
| Palabras/día | 500 | — | — |
| Palabras/mes | — | 60.000 | 500.000 |
| Palabras/petición | 300 | 3.000 | 8.000 |

Más: **anónimo** 300 palabras/día y 300 por petición, y una **recarga** de 9,99 US$ por 25.000 palabras que no caducan. Las cuatro herramientas están vivas. Precios en dólares, impuestos excluidos, calculados en el pago.

La fase 0 existe para corregir esa deriva. Si al abrir `lib/billing/plans.ts` ves algo distinto de esto, **para y pregunta** antes de sobrescribir.

## Qué hay que construir, en una frase

Un embudo honesto: el usuario topa con el límite en el momento en que le duele, entiende exactamente qué paga y cuándo, y paga sin salir de la página donde estaba trabajando.

## Los cinco problemas que resolvemos

1. **El muro actual es un párrafo pasivo** debajo del editor, siempre presente y por tanto invisible. No aparece cuando el usuario topa con el límite.
2. **El precio de cabecera y el de la divulgación no coinciden.** Hoy la tarjeta de Ilimitado dice «14,99 US$/mes» y el aviso legal dice «se te cobrarán 29,99 US$». Ninguna ruta hace que coincidan.
3. **No hay pantalla de registro con propuesta de valor**: `/login` es un formulario sin motivo para crear la cuenta.
4. **El pago sale del sitio**, justo después de enseñarle al usuario su resultado a medias.
5. **No hay aviso antes del primer cobro.** Es el origen del 80 % de las disputas del sector.

## Fases

| Fase | Qué | Archivo |
| --- | --- | --- |
| 0 | Planes y tokens | `01-TOKENS.md` |
| 1 | Primitivas: variantes de Button/Badge, Chip, QuotaBar, UpsellBanner | `02-COMPONENTES.md` |
| 2 | Muro de pago, cinco variantes, y su lógica de disparo | `03-PAYWALL.md` |
| 3 | Pago integrado: Stripe embebido, backend y webhooks | `04-PAGO.md` |
| 4 | Pantallas: registro, login, precios, checkout, confirmación | `05-PANTALLAS.md` |
| 5 | Correos transaccionales | `06-EMAILS.md` |
| 6 | QA y aceptación | `08-QA.md` |

El copy literal de todo está en `07-COPY.md`.
