# Paquete de implementación

Todo lo necesario para llevar el rediseño de registro, muro de pago y cobro integrado al repositorio `rmoral/webai`.

## Cómo usarlo con Claude Code

1. Descarga este proyecto entero.
2. Cópialo en `.claude/skills/verbalyx-design/` dentro del repo.
3. Abre Claude Code en el repo.
4. Pega el contenido de `PROMPT.md` como primer mensaje.

El `SKILL.md` de la raíz ya está en formato Agent Skills, así que Claude Code lo detecta solo.

## Los archivos, en orden de lectura

| Archivo | Qué contiene |
| --- | --- |
| `PROMPT.md` | **el prompt para pegar en Claude Code** |
| `00-CONTEXTO.md` | producto, repo, deriva con el sitio vivo, las 7 fases |
| `01-TOKENS.md` | fase 0 · planes en dólares y tokens de color |
| `02-COMPONENTES.md` | fase 1 · Button, Badge, Chip, QuotaBar, UpsellBanner, ToolTabs, Highlight, EvidenceBand |
| `03-PAYWALL.md` | fase 2 · las cinco variantes y su lógica de disparo |
| `04-PAGO.md` | fase 3 · Stripe embebido, endpoint, webhooks, cron |
| `05-PANTALLAS.md` | fase 4 · registro, login, precios, checkout, confirmación |
| `06-EMAILS.md` | fase 5 · los dos correos y su disparo |
| `07-COPY.md` | **todos los textos literales** |
| `08-QA.md` | fase 6 · recorridos, tarjetas de prueba, lista de comprobación, métricas |

Fuera de esta carpeta, en la raíz del proyecto:

- `readme.md` — fundamentos visuales, tono y reglas de contenido.
- `REVISION_SITIO.md` — qué se observó en verbalyx.ai y qué no se pudo observar.
- `HANDOFF.md` — la versión corta, si prefieres integrarlo a mano.
- `components/` y `ui_kits/` — los componentes de referencia, en React plano.
- `explorations/` — las pantallas navegables, para consultar al implementar.

## Las cinco decisiones que no se tocan

1. **La prueba de 3 días solo existe en Ilimitado mensual.** Nunca sobre un ciclo anual.
2. **El cobro ocurre dentro del sitio.** Payment Element embebido, sin redirección.
3. **El detector no da porcentajes.** Banda cualitativa y evidencias.
4. **La divulgación legal es parte del diseño**: 14 px, en el flujo, sobre fondo tintado.
5. **Nada promete evadir detectores.**

## Lo que queda abierto

- **Cómo se calculan los segmentos del resaltado**: diff en cliente (recomendado para empezar) o segmentos del modelo. Decisión de producto por el coste de IA.
- **Si el texto retenido del muro B viaja al cliente.** Con `aria-hidden` basta para accesibilidad, pero es legible desde las herramientas de desarrollo. La alternativa es retenerlo en servidor.
- **Correo de pago fallido**: recomendado, no estaba en el encargo.
- **El sitio es bilingüe** es/en y este paquete cubre solo el español. Las rutas `/en/` necesitan su propia traducción, y el copy inglés no es una traducción literal del español: hay que reescribirlo con la misma voz.
