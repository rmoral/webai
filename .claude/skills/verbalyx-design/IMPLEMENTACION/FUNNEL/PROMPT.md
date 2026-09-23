# Prompt para Claude Code — funnel C7–C14

Copia esto en Claude Code, con el repo `rmoral/webai` abierto en `main`.

---

Vas a implementar los tickets C7 a C14 del plan de funnel (`00-plan.md`). C0–C6 ya están en `main`. La skill de diseño está en `.claude/skills/verbalyx-design/`.

**Paso 0 · Actualiza la skill.** La copia del repo es anterior al 19-09-2026 (todavía trae `ScoreGauge`). Sustituye la carpeta entera `.claude/skills/verbalyx-design/` por la versión nueva que te paso (el zip del proyecto de diseño), sin `uploads/` ni `screenshots/`, en un commit aparte: `chore(skill): sync verbalyx-design 2026-09-23`. Comprueba que `components/tools/ScoreGauge.*` y `components/tools/score.card.html` desaparecen.

**Paso 1 · Lee, en este orden:**
1. `IMPLEMENTACION/FUNNEL/README.md`: decisiones cerradas, incoherencias de `main` y pendientes.
2. `IMPLEMENTACION/FUNNEL/C7-C8.md`, `C9-C13.md` y `C14.md`.
3. Para cada ticket, abre su exploración en `explorations/` (D1–D6) y el `.jsx` de referencia. Son diseño, no código de producción: tradúcelos a Tailwind + shadcn con los tokens de `app/globals.css`.

**Paso 2 · Implementa en este orden, un PR por ticket:** C8 → C7 → C9 (+ C12 en precios) → C10 → C11 → C12 → C13 → C14.
- C8 va antes que C7 porque define de dónde sale `remaining`, que la cabecera también usa.
- C9 cambia el ciclo por defecto: actualiza `checkout.spec.ts` y `screens.spec.ts` en el mismo PR.

**Reglas que no se negocian** (vienen de `CLAUDE.md` y del plan):
- Ninguna cifra escrita en un componente: todo sale de `lib/billing/plans.ts`, `peekWords`, `getSubscriber` o Stripe.
- Ningún estado borra ni modifica el texto del editor.
- Nada de modales nuevos. Nada de `setInterval` ni de polling.
- Copy en español, desde `messages/es.json`. En `en.json`, deja la clave con el texto en inglés marcado como `TODO(copy-en)`: el inglés necesita redacción nativa, no traducción.
- Cada ticket lleva su evento de `lib/analytics/events.ts`, y su test e2e si toca el checkout, el webhook o los entitlements.
- Verifica con una pasada anónima y otra con sesión, en móvil (390 px) y en escritorio.

**Antes de C8, pregúntame** por el detector por encima del límite por petición (rechazar o recortar), porque cambia `app/api/ai/[tool]/route.ts`.

**Antes de C9, pregúntame** por la cláusula «Precios e impuestos» de `legal.terms`: es texto legal.
