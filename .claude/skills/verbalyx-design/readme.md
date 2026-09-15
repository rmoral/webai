# Verbalyx — Design System

Verbalyx is a Spanish-language AI writing SaaS: **humanizador, detector de IA, parafraseador y corrector**. It is built for the Spanish of Spain *and* LATAM ("español neutro"), not translated from an English product. Positioning, verbatim from the product: *"Escribe mejor con IA, en español."*

At the time of import the product is early — a public marketing site with one live tool (the humanizador), a thin signed-in app, and an internal backoffice. The build priority recorded in the repo is blunt: payment flow first, working tool second, SEO third, everything else after.

> **September 2026 — design direction.** The imported code was an unstyled first draft: no header, no navigation between tools, and a fully achromatic palette. After a competitive review of QuillBot, Smodin and Undetectable AI, this system now adds (1) a real header with a **tab per tool**, (2) a **brand blue** `#2b45c4` for primary actions, and (3) a **semantic scale** (green / amber / red) that does actual work: marking what the tool rewrote and scoring how human a text reads. Everything else — Geist, the neutral canvas, 10px radius base, two shadows, flat motion — is unchanged from the repository. Decisions marked "added Sept 2026" in this file are ours, not the repo's.

## Sources

Everything in this design system was read out of one repository:

- **GitHub — https://github.com/rmoral/webai** (branch `main`). The Next.js 15 app: `app/globals.css` (all tokens), `components/ui/*` (the primitives), `app/(marketing)/*`, `app/(app)/*`, `app/admin/*` (the screens), `lib/ai/tools.ts` + `lib/billing/plans.ts` (the product's own sources of truth).

No Figma file, brand book, slide template, or asset library was provided. Explore the repository directly for anything this guide leaves out — the code is the ground truth and stays ahead of this document. See `github.md` for the sync record.

Stack for context: Next.js 15 App Router · TypeScript · Tailwind CSS 4 + **shadcn/ui ("new-york" style, `baseColor: neutral`)** · Supabase · Drizzle · Stripe · Anthropic API · Vercel.

## Products / surfaces

| Surface | Routes | UI kit |
| --- | --- | --- |
| Marketing site | `/`, `/humanizador-de-texto-ia`, `/precios`, `/legal/[slug]` | `ui_kits/marketing/` |
| Signed-in app | `/login`, `/app`, `/app/cuenta` | `ui_kits/app/` |
| Backoffice | `/admin` | `ui_kits/admin/` |
| Transactional email | `emails/welcome.tsx`, `emails/trial-ending.tsx` | not recreated (plain `sans-serif` on `#fafafa`, no brand styling upstream) |

## Components

Built strictly from the repository's own inventory — `components/ui/` plus the one real app component.

| Component | Source | Notes |
| --- | --- | --- |
| `Button` | `components/ui/button.tsx` | 6 variants × 4 sizes |
| `Badge` | `components/ui/badge.tsx` | 4 variants |
| `Card` (+ `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`) | `components/ui/card.tsx` | the only container in the product |
| `Textarea` | `components/ui/textarea.tsx` | the tool input pane |
| `ToolEditor` | `components/tools/tool-editor.tsx` | mode picker + paste pane + streamed result |
| `Input` | — | **Intentional addition.** Upstream has no `input.tsx`; `app/login/page.tsx` writes the identical classes inline. Extracted verbatim so consumers stop re-typing them. |
| `ToolTabs` | — | **Added Sept 2026.** Primary navigation. The repo navigated tools through a card grid; the category uses top tabs. |
| `Chip` | `components/tools/tool-editor.tsx` | Mode/register selector, promoted out of the editor so a mode row stops reading as four competing buttons. |
| `Highlight`, `HighlightLegend` | — | **Added Sept 2026.** Marks what the tool rewrote (amber) vs added (green). Every serious competitor does this. |
| `ScoreGauge` | `lib/ai/tools.ts` (`detect`) | **Added Sept 2026.** Score readout for the Detector de IA, which has no UI upstream. |
| `QuotaBar` | `lib/billing/plans.ts`, `lib/usage/summary.ts` | **Added Sept 2026.** The daily allowance, visible before the 429. |
| `UpsellBanner` | `components/marketing/checkout-button.tsx` | **Added Sept 2026.** In-context Pro offer; upstream the paywall was only a red error line. |

