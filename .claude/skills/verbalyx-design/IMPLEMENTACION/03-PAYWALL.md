# Fase 2 · Muro de pago

Un componente, cinco disparadores, cinco formas distintas. Referencia: `components/billing/Paywall.jsx` y `explorations/Paywall - cinco variantes.html`. Estimación: 2 jornadas.

## Principio

**El muro nunca se abre en frío.** Siempre responde a una acción del usuario y aparece en el momento en que el límite le duele — no antes, cuando es ruido, ni después, cuando ya se fue.

```tsx
type PaywallTrigger = "overflow" | "quota" | "tool" | "feature" | "trialEnd";
```

| | Disparador | Forma | Descartable |
| --- | --- | --- | --- |
| A | `overflow` | barra dentro del editor | no aplica, no interrumpe |
| B | `quota` | modal con resultado parcial | sí |
| C | `tool` | modal estrecho sobre velo claro | sí |
| D | `feature` | popover anclado | sí |
| E | `trialEnd` | pantalla completa | **no** |

## A · Exceso por petición

**Cuándo:** el texto pegado supera `limits.wordsPerRequest` del plan actual.

**Qué hace:** nada que interrumpa. Desde la palabra 301 el texto sobrante se atenúa **en el propio editor** (opacidad 0,38), y bajo el panel aparece una barra ámbar:

- Contador `300 / 300` en mono, color `--danger-ink`.
- «**Procesamos las primeras 300 palabras** de las 812 que has pegado. Pro amplía el límite a 3.000 por petición; Ilimitado, a 8.000.»
- Botón `soft` «Ver planes».

El usuario **puede ejecutar igual** y se procesan las primeras 300. Ámbar y no rojo: es un tope, no un error. Se nombran los dos topes de pago para que sepa a qué plan saltar.

**Dónde:** dentro de `tool-editor.tsx`, entre los paneles y la barra de ejecutar.

## B · Cuota diaria agotada

**Cuándo:** el usuario pulsa ejecutar y `wordsUsedToday >= wordsPerDay`. La API devuelve 429.

**Clave de esta variante:** el resultado **ya está procesado**. Se muestran los primeros ~210 caracteres nítidos y el resto con `filter: blur(4.5px)` y un degradado de desvanecido. **Nunca un placeholder** — el usuario tiene que ver su texto.

Composición: badge ámbar `300 / 300 palabras de hoy` · titular «Tu texto está humanizado. Has agotado las palabras de hoy.» (primero lo bueno, después el límite) · subtítulo que cambia con el estado de cuenta · panel de resultado parcial · dos beneficios · CTA · divulgación · línea de confianza.

CTA secundario según la cuenta:

- Anónimo → «Crear cuenta gratis — 500 palabras al día». El salto barato, sin tarjeta.
- Registrado gratis → «Ver Pro — 14,99 US$/mes», **con el precio en el botón**.

**El primario abre el pago en contexto** (fase 3), no lleva a precios.

### Implicación de servidor

Hoy, con la cuota agotada, probablemente ni se llama al modelo. Para B hay que **procesar y devolver el resultado, marcado como retenido**:

```ts
// 429 con cuerpo útil
{
  error: "quota_exceeded",
  partialResult: string,   // el resultado completo
  visibleChars: 210,       // lo que el cliente muestra nítido
  usedToday: 300,
  limitToday: 300,
}
```

Decide con el equipo si se procesa el texto entero o solo lo que cabe en la cuota. **Recomendación:** procesarlo entero y retener la vista. El coste de IA de un texto corto es céntimos y la conversión de enseñar el resultado a medias es el motor de toda la variante. Ponle un tope de seguridad (p. ej. no procesar más de 2× el límite del plan) para que no sea un vector de abuso.

## C · Herramienta de pago

**Cuándo:** un usuario gratuito abre el parafraseador o el corrector.

