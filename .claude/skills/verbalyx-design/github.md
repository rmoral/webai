repo: rmoral/webai
branch: main

## Last sync

date: 2026-09-15T06:40:00Z

### Updated in this project

- Added a brand blue (#2b45c4) and a semantic green/amber/red scale on top of the repo's achromatic tokens.
- New components: ToolTabs, Chip, Highlight, ScoreGauge, QuotaBar, UpsellBanner.
- Marketing and app kits rebuilt with a real header, tool tabs and a homepage editor.
- Detector de IA screen designed (no upstream UI); `/app` card grid dropped in favour of tabs.

## Sync history

- 2026-09-15T06:13:07Z — first import: tokens from `app/globals.css`, the four `components/ui` primitives, ToolEditor, three UI kits, `favicon.ico`. No logo or brand imagery exists upstream.

## Screen map

| Project screen | Repo files |
| --- | --- |
| `ui_kits/marketing/MarketingHome.jsx` | `app/(marketing)/page.tsx`, `lib/ai/tools.ts` |
| `ui_kits/marketing/HumanizerLanding.jsx` | `app/(marketing)/humanizador-de-texto-ia/page.tsx` |
| `ui_kits/marketing/PricingPage.jsx` | `app/(marketing)/precios/page.tsx`, `lib/billing/plans.ts`, `components/marketing/checkout-button.tsx` |
| `ui_kits/marketing/MarketingFooter.jsx` | `app/(marketing)/layout.tsx` |
| `ui_kits/app/AppLogin.jsx` | `app/login/page.tsx` |
| `ui_kits/app/AppShell.jsx` | `app/(app)/layout.tsx`, `lib/auth/admin.ts` |
| `ui_kits/marketing/SiteHeader.jsx` | new Sept 2026 (no upstream header) |
| `ui_kits/marketing/DetectorLanding.jsx` | `lib/ai/tools.ts` (`detect`) — no upstream UI |
| `ui_kits/app/AppToolPage.jsx` | `components/tools/tool-editor.tsx` |
| `ui_kits/app/AppAccount.jsx` | `app/(app)/app/cuenta/page.tsx`, `components/app/delete-account-button.tsx` |
| `ui_kits/admin/AdminBackoffice.jsx` | `app/admin/page.tsx`, `lib/usage/summary.ts` |
| `components/core/Button.jsx` | `components/ui/button.tsx` |
| `components/core/Badge.jsx` | `components/ui/badge.tsx` |
| `components/surfaces/Card.jsx` | `components/ui/card.tsx` |
| `components/forms/Textarea.jsx` | `components/ui/textarea.tsx` |
| `components/forms/Input.jsx` | `app/login/page.tsx` (inline classes) |
| `components/tools/ToolEditor.jsx` | `components/tools/tool-editor.tsx` |
| `components/navigation/ToolTabs.jsx` | new Sept 2026 (competitive review) |
| `components/forms/Chip.jsx` | `components/tools/tool-editor.tsx` (mode buttons) |
| `components/tools/Highlight.jsx`, `ScoreGauge.jsx` | new Sept 2026 |
| `components/feedback/QuotaBar.jsx`, `UpsellBanner.jsx` | `lib/billing/plans.ts`, `lib/usage/quotas.ts` |
| `tokens/brand.css` | new Sept 2026 (brand + semantic colour) |
| `tokens/*.css` | `app/globals.css`, `components.json`, `app/layout.tsx` |
