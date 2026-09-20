# Fase 1 · Primitivas

Componentes reutilizables, sin pantallas todavía. Referencia: `components/core/`, `components/forms/`, `components/feedback/` de la skill. Estimación: 1 jornada.

## 1.1 · `components/ui/button.tsx` — tres variantes nuevas

En el `cva`, cambia `default` y añade `ink` y `soft`:

```ts
default: "bg-brand text-brand-foreground shadow-xs hover:bg-brand-hover active:bg-brand-active",
ink:     "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
soft:    "bg-brand-soft text-brand-ink border border-brand-line hover:bg-brand-soft/70",
destructive: "bg-danger text-white shadow-xs hover:bg-danger/90",
```

Y el foco de todo el botón pasa a marca:

```ts
"focus-visible:border-brand focus-visible:ring-brand/30 focus-visible:ring-[3px]"
```

Cuándo usar cada una:

| Variante | Uso |
| --- | --- |
| `default` | la acción principal de la pantalla. Una por vista |
| `ink` | negro tinta. Segunda acción sólida que no debe competir: «Cambiar a Pro» en el muro E |
| `outline` | secundaria estándar: Google, «Ver planes», «Gestionar suscripción» |
| `soft` | el nivel más bajo: avisos dentro del editor, «Humanizar este texto →» |
| `ghost` | terciaria: «Cerrar», «Rehacer», «Cancelar mi suscripción» |
| `destructive` | solo confirmación irreversible |

`active:` es el único estado de presión del sistema y es un escalón de color. Nunca escala ni desplazamiento.

## 1.2 · `components/ui/badge.tsx` — cuatro variantes y dos props

```ts
brand:   "border-brand-line bg-brand-soft text-brand-ink",
success: "border-success-line bg-success-soft text-success-ink",
warning: "border-warning-line bg-warning-soft text-warning-ink",
danger:  "border-danger-line bg-danger-soft text-danger-ink",
```

Dos props nuevas: `pill` (radio completo, solo para la píldora «Sin registro · 300 palabras al día» del héroe) y `dot` (punto de 6 px en `currentColor`, delante del texto).

Semántica: `brand` para plan o estado, `success` para lo bueno, `warning` para el tope alcanzado, `danger` para el fallo. Los badges son de radio 8 px; **nunca píldoras**, salvo el caso citado.

## 1.3 · `components/ui/chip.tsx` — nuevo

Selector de registro. Sustituye la fila de `<Button variant={activo ? "default" : "outline"}>` que hoy tiene el editor, para que no se lea como cuatro acciones compitiendo.

```tsx
<Chip pressed={m === mode} onClick={() => setMode(m)}>Neutro</Chip>
```

- Altura 32 px, radio 8 px, borde 1 px, texto 14 px peso 500.
- En reposo el texto es `text-muted-foreground`; al pulsar, relleno `bg-brand` con texto blanco.
- `aria-pressed`. Exactamente uno activo.
- Etiquetas de `lib/ai/tools.ts`: humanize → Académico/Neutro/Informal · paraphrase → Estándar/Fluido/Formal/Simple/Creativo/Académico · correct → General/Académico · detect → ninguno.
- El activo por defecto es el segundo de la lista («Neutro», «Fluido»); si solo hay uno, ese.

## 1.4 · `components/billing/quota-bar.tsx` — nuevo

```tsx
<QuotaBar used={235} total={500} plan="Gratis" showPlan={false} />
```

- Fila superior: `235 / 500 palabras hoy` en peso 500, y el plan en 12 px atenuado. `showPlan={false}` cuando un `Badge` hermano ya nombra el plan — pasa en la cabecera de la app.
- Barra de 6 px, radio completo, fondo `--border`.
- Relleno `bg-brand`; **ámbar (`--warning-fill`) al 80 %; rojo (`--danger`) al 100 %**.
- `total` sale de `PLANS[plan].limits.wordsPerDay`. Si es `null` (Pro, Ilimitado) **no pintes barra**: muestra las palabras usadas como texto. Una barra con techo inventado es mentira.
- Números con `toLocaleString("es-ES")`.
- `white-space: nowrap` en las dos etiquetas: en cabeceras estrechas partían línea.

## 1.5 · `components/billing/upsell-banner.tsx` — nuevo