Modal **estrecho** (27 rem, no 33) sobre un **velo claro con desenfoque de 2 px** — `--background` al 62 %, no un scrim oscuro. El editor se ve detrás: no expulsa, deja ver qué hay.

Abre con badge «Plan de pago» y **recuerda lo que sí es gratis**: «El humanizador y el detector siguen siendo gratis, con o sin cuenta.» Evita la sensación de muro total.

Secundario «Ver planes», no «Crear cuenta»: aquí el usuario ya está dentro.

## D · Función de pago

**Cuándo:** se pulsa el candado del historial o del desglose por pasajes.

**Popover anclado**, no modal: el usuario no sale de donde está. Es el muro más leve.

- Título: «El historial es de los planes de pago».
- Cuerpo con el matiz de privacidad correcto: en pago se guarda cifrado; en gratis solo el recuento.
- «Desbloquear con Pro» + «Cerrar».
- **Sin divulgación legal**, porque el CTA lleva a precios y no inicia ningún cobro.
- Sin prueba: el salto natural desde una función suelta es Pro, no Ilimitado.
- En móvil se ancla a los márgenes en vez de a 19 rem fijos.

## E · Fin de la prueba

**Cuándo:** día 3, al entrar en la app, **antes del cobro**.

Única variante a pantalla completa y **única no descartable**. No lleva X.

- Badge ámbar «Tu prueba termina hoy».
- Titular: «Elige cómo sigues. Hoy todavía no se te ha cobrado nada.»
- **Dos tarjetas de igual peso**: Ilimitado 29,99 y Pro 14,99. Botones del **mismo tamaño y ancho**, uno `default` azul y otro `ink` negro. Ninguno es «el bueno». Es la única pantalla del sistema con dos primarios, y es por exigencia legal.
- Divulgación con las tres salidas, incluido el prorrateo al bajar a Pro.
- **«Cancelar mi suscripción» visible en la misma pantalla**, en `ghost`. Es lo que el sector esconde y lo que evita las disputas.

## Reglas comunes

1. **Un solo CTA primario**, salvo E.
2. **Divulgación a 14 px, fondo `--brand-softer`, borde `--brand-line`, dentro del flujo.** Nunca letra pequeña, nunca al pie, nunca colapsada.
3. **La prueba es solo de Ilimitado mensual.** Ningún muro ofrece prueba anual.
4. Privacidad con el matiz de la FAQ: en gratis no se guarda el texto, solo el recuento; en pago se guarda cifrado para el historial. **No** uses el absoluto del pie del sitio.
5. Ninguna promesa de evadir detectores.
6. **Descartado una vez ⇒ no vuelve en la misma sesión para el mismo disparador.** Guarda `paywall_dismissed_{trigger}` en `sessionStorage`. E queda fuera: no se descarta.
7. Móvil < 520 px: los modales pasan a **hoja inferior** a ancho completo, esquinas superiores redondeadas, 94 % de alto máximo, botones de 44 px.

## Accesibilidad

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` al titular.
- Foco atrapado dentro del modal mientras está abierto; al cerrar vuelve al elemento que lo abrió.
- `Esc` cierra en A–D. **En E no.**
- El desenfoque del resultado parcial es decorativo: el texto retenido **no debe estar en el DOM accesible** legible. Usa `aria-hidden` en la parte difuminada; si no, un lector de pantalla lo lee entero y el muro no existe.

> Ese último punto también es de seguridad: si el texto retenido llega al cliente, se puede leer desde las herramientas de desarrollo. Si eso os preocupa, envía solo los `visibleChars` y guarda el resto en servidor hasta que se pague. Decisión de producto: dilo antes de implementarlo de una u otra forma.

## Telemetría

Un evento por muro, con `trigger`, `plan`, `accountState` y `toolId`:

`paywall_shown` · `paywall_dismissed` · `paywall_primary_clicked` · `paywall_secondary_clicked` · `paywall_converted`

Sin esto no sabréis cuál de los cinco funciona, que es justo lo que hay que medir el primer mes.
