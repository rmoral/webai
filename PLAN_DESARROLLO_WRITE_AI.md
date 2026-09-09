# PLAN DE DESARROLLO — Plataforma "Write AI" en español

> Documento de trabajo para Claude Code. Objetivo: lanzar una web SaaS de escritura con IA (humanizador, detector, parafraseador, corrector académico) orientada al mercado hispanohablante y **cobrar la primera suscripción en menos de 6 semanas**.
>
> Nombre de trabajo: `escribia` (sustituir por el dominio definitivo cuando exista). Idioma del producto: español (ES + LATAM). Idioma del código y commits: inglés.

---

## 0. Resumen ejecutivo (leer antes de tocar código)

| Qué | Decisión |
|---|---|
| Tipo de producto | Web app SaaS freemium con suscripción mensual/anual |
| Mercado | España + LATAM, estudiantes universitarios, opositores, redactores, marketing |
| Features MVP (semana 1-3) | Humanizador · Detector IA · Parafraseador · Corrector |
| Monetización | Stripe Checkout + Customer Portal. Gratis: 300 palabras/día. Pro: 9,99 €/mes o 59,99 €/año |
| Stack | Next.js 15 (App Router, TS) · Tailwind + shadcn/ui · Supabase (Postgres + Auth) · Stripe · Anthropic API · Vercel |
| Principio rector | Cada sprint termina con algo desplegado en producción. No se construye nada que no acerque al primer pago |

Evidencia de mercado (datos de Google Ads de competidores, mayo 2026): Quillbot recupera 1,45× la inversión publicitaria en la primera compra; JustDone opera con objetivo ROAS 105-130 %; Textguard gasta 76 K €/mes solo en España; ZeroGPT compra keywords "detector IA" en español a 0,01-0,02 $ de CPC. Hay demanda hispana y los incumbentes son productos en inglés traducidos.

---

## 1. Alcance del producto

### 1.1 Features MVP (obligatorias para lanzar)

1. **Humanizador** — reescribe texto generado por IA para que suene natural y humano, conservando significado, longitud aproximada y registro (académico / neutro / informal). Es la feature que más convierte en el sector.
2. **Detector de IA** — devuelve probabilidad de que un texto sea generado por IA + resaltado por frases. Es el principal gancho de adquisición (tráfico gratuito, keywords baratas).
3. **Parafraseador** — modos: estándar, fluido, formal, simple, creativo, académico.
4. **Corrector** — ortografía, gramática, estilo y explicación de cada corrección. Variante: "corrector académico" (normas RAE, conectores, evitar redundancias).

### 1.2 Features v1.1 (semanas 5-8, tras primeros ingresos)

- Resumidor y generador de esquemas
- Generador de citas y bibliografía (APA 7, MLA, Chicago, ISO 690)
- Traductor con conservación de tono
- Extensión de Chrome (reutiliza la API)
- Historial de documentos y editor con guardado

### 1.3 Fuera de alcance (no construir sin validar demanda)

Generación de imágenes, app móvil nativa, equipos/seats, marketplace de plantillas, integraciones con LMS.

---

## 2. Stack técnico y herramientas

### 2.1 Aplicación

| Capa | Herramienta | Motivo |
|---|---|---|
| Framework | **Next.js 15** (App Router) + TypeScript | SSR para SEO, Server Actions para llamadas a IA, un solo repo |
| UI | **Tailwind CSS + shadcn/ui** | Velocidad. Componentes accesibles sin diseñar desde cero |
| Estado servidor | React Server Components + `@tanstack/react-query` para cliente | Simplicidad |
| Base de datos + Auth | **Supabase** (Postgres, Auth con Google + email magic link, RLS) | Auth gratis, Postgres gestionado, tier gratuito suficiente para MVP |
| ORM | **Drizzle ORM** | Tipado, migraciones ligeras, funciona bien con Supabase |
| Pagos | **Stripe** (Checkout, Customer Portal, Webhooks) | Estándar. Gestiona IVA UE con Stripe Tax |
| IA | **Anthropic API** (Claude Sonnet por defecto; Haiku para tareas cortas) + **OpenAI API** como segundo proveedor detrás de la misma interfaz `provider.ts`. Selección por herramienta en `lib/ai/tools.ts`; fallback automático si un proveedor falla o supera latencia | Calidad en español, streaming, prompt caching, sin dependencia única |
| Detector IA | Fase 1: ensemble propio con ambos proveedores (puntuación por frase de Claude y GPT, promedio ponderado) + opcionalmente API externa (GPTZero / Sapling) si el presupuesto lo permite. Fase 2: clasificador propio | No construir un detector desde cero antes de facturar |
| Email transaccional | **Resend** + React Email | Bienvenida, recibo, fin de trial |
| Rate limiting | **Upstash Redis** (`@upstash/ratelimit`) | Cuotas del plan gratuito y anti-abuso |
| Anti-bot | **Cloudflare Turnstile** en formularios públicos | Evitar scraping del detector gratuito |
| Analítica producto | **PostHog** (eventos, funnels, feature flags) | Medir trial → pago |
| Errores | **Sentry** | Obligatorio antes de lanzar |
| Hosting | **Vercel** (Pro) | Deploy por PR, edge, cron |
| DNS/CDN | **Cloudflare** | Dominio, WAF, cache |
| Testing | Vitest (unit) · Playwright (e2e del flujo de pago) | Solo tests del camino crítico |
| CI | GitHub Actions: lint + typecheck + tests + deploy preview | |

