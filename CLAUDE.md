# Proyecto: Write AI en español (SaaS)

## Objetivo

Monetizar cuanto antes. Prioriza siempre: (1) flujo de pago funcionando, (2) herramienta funcionando en producción, (3) SEO, (4) todo lo demás.

## Stack

Next.js 15 App Router + TypeScript estricto · Tailwind + shadcn/ui · Supabase (Auth + Postgres, Drizzle ORM) · Stripe · Anthropic API (streaming, prompt caching) · Upstash · Resend · PostHog · Sentry · Vercel.

## Reglas

- Idioma de UI y textos: español neutro (evitar localismos salvo en landings por país). Código, comentarios y commits: inglés.
- Nunca hardcodear límites de planes en componentes: usar `lib/billing/plans.ts` y `lib/ai/tools.ts`.
- Todo gating de features pasa por `lib/billing/entitlements.ts`.
- Las llamadas a IA solo desde servidor (`app/api/ai/*` o Server Actions). Nunca exponer la API key.
- Endpoints de IA: siempre streaming, siempre con rate limit, siempre registrando uso en `usage_daily`.
- Webhooks de Stripe idempotentes (guardar `event.id`).
- No guardar texto de usuarios no-Pro. Guardar solo métricas.
- Server Components por defecto; `"use client"` solo cuando haga falta.
- Añadir test e2e (Playwright) para cualquier cambio en checkout, webhook o entitlements.
- Antes de crear una dependencia nueva, comprobar si shadcn/ui o la librería estándar lo cubren.
- Cada PR debe desplegar en preview de Vercel y pasar lint + typecheck + tests.

## Seguridad (ver SECURITY.md)

- Todo endpoint parsea su body con zod (`lib/security/validation.ts`) antes de cualquier otra cosa.
- Nunca persistir IPs en claro: usar `hashIp` de `lib/security/crypto.ts`.
- El texto de documentos Pro se cifra con `encryptText`/`decryptText` antes de tocar la base de datos.
- Toda tabla nueva lleva RLS con política deny-by-default en su migración.
- Protecciones anti-abuso (Turnstile, rate limit, cuotas) fail-closed en producción.
- Nunca `dangerouslySetInnerHTML` con contenido de usuario; nunca loggear texto de usuario (tampoco a Sentry/PostHog).
- Al añadir un script de terceros, ampliar la CSP en `next.config.ts`.

## Principios de código y coste

- Mínimo código: no crear abstracciones especulativas ni módulos "por si acaso"; cada archivo nuevo debe usarse en el mismo PR que lo crea. Preferir editar lo existente a añadir.
- Una sola fuente de verdad: si un dato/límite/config existe, se importa; nunca se duplica.
- Coste de computación: Server Components y páginas estáticas por defecto; mínimo JS en cliente; nada de polling — streaming o webhooks.
- Coste de IA: prompt caching siempre en system prompts; Haiku para textos < 150 palabras; cachear resultados idénticos por hash del input; truncar/rechazar entradas fuera de límite ANTES de llamar a la API; registrar coste por petición en `usage_daily`.

## Comandos

pnpm dev · pnpm build · pnpm lint · pnpm typecheck · pnpm test · pnpm test:e2e · pnpm db:generate · pnpm db:migrate · pnpm stripe:listen (stripe CLI → localhost:3000/api/stripe/webhook)

## Estructura

Ver PLAN_DESARROLLO_WRITE_AI.md sección 3.1.

## Definición de hecho

Funciona en producción, tiene evento PostHog, tiene manejo de error con Sentry, no rompe el flujo de pago.
