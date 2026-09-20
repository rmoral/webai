# Prompt para Claude Code

Copia este bloque entero como primer mensaje en Claude Code, con el repositorio `webai` abierto.

---

Vas a implementar el rediseño del registro, el muro de pago y el cobro integrado de Verbalyx.

El diseño completo está en la skill `verbalyx-design` (carpeta `.claude/skills/verbalyx-design/`). **Léela antes de escribir una línea de código**, en este orden:

1. `IMPLEMENTACION/00-CONTEXTO.md` — qué es el producto, qué hay en el repo y qué ha cambiado.
2. `readme.md` — fundamentos visuales, tono de voz y reglas de contenido.
3. `IMPLEMENTACION/01-TOKENS.md` a `IMPLEMENTACION/08-QA.md` — la especificación, fase a fase.
4. Los componentes de referencia en `components/` y `ui_kits/`: son React plano con CSS de tokens. **No los copies tal cual** — están escritos para renderizar sin bundler. Tradúcelos a Tailwind y a los componentes `components/ui` que ya existen en el repo.

## Reglas del encargo

- **Sigue el orden de fases.** Cada fase es un commit o un PR independiente y deja el producto funcionando. No empieces la fase N+1 sin cerrar la N.
- **No inventes copy.** Todos los textos en español están en `IMPLEMENTACION/07-COPY.md`, literales. Si necesitas una cadena que no está, para y pregunta.
- **No inventes precios ni límites.** Vienen de `lib/billing/plans.ts`, que hay que actualizar en la fase 0. Ningún componente lleva una cifra escrita a mano.
- **Nada puede prometer que un texto evade detectores.** Es una regla de producto, no de estilo.
- **El detector no da porcentajes.** Banda cualitativa más evidencias. Si ves un número de 0 a 100 en una pantalla de detección, está mal.
- **El pago ocurre dentro del sitio.** Stripe Payment Element embebido, nunca `redirectToCheckout` ni una URL de Checkout alojada.
- **Un solo CTA primario por pantalla**, salvo en el muro de fin de prueba, donde los dos son iguales por exigencia legal.
- **La divulgación legal es parte del diseño**: 14 px, dentro del flujo, sobre fondo tintado. Nunca letra pequeña ni al pie.

## Antes de empezar

Dime qué has entendido y enséñame tu plan de las fases 0 y 1 antes de tocar nada. Si algo del diseño choca con el código que ya existe, dímelo en vez de improvisar una solución.

## Cosas que no debes hacer sin preguntarme

- Cambiar el esquema de la base de datos más allá de lo que pide `03-PAYWALL.md` y `04-PAGO.md`.
- Tocar los prompts de IA o `lib/ai/`.
- Instalar dependencias que no estén listadas en la fase correspondiente.
- Borrar las páginas legales o el contenido SEO existente.

---

## Variante corta, si prefieres ir fase a fase

> Lee `.claude/skills/verbalyx-design/IMPLEMENTACION/00-CONTEXTO.md` y `IMPLEMENTACION/01-TOKENS.md`. Implementa **solo la fase 0**: actualizar `lib/billing/plans.ts` con los tres planes reales en dólares y añadir los tokens de marca y semánticos a `app/globals.css`. No toques ninguna pantalla todavía. Cuando termines, enséñame el diff.

Y en los mensajes siguientes: «ahora la fase 1», «ahora la fase 2»…
