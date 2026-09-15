# UI kit — Verbalyx marketing site

Click-through recreation of the public site, on the September 2026 design direction (brand blue + tool tabs). Open `index.html`.

| Screen | Source |
| --- | --- |
| `SiteHeader.jsx` | new — no header exists upstream (see below) |
| `MarketingHome.jsx` | `app/(marketing)/page.tsx`, `lib/ai/tools.ts` |
| `HumanizerLanding.jsx` | `app/(marketing)/humanizador-de-texto-ia/page.tsx` |
| `DetectorLanding.jsx` | `lib/ai/tools.ts` (`detect`) — **no upstream UI**; designed here |
| `PricingPage.jsx` | `app/(marketing)/precios/page.tsx`, `lib/billing/plans.ts` |
| `MarketingFooter.jsx` | `app/(marketing)/layout.tsx`, expanded into SEO link groups |

What changed versus the imported code, and why:

- **A real header with tool tabs.** Upstream every marketing page was a bare centred column and tools were reachable only through a card grid. Competitive review (QuillBot, Smodin) found top tabs to be the category convention, so the header carries the wordmark, three nav links, Entrar / Crear cuenta gratis, and a tab per tool with the unshipped ones visibly disabled.
- **The editor is on the homepage.** Category leaders let you paste and run before you read anything, and they say so ("no signup required"). The hero is now headline + hero pill + live editor.
- **Change highlighting.** The result pane marks what was rewritten (amber) and added (green), with a legend.
- **Brand blue.** Primary buttons, active tab, the "x" in the wordmark, and the closing CTA panel.
- The page width moved from `max-w-4xl` (896px) to 65rem (1040px) because the two-pane editor needs it.

Kept honest: the home still says the other three tools are "Muy pronto", there are no invented user counts, testimonials or partner logos, and the detector landing is labelled "Muy pronto" because it does not exist yet. Blog and Ayuda are intentionally blank.
