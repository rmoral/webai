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

## Comandos

pnpm dev · pnpm build · pnpm lint · pnpm typecheck · pnpm test · pnpm test:e2e · pnpm db:generate · pnpm db:migrate · pnpm stripe:listen (stripe CLI → localhost:3000/api/stripe/webhook)

## Estructura

Ver PLAN_DESARROLLO_WRITE_AI.md sección 3.1.

## Definición de hecho

Funciona en producción, tiene evento PostHog, tiene manejo de error con Sentry, no rompe el flujo de pago.
