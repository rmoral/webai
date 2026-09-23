repo: rmoral/webai
branch: main

## Last sync

date: 2026-09-23T13:47:38Z

### Updated in this project

- D1–D6 del funnel diseñados sobre `main` (C0–C6 ya en el repo): `UsageMeter`, `LimitNotice`, `RunCost`, `SignupInvite`, `PricingPage` y `AuthPage` rehechos, y siete correos.
- Guía por ticket C7–C14 en `IMPLEMENTACION/FUNNEL/`, con claves de `messages/es.json`, fuentes de datos y eventos.
- La copia de `.claude/skills/verbalyx-design/` en el repo está desfasada (anterior al 19-09, con `ScoreGauge`): sustituirla por este proyecto (ver `IMPLEMENTACION/FUNNEL/PROMPT.md`, paso 0).
- Incoherencias de `main` señaladas: términos legales frente a impuestos incluidos, el detector recortado a 300, «Dos meses gratis» y «historial de sesión».

## Sync history

- 2026-09-19T00:00:00Z — registro/login, muro de pago en cinco variantes, pago integrado, precios con toggle, `ScoreGauge` → `EvidenceBand`.
- 2026-09-15T06:40:00Z — marca azul #2b45c4 y escala semántica; ToolTabs, Chip, Highlight, ScoreGauge, QuotaBar, UpsellBanner; kits con cabecera y pestañas.
- 2026-09-15T06:13:07Z — first import: tokens from `app/globals.css`, the four `components/ui` primitives, ToolEditor, three UI kits, `favicon.ico`.

## Screen map

| Project screen | Repo files |
| --- | --- |
| `components/feedback/UsageMeter.jsx` (D1) | `app/[locale]/(app)/layout.tsx`, `components/billing/quota-bar.tsx`, `lib/usage/quotas.ts` |
| `components/tools/LimitNotice.jsx`, `RunCost.jsx` (D3) | `components/tools/overflow.tsx`, `components/tools/tool-editor.tsx`, `app/api/ai/[tool]/route.ts` |
| `ui_kits/marketing/PricingPage.jsx` (D2) | `app/[locale]/(marketing)/pricing/page.tsx`, `components/marketing/pricing-plans.tsx`, `lib/billing/plans.ts` |
| `ui_kits/auth/AuthPage.jsx` (D4) | `components/auth/auth-form.tsx`, `app/[locale]/signup/page.tsx` |
| `components/feedback/SignupInvite.jsx` (D5) | `components/tools/tool-editor.tsx`, `lib/analytics/events.ts` |
| `emails/*.html` (D6) | `emails/layout.tsx`, `emails/subscription-confirmation.tsx`, `emails/trial-reminder.tsx`, `lib/billing/notify.ts`, `lib/email.ts` |
| `ui_kits/marketing/MarketingHome.jsx` | `app/[locale]/(marketing)/page.tsx`, `lib/ai/tools.ts` |
| `ui_kits/marketing/MarketingFooter.jsx` | `app/[locale]/(marketing)/layout.tsx` |
| `ui_kits/app/AppShell.jsx` | `app/[locale]/(app)/layout.tsx`, `lib/auth/admin.ts` |
| `ui_kits/app/AppToolPage.jsx` | `components/tools/tool-editor.tsx` |
| `ui_kits/app/AppAccount.jsx` | `app/[locale]/(app)/app/account/page.tsx` |
| `ui_kits/admin/AdminBackoffice.jsx` | `app/[locale]/admin/page.tsx`, `lib/usage/summary.ts` |
| `ui_kits/checkout/*` | `app/[locale]/(marketing)/checkout/*`, `components/billing/checkout.tsx`, `payment-form.tsx` |
| `components/billing/*` | `components/billing/paywall.tsx`, `trial-end.tsx` |
| `components/core/*`, `components/forms/*`, `components/surfaces/*` | `components/ui/*` |
| `components/navigation/ToolTabs.jsx` | `components/navigation/tool-tabs.tsx` |
| `components/tools/EvidenceBand.jsx` | `components/tools/detector-result.tsx` |
| `tokens/*.css` | `app/globals.css` |