### 2.2 Herramientas de negocio

- Google Search Console + Google Ads (conversión de compra vía Stripe webhook → gtag / API de conversiones)
- Google Tag Manager + Consent Mode v2 (obligatorio en UE)
- Crisp o Tawk.to para chat de soporte (gratis)
- Notion/Linear para backlog (Claude Code puede leer issues de GitHub directamente)

### 2.3 Variables de entorno (crear `.env.example`)

```
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
AI_DEFAULT_PROVIDER=anthropic   # anthropic | openai
AI_DETECTOR_PROVIDER=ensemble  # ensemble | gptzero | sapling
AI_DETECTOR_API_KEY=           # solo si se usa API externa
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_YEARLY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
RESEND_API_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
SENTRY_DSN=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

---

## 3. Arquitectura

### 3.1 Estructura del repositorio

```
/
├── CLAUDE.md                  # instrucciones para Claude Code (ver sección 9)
├── app/
│   ├── (marketing)/           # landing, /humanizador, /detector-ia, /parafrasear, /corrector, /precios, /blog
│   ├── (app)/                 # dashboard autenticado: /app, /app/historial, /app/cuenta
│   ├── api/
│   │   ├── ai/[tool]/route.ts # endpoint unificado de herramientas (streaming)
│   │   ├── stripe/webhook/route.ts
│   │   └── stripe/checkout/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                    # shadcn
│   ├── tools/                 # ToolEditor, DiffView, DetectorGauge, UsageMeter
│   └── marketing/
├── lib/
│   ├── ai/
│   │   ├── provider.ts        # abstracción sobre Anthropic
│   │   ├── prompts/           # humanize.ts, detect.ts, paraphrase.ts, correct.ts
│   │   ├── detector/          # adapters: gptzero.ts, sapling.ts, internal.ts
│   │   └── tools.ts           # registro de herramientas: nombre, límite palabras, coste, plan mínimo
│   ├── billing/               # stripe.ts, plans.ts, entitlements.ts
│   ├── usage/                 # quotas.ts (Upstash), tracking.ts
│   ├── db/                    # schema.ts (drizzle), client.ts, migrations/
│   └── auth/                  # supabase server/client helpers, getSession
├── emails/                    # React Email templates
├── content/blog/              # MDX para SEO
├── tests/
└── scripts/                   # seed, sync-stripe-prices
```

### 3.2 Flujo de una herramienta (ej. humanizar)

```
Cliente (ToolEditor)
  → POST /api/ai/humanize  { text, mode }
  → middleware: auth opcional, Turnstile si anónimo, rate limit por IP/usuario
  → entitlements.check(user, tool, wordCount)   # plan, cuota diaria, límite por petición
  → provider.stream(prompt(text, mode))          # Anthropic, streaming SSE
  → usage.record(user, tool, wordsIn, wordsOut, tokens, cost)
  ← stream de texto al cliente; al terminar, DiffView original/resultado
