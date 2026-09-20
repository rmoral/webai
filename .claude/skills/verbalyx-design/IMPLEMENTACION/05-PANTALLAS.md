# Fase 4 · Pantallas

Referencia: `ui_kits/auth/`, `ui_kits/marketing/PricingPage.jsx`, `ui_kits/checkout/`. Estimación: 2 jornadas.

## 4.1 · `/registro` y `/login`

**Dos rutas separadas, un componente.** Hoy solo existe `/login`, y quien llega desde «Crear cuenta gratis» duda de si está en el sitio correcto.

- `/registro` → alta. `/login` → acceso. Enlace cruzado al pie de cada una.
- Arregla los enlaces: en el footer y en la tarjeta Gratis, «Crear cuenta gratis» debe ir a `/registro`.

**El título lleva el beneficio, no la acción:**

- `/registro`: «Tu cuenta gratis: 500 palabras al día e historial de sesión»
- `/login`: «Vuelve a tu cuenta»

Composición: cabecera mínima con la marca · título · lede · (solo alta) bloque azul con los dos beneficios · botón Google a ancho completo · separador «o» · campo de correo + «Enviarme un enlace de acceso» · línea del texto conservado · nota de privacidad · enlace cruzado · (solo alta) línea legal.

**Nada de contraseñas. Nada de campos de nombre ni de uso.** Cada campo aquí cuesta conversión y ninguno hace falta.

### El texto conservado es funcional, no decorativo

«Tu texto sigue en el editor. Al volver lo encuentras tal cual, sin recuperar nada.»

Para que sea verdad: guarda el contenido del editor en `sessionStorage` antes de navegar a `/registro`, y tras el alta devuelve al usuario **a la herramienta donde estaba** con el texto restaurado. Perder el texto al registrarse es la fuga más tonta del embudo.

Pasa el origen en la URL (`/registro?from=/humanizador-de-texto-ia`) y respétalo en el callback de auth.

## 4.2 · `/precios`

Tres planes más recarga. Referencia: `ui_kits/marketing/PricingPage.jsx`.

**El toggle cambia el precio grande de la tarjeta**, no un texto secundario. Nunca dos precios compitiendo dentro de la misma tarjeta — es el problema del sitio actual.

| | Anual | Mensual |
| --- | --- | --- |
| Gratis | 0,00 US$ | 0,00 US$ |
| Pro | **7,49 US$**/mes · 89,88 al año | **14,99 US$**/mes |
| Ilimitado | **14,99 US$**/mes · 179,88 al año | **29,99 US$**/mes + prueba de 3 días |

**La regla que cierra el agujero:**

- Ilimitado **mensual** → badge «Prueba 3 días», botón «Probar 3 días gratis», divulgación con la fecha del primer cargo.
- Ilimitado **anual** → sin badge, botón «Elegir Ilimitado anual», divulgación: «El plan anual se cobra hoy, entero: 179,88 US$. No lleva prueba gratuita — la prueba de 3 días solo existe en el ciclo mensual, para que nadie acabe con un cargo anual que no esperaba.»

Explicar por qué no hay prueba en anual convierte una carencia en una señal de honestidad.

Resto de la página: contador real de textos procesados (**sin testimonios inventados**) · línea de garantía «Cancela online en dos clics» **sobre** la tabla · tabla comparativa con la fila de recarga · FAQ de facturación con las seis preguntas de `07-COPY.md` · nota legal final sobre impuestos y renovación.

## 4.3 · `/checkout`

Ver `04-PAGO.md`. La página existe para quien llega desde precios; quien choca con un muro paga en el modal.

- Izquierda: `OrderSummary` con el ciclo cambiable y el enlace «¿Cómo cancelo?» que abre los dos pasos reales **antes** de pedir la tarjeta.
- Derecha: `PaymentForm`.
- El desglose muestra la prueba como línea negativa («−29,99 US$») para que «Hoy pagas 0,00 US$» sea **verificable**, no una afirmación.
- Impuestos: «Se calculan al pagar».
- En móvil se apila: primero resumen, después pago.

## 4.4 · `/checkout/listo`

- Badge verde «Prueba activa» o «Suscripción activa».
- **La fecha del primer cobro es el elemento más grande de la pantalla**, en su propia tarjeta con el importe debajo. Es el dato que evita la disputa.
- Tres filas: plan, pagado hoy, correo de confirmación.
- Un solo primario «Ir a la app»; «Gestionar suscripción» en `outline`, visible desde el primer segundo.
- Cierre: confirma que el correo salió y que habrá recordatorio el día antes.

## 4.5 · Cambios en las pantallas existentes

**`app/(marketing)/layout.tsx`** — hoy solo tiene footer. Añade:

- Cabecera pegajosa con fondo translúcido y `backdrop-filter: blur(10px)`: marca, Precios/Blog/Ayuda, «Entrar» `ghost` y «Crear cuenta gratis» `default`.
- `<ToolTabs>` debajo, a ancho completo.
- Footer en grupos de enlaces (Herramientas, Para quién, Producto, Legal). Es infraestructura SEO.

**`app/(app)/layout.tsx`** — añade `<ToolTabs>` bajo la fila existente y la `QuotaBar` junto al badge del plan, con `showPlan={false}` para no nombrar el plan dos veces.

**`app/(app)/app/page.tsx`** — deja de ser una rejilla de tarjetas: redirige a la herramienta activa. Las pestañas hacen ese trabajo.

**`app/(marketing)/page.tsx`** — el editor sube a la portada: titular, píldora «Sin registro · 300 palabras al día» y `<ToolEditor>`. Es la página con más tráfico; que se pueda usar el producto sin un clic más.

**Anchura:** de `max-w-4xl` a `max-w-[65rem]` en marketing y app. El editor de dos paneles lo necesita. `cuenta` se queda en `max-w-2xl`, `admin` en `max-w-6xl`.

## 4.6 · Una landing por herramienta

Las cuatro están vivas, así que las cuatro necesitan su página, con los paths de `lib/ai/tools.ts` y el esqueleto de `humanizador-de-texto-ia`: H1, lede, editor, prosa, FAQ, JSON-LD.

**El detector es distinto:** usa `EvidenceBand`, exige 200 palabras y 8 frases, y su página explica por qué no damos un porcentaje. No le pongas una cifra ni por error.
