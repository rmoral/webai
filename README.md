# Verbalyx — Write AI en español

SaaS de escritura con IA para el mercado hispanohablante: humanizador, detector de IA, parafraseador y corrector.

- **Plan de desarrollo:** [PLAN_DESARROLLO_WRITE_AI.md](./PLAN_DESARROLLO_WRITE_AI.md)
- **Precios y Stripe (vigente):** [ESTUDIO_PRECIOS_Y_CONFIG_STRIPE_USD.md](./ESTUDIO_PRECIOS_Y_CONFIG_STRIPE_USD.md)
- **Reglas para Claude Code:** [CLAUDE.md](./CLAUDE.md)

## Stack

Next.js 15 (App Router, TypeScript) · Tailwind CSS 4 + shadcn/ui · Supabase (Auth + Postgres) · Drizzle ORM · Stripe · Anthropic API · Vercel.

## Desarrollo

```bash
pnpm install
cp .env.example .env.local   # rellenar credenciales
pnpm dev
```

## Comandos

| Comando                                              | Qué hace                            |
| ---------------------------------------------------- | ----------------------------------- |
| `pnpm dev`                                           | Servidor de desarrollo              |
| `pnpm build`                                         | Build de producción                 |
| `pnpm lint` / `pnpm typecheck` / `pnpm format:check` | Calidad de código                   |
| `pnpm test`                                          | Tests unitarios (Vitest)            |
| `pnpm test:e2e`                                      | Tests e2e (Playwright)              |
| `pnpm db:generate` / `pnpm db:migrate`               | Migraciones Drizzle                 |
| `pnpm stripe:listen`                                 | Reenviar webhooks de Stripe a local |

## Productos de Stripe

GitHub → **Actions → Sync Stripe products → Run workflow** crea (o actualiza) los productos, precios y metadata del estudio de precios. Requiere el secreto `STRIPE_SECRET_KEY`. Los precios se resuelven por `lookup_key`, así que no hay ids que copiar a ninguna variable.

## Migraciones en producción

No hace falta terminal: en GitHub → **Actions → Migrate database → Run workflow**. Requiere el secreto de repositorio `DATABASE_URL` (cadena del _Session pooler_ de Supabase, puerto 5432).

## Variables obligatorias en producción

Estas tres no son opcionales: sin ellas las peticiones **anónimas** fallan, aunque
las de usuarios con sesión funcionen, así que el fallo pasa desapercibido en las
pruebas y solo lo sufre el tráfico de captación.

| Variable                            | Por qué                                                    | Si falta                                         |
| ----------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| `IP_HASH_SECRET`                    | Identifica al visitante anónimo sin guardar su IP en claro | Toda petición anónima a `/api/ai/*` responde 500 |
| `UPSTASH_REDIS_REST_URL` + `_TOKEN` | Cuotas y límite de ráfaga                                  | Igual: las protecciones fallan cerradas          |
| `TURNSTILE_SECRET_KEY`              | Anti-bot en endpoints públicos                             | Toda petición anónima responde 403               |

`openssl rand -base64 32` genera las dos claves locales.

## Servicios externos (pendientes de conectar)

El código está listo, pero requieren crear cuentas y rellenar `.env.local` / variables en Vercel: Supabase, Stripe, Upstash, Resend, PostHog, Sentry, Turnstile. Ver sección 2.3 del plan.