```tsx
<UpsellBanner tone="brand" title="Te quedan 265 palabras hoy."
  action={<Button size="sm">Probar Ilimitado 3 días gratis</Button>}>
  Ilimitado quita el límite diario y sube a 8.000 palabras por petición.
</UpsellBanner>
```

- `tone="brand"`: fondo `--brand-soft`, borde `--brand-line`, texto `--brand-ink`. Oportunista.
- `tone="quota"`: los equivalentes en rojo. **Solo cuando el usuario ya está bloqueado.**
- Radio 14 px, padding 16/24. El texto ocupa el espacio y la acción se va a la derecha; en móvil se apila.
- Nunca modal, nunca encima del editor.

## 1.6 · `components/navigation/tool-tabs.tsx` — nuevo

Navegación principal. Va **debajo de la cabecera, a ancho completo**, en marketing y en la app.

- Items desde `TOOLS` de `lib/ai/tools.ts`. Dos líneas: nombre en 14 px peso 500 y promesa en 12 px atenuada.
- Activa: texto `--brand` y regla inferior de 2 px en `--brand` que no llega a los bordes (10 px por lado).
- Las herramientas que no estén vivas se muestran `disabled`, no se ocultan. La hoja de ruta forma parte del argumento.
- Scroll horizontal sin barra visible en móvil.
- `role="tablist"` y `aria-selected`.

## 1.7 · `components/tools/highlight.tsx` — nuevo

Marca lo que la herramienta cambió. **Es el único sitio donde el color transporta información dentro de un texto.**

```tsx
<Highlight kind="rewritten">frase reescrita</Highlight>
<Highlight kind="added">texto nuevo</Highlight>
<HighlightLegend kind="rewritten" />  {/* «Reescrito» */}
<HighlightLegend kind="added" />      {/* «Añadido» */}
```

- `<mark>` con fondo tintado y **subrayado interior de 2 px** (`box-shadow: inset 0 -2px 0`) en el tono de línea. Ámbar = reescrito, verde = añadido.
- **Nunca texto de color**: el resultado se copia y pega, y el color se pierde o estorba.
- Resalta frases, no palabras sueltas, y nunca más de un tercio del resultado. Si todo está marcado, nada lo está.
- La leyenda es obligatoria cuando hay resaltado.

### De dónde salen los segmentos

Para resaltar hace falta saber qué cambió. Dos caminos:

1. **Diff en cliente (empieza por aquí).** `diff-words` de la librería `diff` sobre entrada y salida al terminar el stream. Aproximado, cero coste de IA, cero cambios en la API.
2. **Segmentos del modelo.** El prompt devuelve el texto marcado y lo parseas al vuelo. Mejor calidad, encarece el prompt y hay que tocar `lib/ai/`. **No lo hagas sin preguntar.**

## 1.8 · `components/tools/evidence-band.tsx` — nuevo

Resultado del detector. **Sustituye a cualquier idea de porcentaje.**

```tsx
<EvidenceBand band="clear" findings={[
  { label: "Frases de longitud casi idéntica en todo el texto", tone: "bad" },
  { label: "Conectores de relleno repetidos («es importante destacar»)", tone: "bad" },
  { label: "Terminología técnica coherente y bien empleada", tone: "good" },
]} />
```

- Tres bandas: `none` «Sin indicios» (verde), `some` «Algunos indicios» (ámbar), `clear` «Indicios claros» (rojo). Más `insufficient` (gris).
- Escala de tres pasos junto a la etiqueta. **Ni anillos, ni cifras, ni barras de 0 a 100.**
- La lista de evidencias es el producto, no el adorno. Una banda sin evidencias no se entrega.
- Por debajo de **200 palabras u 8 frases** → `band="insufficient"`: se dice que no hay texto suficiente en vez de dar una lectura mala.
- **El descargo va siempre**, y recoge la postura del sitio: los dos errores posibles no cuestan lo mismo.

## Criterio de aceptación de la fase

- Cada componente renderiza aislado y en móvil de 390 px.
- Foco visible con teclado en todos: halo de 3 px en `--brand/30`.
- Ningún componente contiene un precio, un límite ni una fecha escritos a mano.
- Altura mínima de 44 px en cualquier botón que se pulse en móvil.