Beyond the six additions above — each listed with the reason it exists — nothing was invented. There is still no Dialog, Toast, Tooltip, Select, Switch, Avatar or Table component in Verbalyx — the backoffice table is plain `<table>` markup, and confirmation happens by swapping a button for two inline buttons (see `delete-account-button.tsx`). If you need one of those, you are designing something new; say so out loud.

## Competitive review (September 2026)

Read before designing anything new. Sources: quillbot.com (the user's stated reference), smodin.io, plus published reviews of both.

- **Tools are tabs, not destinations.** QuillBot exposes its whole suite as a top tab row *and* a side rail, so switching tool never costs a round trip through a menu. Verbalyx now does the same with `ToolTabs`.
- **Two-pane editor is the category standard**: source left, result right, mode selector above. The repo already had this — keep it.
- **Let people work before signing up.** "No es necesario registrarse para probarlo" is a headline claim, not fine print. Verbalyx's anonymous 300-word tier is a real advantage; put the editor on the homepage and say the limit out loud.
- **Show the edit.** Competitors mark their changes in colour so the user can audit the rewrite. This is the single strongest reason the palette gained hues.
- **Suite pages are SEO infrastructure.** QuillBot's footer is a dozen grouped link lists, and every tool has its own landing page with an FAQ. Verbalyx's `MarketingFooter` mirrors that shape; keep one landing per tool path from `lib/ai/tools.ts`.
- **What we deliberately did NOT copy:** invented user counts, partner logos, testimonial walls, the "one subscription for everything" sprawl (PDF tools, image generators), and any claim about beating detectors. Verbalyx's differentiator is being genuinely Spanish-first and honest about limits — the copy rules below exist to protect that.

## Content fundamentals

**Language.** All user-facing copy is **Spanish (español neutro)** — no localisms except on country-specific landings. Code, comments and commits are English. Keep that split.

**Person.** Second person singular, informal **tú**, never *usted*: "Pega aquí tu texto…", "Revisa tu correo", "¿Prefieres pagar mes a mes?". The company speaks as **nosotros** only when it is accountable: "te hemos enviado un enlace", "Hemos registrado el error", "No guardamos tus textos". Never "the user".

**Casing.** Sentence case everywhere — headings, buttons, badges, table headers. "Crear cuenta gratis", not "Crear Cuenta Gratis". Product nouns keep their capital: Pro, Gratis, Humanizador, Backoffice.

**Register.** Plain, short, unhyped. Claims are qualified rather than inflated — the FAQ openly says no tool can guarantee passing third-party AI detectors. Privacy is stated as fact, not as a promise: *"No. Los textos de usuarios anónimos y gratuitos no se almacenan: solo registramos métricas de uso."*

**Buttons** are verbs in the imperative or a bare noun: "Probar gratis", "Enviarme el enlace", "Copiar resultado", "Salir", and — for tool actions — the tool's own name ("Humanizador"). Loading labels replace the idle label and end in an ellipsis **character**: "Enviando…", "Procesando…", "Abriendo el pago…", "Eliminando…". Never "…".

**Micro-copy patterns.**
- Arrow affordance is a literal "→" appended to link text: "Pruébalo gratis →", "Abrir →", "Ir a mis herramientas →", "Desbloquea Pro con 3 días de prueba →".
- Errors are one short sentence, apologise implicitly, and always offer the retry: "Algo ha salido mal. Inténtalo de nuevo.", "No se pudo enviar el enlace. Inténtalo de nuevo."
- Empty states describe what will happen: "El resultado aparecerá aquí", "Todavía no hay usuarios registrados."
- Unavailable features are honest and vague about timing: "Disponible muy pronto", "Muy pronto".
- Destructive confirmation opens with a bare question and lists consequences: "¿Seguro? Se borrarán tu cuenta, tu historial y tu suscripción."
- Numbers are formatted `es-ES` — "10.000 palabras", "59,99 €/año", dates "4/2/2026".
- Spanish typographic conventions are respected: opening ¿ and ¡, angle quotes «académico» for quoted terms, and em dashes — like this — in marketing prose.

**No emoji. Anywhere.** None appear in the repository, in any state, including errors and success messages. Do not add them.

**Marketing prose** is longer-form and SEO-aware (the humanizador landing carries ~600 words plus a 5-question FAQ and JSON-LD), but it keeps the same flat register: it names the problem concretely ("frases de longitud uniforme, conectores repetidos") instead of selling adjectives.

## Visual foundations

**Neutral canvas, one blue, three semantics.** The page is white and every neutral is oklch chroma **0** — pure grey, no warm or cool tint. On top of that sit exactly four hues:

- `--brand: #2b45c4` (ink blue) — primary buttons, the active tool tab, the "x" of the wordmark, tinted upsell surfaces. One brand colour, used sparingly. Chosen against QuillBot's green and the generic AI purple.
- `--success` green, `--warning` amber, `--danger` red — reserved for meaning: detector bands (≥70 / 40-69 / <40), diff highlighting (añadido / reescrito), quota pressure (80% / 100%), and destructive confirmation.

Rules: no second accent, **no gradients anywhere**, no coloured text on coloured fills, and never colour as decoration — if a colour is not telling the user something, it should be a neutral. `--primary` (near-black `oklch(0.205 0 0)`) still exists for the `ink` button and default badge.

**Type.** **Geist Sans** for everything, **Geist Mono** for data and code. Four weights in use: 400 body, 500 controls/badges/table headers, 600 card and page titles, 700 marketing `h1` only. `tracking-tight` (-0.025em) on every marketing headline, normal elsewhere. Sizes: 48/36/30px marketing headlines, 24px page titles, 18px ledes, **14px is the UI default**, 12px legal. Card titles are 16px/600 with `line-height: 1`.

**Layout.** One column, centred, always. The house width is **65rem (1040px)** — widened from the repo's `max-w-4xl` because the two-pane editor needs it; `max-w-2xl` for the account page, `max-w-sm` for the login card, `max-w-6xl` only for the backoffice table. Gutters `px-6`, page padding `py-12` (marketing home `py-16`). **No sidebar, no modals, no drawers.** The marketing header is sticky with a blurred translucent background; the app header is solid and scrolls away. Every surface carries the same two-row header: identity + actions on top, tool tabs below. Grids are 2-up (tool cards, plans) or 3/4-up (claims, audiences) with `gap-4`; the tool editor is two equal columns in one frame, collapsing to one under 720px.

**Cards.** 1px `--border`, 14px radius (`rounded-xl`), `shadow-sm`, `--card` background (pure white in light mode — same as the page, so the border does the work), 24px padding, 24px gap between slots, 6px between title and description. Emphasis is applied **only to the border**: `border-primary` for the recommended plan, `--destructive` at 40% for the delete-account card. Never a tinted card background, never a coloured left border.

**Elevation.** Two shadows exist: `shadow-xs` on controls, `shadow-sm` on cards. Nothing larger, nothing coloured, no glows, no inner shadows.

**Radii.** One `--radius: 0.625rem` (10px) with four derived steps — 6/8/10/14px. Controls use 8px (`rounded-md`), cards 14px. `--radius-full` is defined but unused: **no pills anywhere**, including badges.

**Borders & dividers.** Hairline 1px `--border` (`oklch(0.922 0 0)`) for everything: card edges, the app header's bottom rule, table row separators, the table container. No double borders, no rules between form fields.

**Interaction.** Brand fills step to `--brand-hover` on hover and `--brand-active` on press (the one press state in the system — a colour step, never a scale or translate). Neutral solid fills still darken to 90% of themselves, secondary to 80%; `outline` and `ghost` swap their background to `--accent`; interactive cards tint to `--accent` at 40%; text links simply underline. Disabled is `opacity: 0.5` plus `pointer-events: none`. Focus is a **3px halo** — brand blue at 30% on interactive brand elements, `--ring` at 50% on neutral fields — plus a matching border. Never a browser outline.

**Motion.** 150ms colour/box-shadow transitions and nothing else. `tw-animate-css` is installed but unused in any screen: **no keyframe animation, no fades, no bounces, no skeleton shimmer**. The one thing that "animates" is real: AI output streams in token by token, and its loading state is the word "Escribiendo…".

**Transparency & blur.** Sparingly, and always as `color-mix`/alpha on a neutral or the brand: `accent/40` card hover, `muted/50` table header, `brand/30` focus halo. One `backdrop-filter: blur(10px)` exists — the sticky marketing header over a 90% `--background` fill. No protection gradients or scrims, because there is no imagery to protect.

**Imagery & illustration.** There is **none**. No photography, no illustration, no background patterns, textures, grain, or decorative SVG anywhere in the repository. Screens are white, text and bordered boxes. If a design needs an image, that is a new decision — ask before inventing a visual language.

**Dark mode** exists as a full token set (`.dark`) but no toggle ships. In dark, `--primary` inverts to near-white, cards lift to `oklch(0.205 0 0)`, and borders become white at 10%.

## Iconography

**There are no icons in Verbalyx today.** `components.json` declares `"iconLibrary": "lucide"` and `lucide-react` is a dependency, but **no screen imports a single icon**. Affordances are carried by text and by the literal arrow character "→".

- `Button` and `Badge` already size any child `svg` (16px and 12px respectively) with `gap-2` — the slot is there, unused.
- The only image assets in the repo are `app/favicon.ico` (copied to `assets/favicon.ico`) and the unmodified Next.js starter SVGs in `public/` (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`) — framework boilerplate, not brand assets. They were deliberately not imported.
- **No logo exists.** No wordmark file, no monogram, no favicon beyond the Next.js default. Wherever a mark would go, Verbalyx sets the name as text: `font-semibold` 14px in the app header, plain text in the footer. This design system does the same — see `guidelines/brand-wordmark.html`. A logo has not been drawn or approximated here, and should not be.
- No icon font, no sprite sheet, no unicode-as-icon beyond "→", **no emoji**.
- If a design genuinely needs icons, use **Lucide** (the declared library) at 16px, 1.5–2px stroke, `currentColor`, from `https://unpkg.com/lucide-static` — and flag it as an addition, since no upstream screen sets a precedent. The Sept 2026 kits deliberately still use **no icons**: tabs, chips and banners carry text, so nothing here depends on a glyph set that hasn't been chosen.

## Index

| Path | What |
| --- | --- |
| `styles.css` | the single global entry point — `@import` list only |
| `tokens/` | `fonts`, `colors`, `brand`, `typography`, `spacing`, `radius`, `elevation`, `motion`, `base` |
| `components/core/` | `Button`, `Badge` |
| `components/forms/` | `Input`, `Textarea`, `Chip` |
| `components/surfaces/` | `Card` + slots |
| `components/navigation/` | `ToolTabs` |
| `components/tools/` | `ToolEditor`, `Highlight`, `ScoreGauge` |
| `components/feedback/` | `QuotaBar`, `UpsellBanner` |
| `guidelines/` | 22 specimen cards (Colors, Type, Spacing, Brand) |
| `ui_kits/marketing/` | header + tabs, home with live editor, humanizador, detector, precios, SEO footer |
| `ui_kits/app/` | login, shell with tabs + quota, tool page with score and upsell, mi cuenta |
| `ui_kits/admin/` | backoffice |
| `explorations/` | the two directions reviewed in Sept 2026 — "Tinta" (chosen) and "Señal" |
| `templates/tool-landing/` | starting template for a new tool landing page |
| `assets/favicon.ico` | the only image asset that exists upstream |
| `github.md` | source repo + sync record |
| `SKILL.md` | Agent Skills entry point |

Each component directory also holds `<Name>.d.ts` (props contract) and `<Name>.prompt.md` (when to use it, with an example).

## Font note

Upstream loads Geist through the `geist` npm package (`next/font`). No font binaries exist in the repository, so `tokens/fonts.css` pulls **Geist and Geist Mono from Google Fonts**, which serves the same families — this is the real typeface, not a substitute. If you have licensed `.woff2` files you would rather self-host, send them and they will be swapped in as local `@font-face` rules.
