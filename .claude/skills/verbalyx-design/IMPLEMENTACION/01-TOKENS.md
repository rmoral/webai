# Fase 0 · Planes y tokens

Sin cambios visibles. Es la base de todo lo demás. Estimación: media jornada.

## 0.1 · `lib/billing/plans.ts`

Actualiza la fuente de verdad a los tres planes reales. Mantén la forma que ya use el archivo; esto es el contenido, no necesariamente la firma exacta.

```ts
export const CURRENCY = "usd";

export const PLANS = {
  anonymous: {
    id: "anonymous",
    name: "Anónimo",
    limits: { wordsPerDay: 300, wordsPerRequest: 300, wordsPerMonth: null },
    tools: ["humanize", "detect"],
    features: { history: false, passageBreakdown: false, queuePriority: false },
  },
  free: {
    id: "free",
    name: "Gratis",
    limits: { wordsPerDay: 500, wordsPerRequest: 300, wordsPerMonth: null },
    tools: ["humanize", "detect"],
    features: { history: false, passageBreakdown: false, queuePriority: false },
    price: { monthly: 0, yearly: 0 },
  },
  pro: {
    id: "pro",
    name: "Pro",
    limits: { wordsPerDay: null, wordsPerRequest: 3_000, wordsPerMonth: 60_000 },
    tools: ["humanize", "detect", "paraphrase", "correct"],
    features: { history: true, passageBreakdown: true, queuePriority: false },
    price: { monthly: 1499, yearly: 8988 },   // centavos
    trialDays: null,                           // Pro NO lleva prueba
    stripePriceId: { monthly: "price_...", yearly: "price_..." },
  },
  unlimited: {
    id: "unlimited",
    name: "Ilimitado",
    limits: { wordsPerDay: null, wordsPerRequest: 8_000, wordsPerMonth: 500_000 },
    tools: ["humanize", "detect", "paraphrase", "correct"],
    features: { history: true, passageBreakdown: true, queuePriority: true },
    price: { monthly: 2999, yearly: 17988 },
    trialDays: { monthly: 3, yearly: null },   // la prueba SOLO en mensual
    stripePriceId: { monthly: "price_...", yearly: "price_..." },
  },
} as const;

export const TOPUP = { words: 25_000, price: 999, expires: false };
```

**`trialDays.yearly: null` es la decisión central de todo el rediseño.** Una prueba colgada de un cargo anual de 179,88 US$ es lo que hoy hace que el precio de cabecera y el de la divulgación no coincidan. Con esto, coinciden siempre.

Añade dos ayudantes; los van a usar el muro, precios, el checkout y los correos, y son el único sitio donde se formatea dinero y fechas:

```ts
export function formatUSD(cents: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency", currency: "USD", currencyDisplay: "narrowSymbol",
  }).format(cents / 100).replace("$", "US$");
}

export function formatDateES(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric", month: "long", year: "numeric",
  }).format(date);
}
```

Formato esperado: `14,99 US$` y `21 de septiembre de 2026`. Verifica la salida real de `formatUSD` en tu entorno y ajusta si el separador no sale como coma.

## 0.2 · Tokens en `app/globals.css`

Dentro del `:root` que ya existe, **sin borrar nada**:

```css
:root {
  /* … lo que ya tienes … */

  /* Marca — azul tinta. Elegido contra el verde de QuillBot
     y el morado genérico de IA. */
  --brand: #2b45c4;
  --brand-hover: #2339a3;
  --brand-active: #1d2f88;
  --brand-fg: #ffffff;
  --brand-soft: #eef1fd;
  --brand-softer: #f7f8fe;
  --brand-line: #c6cef4;
  --brand-ink: #1b2a76;

  /* Semánticos — llevan significado, no decoran */
  --success: #15774e;
  --success-soft: #e6f4ed;
  --success-line: #a8d8c1;
  --success-ink: #0f5537;

  --warning: #9a5b06;       /* texto */
  --warning-fill: #d98b18;  /* relleno */
  --warning-soft: #fdf3e2;
  --warning-line: #edc98a;
  --warning-ink: #7a4705;

  --danger: var(--destructive);
  --danger-soft: #fceceb;
  --danger-line: #f0b4b0;
  --danger-ink: #8f2018;
}

.dark {
  /* … lo que ya tienes … */
  --brand: #7d90f0;
  --brand-hover: #93a3f4;
  --brand-active: #a7b4f7;
  --brand-fg: #10143a;
  --brand-soft: #1b2050;
  --brand-softer: #15183c;
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

En el `@theme inline` existente, para que Tailwind genere `bg-brand`, `text-brand-ink`, `border-brand-line`…:

```css
@theme inline {
  /* … lo que ya tienes … */
  --color-brand: var(--brand);
  --color-brand-hover: var(--brand-hover);
  --color-brand-active: var(--brand-active);
  --color-brand-foreground: var(--brand-fg);
  --color-brand-soft: var(--brand-soft);
  --color-brand-softer: var(--brand-softer);
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

## Reglas de color que no se negocian

- El lienzo sigue siendo neutro puro (croma 0). El azul y los semánticos son acentos, no fondos de página.
- **El color informa, no decora.** Verde, ámbar y rojo solo cuando significan algo: bandas del detector, resaltado de cambios, presión de cuota, borrado. Si un color no le dice nada al usuario, debe ser un neutro.
- Ni un degradado. No hay ninguno en el producto.
- Nunca texto de color sobre relleno de color. En superficies tintadas se usa el `-ink` correspondiente, que está calculado para contrastar.

## Criterio de aceptación

- `pnpm build` pasa.
- `bg-brand`, `text-brand-ink`, `bg-success-soft`, `border-danger-line` existen como clases.
- Ninguna pantalla ha cambiado de aspecto.
- Ningún componente tiene un precio ni un límite escrito a mano; todos salen de `PLANS`.
