# UI kit — Verbalyx signed-in app

Click-through recreation of the authenticated product on the September 2026 direction. Open `index.html`: sign in with the Google button or the fake magic link, then the shell is live.

| Screen | Source |
| --- | --- |
| `AppLogin.jsx` | `app/login/page.tsx` |
| `AppShell.jsx` | `app/(app)/layout.tsx`, `lib/auth/admin.ts`, `lib/usage/summary.ts` |
| `AppToolPage.jsx` | `components/tools/tool-editor.tsx` |
| `AppAccount.jsx` | `app/(app)/app/cuenta/page.tsx`, `components/app/delete-account-button.tsx` |

What changed versus the imported code, and why:

- **The app opens on a tool, not on a menu.** Upstream `/app` was a grid of four cards you had to click through to reach any tool; `AppDashboard.jsx` has been removed. The tabs in the shell do that job in one click, which is how QuillBot's and Smodin's dashboards work.
- **The allowance is always visible.** `QuotaBar` sits in the header (amber at 80%, red at 100%) instead of a muted "Te quedan N palabras hoy" sentence nobody reads until the 429.
- **Pro is offered in context.** `UpsellBanner` under the editor, plus a header CTA — no modal.
- **A score readout.** `ScoreGauge` shows how human the result reads, always with the disclaimer from the product's own FAQ.
- The header keeps the upstream rules: bordered row, text links, `outline` "Salir" pushed right, "Admin" only for admin emails.

All usage numbers, dates and plans are hardcoded. Upstream they come from `lib/usage/summary.ts` and `lib/billing/entitlements.ts` — never hardcode limits in product code.
