# Cómo llevar este diseño a `rmoral/webai`

> **¿Vas a implementarlo con Claude Code?** Usa `IMPLEMENTACION/` en su lugar: es la especificación detallada, fase a fase, con el prompt listo en `IMPLEMENTACION/PROMPT.md`. Este archivo es la versión corta, para integrarlo a mano.

Guía de integración, en el orden que respeta la prioridad de tu `CLAUDE.md`: primero lo que monetiza, luego la herramienta, luego SEO.

Reglas que NO cambian: los límites siguen viniendo de `lib/billing/plans.ts`, el gating de `lib/billing/entitlements.ts`, las llamadas a IA solo desde servidor, Server Components por defecto. Esto es una capa visual, no un refactor.

---

## Paso 0 — Tokens (30 min, desbloquea todo lo demás)

En `app/globals.css`, dentro del `:root` que ya existe, añade el bloque de marca. No borres nada: los neutros actuales se quedan.

```css
:root {
  /* …lo que ya tienes… */

  /* Marca */
  --brand: #2b45c4;
  --brand-hover: #2339a3;
  --brand-active: #1d2f88;
  --brand-fg: #ffffff;
  --brand-soft: #eef1fd;
  --brand-line: #c6cef4;
  --brand-ink: #1b2a76;

  /* Semánticos */
  --success: #15774e;
  --success-soft: #e6f4ed;
  --success-line: #a8d8c1;
  --success-ink: #0f5537;
  --warning: #9a5b06;
  --warning-fill: #d98b18;
  --warning-soft: #fdf3e2;
  --warning-line: #edc98a;
  --warning-ink: #7a4705;
  --danger: var(--destructive);
  --danger-soft: #fceceb;
  --danger-line: #f0b4b0;
  --danger-ink: #8f2018;
}

.dark {
  /* …lo que ya tienes… */
  --brand: #7d90f0;
  --brand-hover: #93a3f4;
  --brand-active: #a7b4f7;
  --brand-fg: #10143a;
  --brand-soft: #1b2050;
  --brand-line: #2f3873;
  --brand-ink: #c8d0fb;
  --success-soft: #10301f;
  --success-line: #1f5a3b;
  --success-ink: #8fd6b1;
  --warning-soft: #33230a;
  --warning-line: #6b4a15;
  --warning-ink: #e8bd78;
  --danger-soft: #3a1512;
  --danger-line: #6e2a24;
  --danger-ink: #f0a9a2;
}
```

Y en el `@theme inline` que ya tienes, añade los mapeos para que Tailwind genere las clases (`bg-brand`, `text-brand-ink`, `border-brand-line`, …):

```css
@theme inline {
  /* …lo que ya tienes… */
  --color-brand: var(--brand);
  --color-brand-hover: var(--brand-hover);
  --color-brand-active: var(--brand-active);
  --color-brand-foreground: var(--brand-fg);
  --color-brand-soft: var(--brand-soft);
  --color-brand-line: var(--brand-line);
  --color-brand-ink: var(--brand-ink);
  --color-success: var(--success);
  --color-success-soft: var(--success-soft);
  --color-success-line: var(--success-line);
  --color-success-ink: var(--success-ink);
  --color-warning: var(--warning);
  --color-warning-fill: var(--warning-fill);
  --color-warning-soft: var(--warning-soft);
  --color-warning-line: var(--warning-line);
  --color-warning-ink: var(--warning-ink);
  --color-danger: var(--danger);
  --color-danger-soft: var(--danger-soft);
  --color-danger-line: var(--danger-line);
  --color-danger-ink: var(--danger-ink);
}
```

Con esto solo, nada cambia visualmente todavía. Es la base.

---

## Paso 1 — Monetización: upsell y cuota visibles

Lo que más mueve la aguja y lo más barato de hacer.

**`components/ui/button.tsx`** — en el `cva`, cambia `default` y añade dos variantes:

```ts
default: "bg-brand text-brand-foreground shadow-xs hover:bg-brand-hover active:bg-brand-active",
ink: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
soft: "bg-brand-soft text-brand-ink border border-brand-line hover:bg-brand-soft/70",
```

Y el foco: `focus-visible:border-brand focus-visible:ring-brand/30`.

**`components/ui/badge.tsx`** — añade al `cva`:

```ts
brand: "border-brand-line bg-brand-soft text-brand-ink",
success: "border-success-line bg-success-soft text-success-ink",
warning: "border-warning-line bg-warning-soft text-warning-ink",
danger: "border-danger-line bg-danger-soft text-danger-ink",
```

**Dos componentes nuevos.** Cópialos de este sistema de diseño y pásalos a Tailwind:

| Aquí | En tu repo | Qué hace |
| --- | --- | --- |
| `components/feedback/QuotaBar.jsx` | `components/billing/quota-bar.tsx` | barra de palabras del día; ámbar al 80%, rojo al 100% |
| `components/feedback/UpsellBanner.jsx` | `components/billing/upsell-banner.tsx` | oferta de Pro en contexto, dos tonos |

`QuotaBar` recibe `used` y `total`; `total` sale de `PLANS[plan].limits.wordsPerDay`. Si es `null` (Pro), no pintes barra: pinta el número de palabras usadas como texto.

