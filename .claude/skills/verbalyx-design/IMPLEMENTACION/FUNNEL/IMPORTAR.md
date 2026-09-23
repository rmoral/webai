# Cómo importar la skill de diseño en `rmoral/webai` y arrancar con Claude Code

Paquete: `verbalyx-design-2026-09-23.zip`. Dentro va una sola carpeta, `.claude/skills/verbalyx-design/`, con la misma ruta que tiene en el repo. Al descomprimirlo en la raíz del repo, cae en su sitio.

## 1 · Prepara el repo (terminal, 2 minutos)

```bash
cd ruta/a/webai
git checkout main
git pull
git status            # tiene que salir limpio; si no, guarda o descarta antes
git checkout -b chore/skill-sync-2026-09-23
```

## 2 · Sustituye la copia antigua de la skill

La copia actual es anterior al 19-09-2026 y todavía trae `ScoreGauge`. No la mezcles con la nueva: bórrala entera y descomprime encima.

```bash
git rm -r -q .claude/skills/verbalyx-design
unzip ~/Descargas/verbalyx-design-2026-09-23.zip -d .
```

En Windows (PowerShell):

```powershell
git rm -r -q .claude/skills/verbalyx-design
Expand-Archive -Path "$HOME\Downloads\verbalyx-design-2026-09-23.zip" -DestinationPath . -Force
```

Comprueba:

```bash
ls .claude/skills/verbalyx-design                                  # SKILL.md, readme.md, components/, emails/, IMPLEMENTACION/…
ls .claude/skills/verbalyx-design/components/tools | grep -i score  # no debe salir nada
ls .claude/skills/verbalyx-design/IMPLEMENTACION/FUNNEL            # README.md C7-C8.md C9-C13.md C14.md PROMPT.md IMPORTAR.md
```

## 3 · Que no la toquen el lint, el formateo ni el typecheck

La skill trae `.jsx` y `.html` que no son código de la app. El repo ya ignoraba la copia anterior: comprueba que sigue siendo así.

```bash
grep -n "claude" .prettierignore eslint.config.mjs tsconfig.json
```

Si alguno no excluye `.claude/`, añádelo:

- `.prettierignore`: una línea `.claude/`
- `eslint.config.mjs`: `.claude/**` en `ignores`
- `tsconfig.json`: `".claude"` en `exclude`

Después:

```bash
pnpm lint && pnpm typecheck && pnpm test
```

Tiene que pasar igual que antes: el commit no toca código de la app.

## 4 · Commit y PR de la sincronización

```bash
git add -A .claude/skills/verbalyx-design .prettierignore eslint.config.mjs tsconfig.json
git commit -m "chore(skill): sync verbalyx-design 2026-09-23 (D1–D6, drop ScoreGauge)"
git push -u origin chore/skill-sync-2026-09-23
```

Abre el PR, espera a que la preview de Vercel y la CI pasen en verde, y fusiónalo en `main`. **Esto va antes que cualquier ticket:** así Claude Code lee la versión buena de la skill.

## 5 · Arranca Claude Code

```bash
git checkout main && git pull
claude
```

Dentro de Claude Code:

1. Comprueba que ve la skill: escribe `/skills` (o pregúntale «¿qué skills tienes disponibles?»). Tiene que aparecer `verbalyx-design`.
2. Pega el contenido de `.claude/skills/verbalyx-design/IMPLEMENTACION/FUNNEL/PROMPT.md` **desde la línea «Vas a implementar…»**. Sáltate el paso 0: ya lo has hecho a mano.
3. Pídele que empiece por leer y resumir, no por programar:
   > Lee IMPLEMENTACION/FUNNEL/README.md y C7-C8.md de la skill y dime qué vas a cambiar en C8, archivo por archivo, antes de tocar nada.

## 6 · Un ticket, una rama, un PR

Orden: **C8 → C7 → C9 → C10 → C11 → C12 → C13 → C14**.

Para cada uno:

```
Implementa C8 siguiendo IMPLEMENTACION/FUNNEL/C7-C8.md. Rama feat/c8-limites-editor.
Al acabar: pnpm lint, pnpm typecheck, pnpm test y pnpm test:e2e, y dime qué has verificado
en móvil (390 px) y en escritorio, anónimo y con sesión.
```

Claude Code te preguntará dos cosas (vienen en el prompt). Tenlas decididas:

- **Antes de C8:** ¿el detector rechaza los textos de más palabras que el límite por petición, o analiza solo las primeras y lo dice?
- **Antes de C9:** el texto nuevo de la cláusula «Precios e impuestos» de `legal.terms`, revisado por quien lleve lo legal.

Y dos datos para C9 y C14:

- La cifra real de palabras procesadas y el mes desde el que se cuenta (Claude Code puede calcularla con `getWordsProcessed()`, pero no se publica hasta que la valides).
- Que el descriptor del extracto en Stripe (Settings → Public details → Statement descriptor) sea `VERBALYX`.

## 7 · Revisión de cada PR

- **Copy:** compara con la exploración correspondiente (`explorations/D1 … D6`). Puedes abrir los `.html` directamente en el navegador desde la carpeta de la skill.
- **Cifras:** ninguna escrita a mano en un componente. Busca con `grep -rn "500\|300\|60.000\|29,99" components app`: solo deben salir en tests o en `lib/billing/plans.ts`.
- **Textos del usuario:** con 923 palabras pegadas y 200 de saldo, el texto sigue entero en el editor antes y después de ejecutar.
- **Eventos:** con PostHog en modo debug, cada ticket emite lo que dice su guía.

## 8 · Al terminar C14

Haz la compra y la cancelación reales de C15 y comprueba:

- que llegan los correos 3 (o 3b) y 5 (o 5b);
- que el extracto dice VERBALYX;
- que la fecha y el importe del correo coinciden con los de Stripe.

Cuando vuelvas a Claude Design, pulsa «Sync»: el proyecto leerá lo que haya cambiado en `main` desde el 23-09-2026 y actualizará `github.md`.