```

Reglas:
- Usuario anónimo: 300 palabras/día por IP, sin historial. Se le pide email al agotar.
- Usuario gratuito registrado: 500 palabras/día, 1 herramienta a la vez.
- Pro: 10 000 palabras/petición, sin límite diario razonable (soft cap 150 K/mes para controlar coste).
- Todos los límites viven en `lib/ai/tools.ts` y `lib/billing/plans.ts`, nunca hardcodeados en UI.

### 3.3 Modelo de datos (Drizzle / Postgres)

```
users            id, email, name, locale, created_at
subscriptions    id, user_id, stripe_customer_id, stripe_subscription_id, plan (free|pro), status, current_period_end, cancel_at_period_end
usage_daily      user_id (o ip_hash), date, tool, words_in, words_out, requests, cost_cents   [PK: user/ip + date + tool]
documents        id, user_id, tool, title, input_text, output_text, mode, created_at         [solo Pro]
detections       id, user_id/ip_hash, ai_probability, sentence_scores jsonb, provider, created_at
events           id, user_id, name, props jsonb, created_at   [espejo mínimo de PostHog para atribución de Ads]
```

RLS activado: cada usuario solo lee sus filas. El service role solo se usa en webhooks y cron.

### 3.4 Prompts (principios; el texto completo va en `lib/ai/prompts/`)

- **Humanizador**: system prompt con instrucciones de estilo en español (variar longitud de frase, evitar conectores típicos de IA — "en resumen", "es importante destacar", "en el mundo actual" —, usar contracciones naturales, mantener terminología técnica, no añadir información). Parámetro `register`: académico / neutro / informal. Salida: solo el texto reescrito, sin preámbulos.
- **Detector** (ensemble interno): pedir a Claude y a GPT, en paralelo, puntuación 0-100 por frase con criterios explícitos (perplejidad percibida, uniformidad, muletillas). Score = media de ambos; si discrepan > 30 puntos, marcar la frase como "incierta". Marcar claramente en UI que es orientativo. Si se añade API externa: score = 0,5·externo + 0,5·ensemble.
- **Parafraseador**: un prompt por modo, con ejemplos few-shot en español de España y de LATAM.
- **Corrector**: salida JSON estructurada `{ corrected, changes: [{ original, replacement, type, explanation }] }` para pintar el diff con explicaciones.
- Usar **prompt caching** en los system prompts (son largos y fijos) y **Haiku** para textos < 150 palabras en el corrector.

---

## 4. Monetización y pagos

### 4.1 Planes

| Plan | Precio | Límites | Objetivo |
|---|---|---|---|
| Gratis | 0 € | 500 palabras/día, 1 herramienta, con marca de agua "Generado con…" en el detector | Adquisición y SEO |
| Pro mensual | 9,99 €/mes (IVA incl.) | 10 K palabras/petición, todas las herramientas, historial, sin anuncios | Ingreso principal |
| Pro anual | 59,99 €/año (≈ 5 €/mes) | Igual que Pro | Bajar churn, mejorar cash flow |
| Estudiante (v1.1) | 4,99 €/mes con email .edu/.es universitario | Igual que Pro | Segmento núcleo en España |

Precios para LATAM (v1.1): usar **Stripe Adaptive Pricing** o precios en USD por país (MX, CO, AR, CL, PE) 30-50 % más bajos.

### 4.2 Implementación Stripe (orden de tareas)

1. Crear productos y precios en Stripe (test mode) → script `scripts/sync-stripe-prices.ts` que vuelca los price IDs a `.env`.
2. `POST /api/stripe/checkout` → Stripe Checkout en modo `subscription`, con `client_reference_id = user.id`, `allow_promotion_codes`, Stripe Tax activado, **trial de 3 días con tarjeta obligatoria** (`payment_method_collection: 'always'`). Decisión cerrada: sin trial gratuito sin tarjeta.
3. Webhook `/api/stripe/webhook` que procesa: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. Idempotencia por `event.id`.
4. Customer Portal para cambiar plan / cancelar (evita soporte manual).
5. `entitlements.ts`: única función `getPlan(userId)` que lee `subscriptions` y devuelve límites. Todo el gating pasa por aquí.
6. Email de recibo, aviso de trial a 24 h del fin, recuperación de pago fallido (dunning de Stripe activado).
7. Test e2e con Playwright: registro → agotar cuota → checkout (tarjeta test) → webhook → herramienta desbloqueada.

### 4.3 Muros de pago (dónde se dispara la conversión)

- Contador de palabras visible siempre ("Te quedan 120 palabras hoy").
- Al superar el límite: modal con resultado parcialmente borroso + CTA "Desbloquea el texto completo con Pro".
- Detector gratuito: muestra el % global gratis, el resaltado por frase es Pro.
- Humanizador gratuito: muestra las primeras 150 palabras del resultado.
- Precio anual preseleccionado en la página de precios.

---

## 5. Adquisición: SEO y Ads desde el día 1

### 5.1 Páginas de aterrizaje por herramienta (SSR, indexables, cada una con la herramienta funcionando arriba)

- `/humanizador-de-texto-ia`
- `/detector-de-ia` (+ variantes: `/detector-chatgpt`, `/detector-de-ia-gratis`)
- `/parafrasear-texto`
- `/corrector-ortografico-gramatical`
- `/precios`
- Landings por país en v1.1: `/mx/`, `/co/`, `/ar/` con `hreflang`.

Cada landing: H1 con keyword, herramienta embebida, 600-900 palabras de contenido útil, FAQ con schema `FAQPage`, `SoftwareApplication` schema, comparativa "vs Quillbot / vs ZeroGPT".

### 5.2 Blog (MDX en `content/blog/`)

10 artículos iniciales generados con IA y revisados a mano, keywords de cola larga: "cómo humanizar texto de ChatGPT", "detectores de IA que usan las universidades", "cómo parafrasear sin plagio", "conectores para TFG", etc.

### 5.3 Google Ads (presupuesto inicial 100-150 €/día)

- Campaña Search ES: keywords exactas y de frase: "humanizar texto ia", "detector de ia", "parafrasear texto", "corrector de texto online", "quillbot español".
- Conversión principal: `purchase` (enviada desde el webhook de Stripe con `gclid` guardado en `events`). Conversión secundaria: `signup`.
- Estrategia de puja: Maximizar conversiones las 2 primeras semanas → tCPA 20 € cuando haya 30+ compras.
- Implementar **Google Consent Mode v2** con banner de cookies (obligatorio UE).

---

## 6. Legal y cumplimiento (España / UE) — hacer antes del primer cobro

- **Aviso legal, Política de privacidad, Términos, Política de cookies** (generar plantillas y revisar con abogado; presupuestar 300-600 €).
- **RGPD**: base legal (contrato + interés legítimo), registro de tratamientos, DPA con Supabase, Anthropic, Stripe, Vercel, PostHog. Botón "Eliminar mi cuenta y datos" funcional.
- **Retención de textos**: por defecto, no guardar el texto de usuarios anónimos ni gratuitos; solo hash. Pro guarda historial con opción de desactivar.
- **Datos a Anthropic**: informar en privacidad de que los textos se procesan mediante API de terceros; no se usan para entrenar.
- **Cookies**: Consent Mode v2, PostHog en modo cookieless hasta consentimiento.
- **Ley de servicios digitales / consumo**: derecho de desistimiento 14 días en digital (mostrar renuncia explícita al activar Pro inmediatamente), IVA por país vía Stripe Tax, facturas automáticas.
- **Detector de IA**: disclaimer visible: "resultado orientativo, no debe usarse como única prueba". Evitar en Ads afirmaciones de precisión no verificables (política de Google).
- **Alta de autónomo / sociedad, epígrafe IAE, alta en ROI (VIES) para IVA intracomunitario con Stripe/Vercel/Anthropic.**

---

## 7. Plan de sprints (6 semanas hasta primer pago, 8 hasta v1.1)

### Sprint 0 — Día 1-2: cimientos
- [ ] Repo, Next.js 15 + TS + Tailwind + shadcn, ESLint/Prettier, Husky
- [ ] Supabase proyecto, Auth (Google + magic link), Drizzle schema + migración inicial
- [ ] Vercel + dominio + Cloudflare, deploy vacío en producción
- [ ] `CLAUDE.md`, `.env.example`, GitHub Actions (lint, typecheck)
- [ ] Sentry + PostHog instalados

### Sprint 1 — Semana 1: primera herramienta en producción
- [ ] `lib/ai/provider.ts` con streaming y prompt caching
- [ ] Humanizador end-to-end: prompt, endpoint, `ToolEditor` con streaming y `DiffView`
- [ ] Cuotas anónimo/gratis con Upstash + Turnstile
- [ ] Landing `/humanizador-de-texto-ia` indexable
- **Entregable:** cualquiera puede humanizar 300 palabras gratis en producción

### Sprint 2 — Semana 2: cobrar
- [ ] Stripe productos, checkout, webhook, portal, `entitlements.ts`
- [ ] Página `/precios`, muros de pago, contador de palabras
- [ ] Emails: bienvenida, recibo, fin de trial (Resend)
- [ ] Test e2e del flujo de pago
- [ ] Legal mínimo publicado (términos, privacidad, cookies con Consent Mode)
- **Entregable:** primer pago real posible (poner en live mode)

### Sprint 3 — Semana 3: completar MVP
- [ ] Detector IA (adapter externo + fallback interno), `DetectorGauge` y resaltado por frase
- [ ] Parafraseador con modos, Corrector con JSON de cambios
- [ ] Landings de las 3 herramientas + FAQ schema
- [ ] Dashboard `/app` con selector de herramienta, `/app/cuenta`
- **Entregable:** 4 herramientas, 4 landings, pago activo

### Sprint 4 — Semana 4: lanzar y comprar tráfico
- [ ] Google Ads: campaña Search ES, conversiones desde webhook con `gclid`
- [ ] Search Console, sitemap, robots, Open Graph
- [ ] 10 artículos de blog
- [ ] Onboarding: tour de 3 pasos, email día 2 y día 5
- [ ] Panel interno `/admin` (solo owner): usuarios, MRR, coste de IA por usuario, uso por herramienta
- **Entregable:** tráfico de pago corriendo, métricas visibles

### Sprint 5-6 — Semanas 5-6: optimizar conversión
- [ ] A/B con PostHog flags: precio 7,99 vs 9,99; trial 3 días vs sin trial; muro al 50 % vs al 100 %
- [ ] Historial de documentos (Pro)
- [ ] Recuperación de carritos: email si abre checkout y no paga
- [ ] Ajustar prompts según quejas (calidad = retención)
- **Objetivo:** CAC < 20 €, conversión gratis→Pro ≥ 2,5 %, primer MRR de 500-1 000 €

### Sprint 7-8 — Semanas 7-8: v1.1
- [ ] Resumidor, citas APA, traductor
- [ ] Plan Estudiante y precios LATAM
- [ ] Extensión Chrome (Manifest V3, reutiliza `/api/ai`)
- [ ] Landings por país con `hreflang`

---

## 8. Métricas y costes

### 8.1 KPIs a instrumentar en PostHog desde el sprint 1

`tool_used` (tool, words, plan) · `quota_hit` · `paywall_shown` · `checkout_started` · `purchase` · `subscription_cancelled` · `detector_result` (score bucket)

Funnel objetivo: visita → uso herramienta (≥ 35 %) → registro (≥ 10 % de usuarios) → Pro (≥ 2,5 % de registrados) · churn mensual < 12 % · margen bruto > 80 %.

### 8.2 Estimación de coste de IA

Con prompt caching y Sonnet, 1 000 palabras humanizadas ≈ 2 500 tokens entrada + 1 500 salida. Un usuario Pro activo (30 K palabras/mes) cuesta aproximadamente 0,40-0,80 € /mes en API; verificar con los precios vigentes en la documentación de Anthropic y ajustar el soft cap. Alertas en `/admin` si un usuario supera 2 € de coste mensual.

### 8.3 Costes fijos mensuales estimados (MVP)

Vercel Pro 20 $ · Supabase Pro 25 $ · Upstash ~10 $ · Resend 20 $ · Sentry 26 $ · PostHog 0-50 $ · dominio/Cloudflare 2 $ · API detector externo 30-100 $ · **≈ 150-250 €/mes** + IA variable + Ads.

---

## 9. `CLAUDE.md` (copiar en la raíz del repo)

```markdown
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
```

---

## 10. Cómo trabajar con Claude Code sobre este plan

1. Copiar este archivo y `CLAUDE.md` a la raíz del repo antes del primer prompt.
2. Ir sprint a sprint. Prompt de arranque sugerido:

   > "Lee PLAN_DESARROLLO_WRITE_AI.md y CLAUDE.md. Ejecuta el Sprint 0 completo: inicializa el proyecto con la estructura de la sección 3.1, configura Supabase Auth y el schema Drizzle de la sección 3.3, y deja un deploy vacío listo. Confirma cada decisión no cubierta por el plan antes de tomarla."

3. Pedir siempre un plan antes de la implementación en tareas grandes (`/plan` o "propón el plan antes de escribir código").
4. Al terminar cada sprint: "Revisa que se cumple la definición de hecho del CLAUDE.md para todo lo implementado en este sprint y lista lo que falta."
5. Mantener un `CHANGELOG.md` y un `DECISIONS.md` (ADRs cortos) que Claude Code actualice; evita repetir decisiones entre sesiones.

---

## 11. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Calidad del humanizador insuficiente frente a detectores (Turnitin, GPTZero) | Iterar prompts con un set de evaluación de 50 textos; medir con la API externa antes de cada release |
| Coste de IA se dispara con usuarios abusivos | Soft cap mensual, alertas, Haiku para textos cortos, caché de resultados idénticos (hash del input) |
| Google Ads rechaza anuncios del detector | No prometer precisión; texto orientativo; landings con disclaimer |
| Dependencia de un proveedor de IA | `provider.ts` abstrae Anthropic y OpenAI desde el MVP con fallback automático |
| Churn alto | Plan anual por defecto, historial y extensión Chrome como razones para quedarse, email de reactivación |
| Competencia baja precios | Diferenciar por español nativo (RAE, TFG, oposiciones, LATAM) y soporte en español |