Dónde ponerlos:

- `app/(app)/layout.tsx` → `QuotaBar` en la cabecera, junto al badge del plan. **Un solo sitio nombra el plan**: el badge. Pasa `showPlan={false}` a la barra.
- `components/tools/tool-editor.tsx` → `UpsellBanner` debajo del editor cuando el plan no es Pro, y con `tone="quota"` cuando la API devuelve 429 (ahí ya tienes el `setUpsell(true)`).
- `app/(marketing)/precios/page.tsx` → la tarjeta Pro pasa a `border-brand` con `ring-1 ring-brand`.

Test e2e obligatorio según tu `CLAUDE.md`: cualquier cambio que toque el paywall necesita Playwright.

---

## Paso 2 — El editor: resaltado de cambios

Esto es lo que te diferencia del borrador actual y lo que hace toda la competencia.

1. `components/ui/chip.tsx` nuevo (desde `components/forms/Chip.jsx`): reemplaza la fila de `<Button variant={...}>` del selector de registro. Un solo chip presionado.
2. `components/tools/highlight.tsx` nuevo (desde `components/tools/Highlight.jsx`): `<mark>` con tinte + subrayado de 2px. Ámbar = reescrito, verde = añadido.
3. Los dos paneles pasan a compartir **un solo marco**: `rounded-xl border shadow-sm`, chips en la barra superior, botón de ejecutar en la inferior, regla de 1px entre paneles. Ver `components/tools/ToolEditor.jsx` aquí como referencia de medidas.

**Lo único que requiere backend**: para resaltar hay que saber qué cambió. Dos opciones, de menor a mayor coste:

- **Diff en cliente** (rápido, sin tocar la API): `diff-words` sobre entrada y salida al terminar el stream. Aproximado pero suficiente.
- **Segmentos desde el modelo** (mejor): que el prompt devuelva el texto marcado y lo parsees al vuelo. Encaja con el streaming que ya tienes, pero encarece el prompt.

Empieza por el diff en cliente.

---

## Paso 3 — Navegación: pestañas de herramienta

1. `components/navigation/tool-tabs.tsx` nuevo (desde `components/navigation/ToolTabs.jsx`). Los items salen de `TOOLS` en `lib/ai/tools.ts`; `disabled` para las que no están vivas — hoy todas menos `humanize`.
2. **Cabecera de marketing**: `app/(marketing)/layout.tsx` hoy solo tiene footer. Añade la cabecera sticky (marca + Precios/Blog/Ayuda + Entrar/Crear cuenta) y debajo las pestañas. Es un Server Component salvo las pestañas, que llevan `"use client"`.
3. **Cabecera de app**: `app/(app)/layout.tsx` — mismas pestañas bajo la fila que ya tienes.
4. `/app` deja de ser rejilla de tarjetas: redirige a la herramienta activa. La rejilla desaparece con las pestañas.
5. Anchura: de `max-w-4xl` a `max-w-[65rem]` en marketing y app. El editor de dos paneles necesita ese ancho. `cuenta` se queda en `max-w-2xl`, `admin` en `max-w-6xl`.

---

## Paso 4 — SEO y portada

1. **El editor sube a la portada.** `app/(marketing)/page.tsx` pasa a ser titular + píldora «Sin registro · 300 palabras al día» + `<ToolEditor tool="humanize" />`. Sigue siendo la página que más tráfico recibe; que el usuario pueda usar el producto sin un clic más.
2. **Footer en grupos de enlaces** (`Herramientas`, `Para quién`, `Producto`, `Legal`), como en `ui_kits/marketing/MarketingFooter.jsx`. Es infraestructura de SEO, no decoración.
3. **Una landing por herramienta**, con los paths que ya están en `lib/ai/tools.ts` y el mismo esqueleto que `humanizador-de-texto-ia`: H1, lede, editor, prosa, FAQ, JSON-LD. Puedes partir de `templates/tool-landing/`.
4. El **Detector** aún no existe en el repo. `ui_kits/marketing/DetectorLanding.jsx` es una propuesta de diseño, no una recreación: valídala antes de construir la API.

---

## Atajo: usar esto como skill de Claude Code

Si trabajas con Claude Code en el repo:

1. Descarga este proyecto (botón de descarga del proyecto).
2. Copia la carpeta en `.claude/skills/verbalyx-design/` dentro de `rmoral/webai`.
3. El `SKILL.md` de la raíz ya está en el formato de Agent Skills; Claude Code lo detecta y lee el `readme.md` y los kits.
4. A partir de ahí le pides «implementa el paso 1 de HANDOFF.md» y tiene los valores exactos delante, sin inventar.

---

## Qué NO hacer

- No pasar los límites de palabras a los componentes: siempre desde `lib/billing/plans.ts`.
- No añadir un segundo color de acento, ni degradados, ni sombras grandes.
- No usar los semánticos como decoración: verde/ámbar/rojo solo cuando significan algo (puntuación, diff, cuota, borrado).
- No prometer que el texto pasa detectores de terceros. La FAQ actual está bien escrita; mantén ese tono.
- No meter iconos aún: nada del diseño depende de un set de iconos, y `lucide` está declarado pero sin usar. Si los metes, decide el set una vez y documéntalo.
