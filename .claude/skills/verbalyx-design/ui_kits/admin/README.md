# UI kit — Verbalyx backoffice

Internal admin view, recreated from `app/admin/page.tsx` (read models in `lib/usage/summary.ts`). Open `index.html`.

- The only view in the product that widens past `max-w-4xl` — it uses `max-w-6xl`.
- Five stat tiles are ordinary `Card`s: label as a 14px/400 muted `CardTitle`, figure as 24px/600 `CardContent`.
- The table is plain HTML — no data-grid, no sorting, no pagination (upstream caps at 200 rows). Header row is `--muted` at 50%, rows separated by `border-t`, numeric columns right-aligned.
- All figures are fabricated sample data. Currency and dates use `es-ES` formatting (comma decimal, dot thousands, D/M/YYYY).
- `robots: { index: false }` upstream; non-admins get a 404 rather than a permission error.
