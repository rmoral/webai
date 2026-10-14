repo: rmoral/webai
branch: main

## Last sync

date: 2026-10-13T09:58:00Z

### Updated in this project

- F1 (landing de Ads, /precios y muro) diseñado a 390 y 1440 y validado con producto el 13-10. Guía en `IMPLEMENTACION/FUNNEL/F1.md`.
- La prueba de 3 días pasa también al plan anual; nuevos correos `03c` y `04b`; cifras en el formato «US$14,99».
- Paquete `export/verbalyx-design-2026-10-13.zip` y `PROMPT-CLAUDE-CODE-F1.md` para sincronizar la skill en el repo.

## Sync history

- 2026-09-23T13:47:38Z — D1–D6 del funnel y guía C7–C14.
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
| `explorations/F1 Landing *.html` | `components/tools/tool-landing.tsx`, `components/tools/tool-editor.tsx`, `app/[locale]/(marketing)/layout.tsx` |
| `explorations/F1 Precios *.html` | `components/marketing/pricing-plans.tsx`, `lib/billing/plans.ts` |
| `explorations/F1 Muro.html` | `components/billing/paywall.tsx` |
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
