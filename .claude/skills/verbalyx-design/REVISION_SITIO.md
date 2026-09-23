# Revisión de verbalyx.ai — 18 de septiembre de 2026

Revisión hecha antes de diseñar nada, tal como pedías. Cubre lo que sí es observable sin cuenta y dice explícitamente qué no lo es.

## Qué pude ver y qué no

| Pantalla | Estado |
| --- | --- |
| `/` (home) | Vista completa |
| `/humanizador-de-texto-ia` | Vista completa |
| `/detector-de-ia` | Vista completa |
| `/precios` | Vista completa |
| `/login` | **No observable.** Devuelve el documento con `<body>` vacío: la pantalla se monta en cliente y no hay HTML servido. Igual que reportabas en el estudio |
| Pegar >300 palabras | **No observable sin ejecutar JS.** El editor y su contador son cliente; el HTML servido solo trae el estado inicial ("0 palabras", "El resultado aparecerá aquí") |
| Agotar la cuota diaria | **No observable.** Requiere consumir cuota real contra la API |
| `/parafrasear-texto`, `/corrector-ortografico-gramatical` | Existen en navegación y footer; no los abrí uno a uno |
| Checkout, correos, app autenticada | No accesibles sin cuenta |

Sobre los tres puntos no observables: no voy a inferir su comportamiento. Lo que diseño a partir de aquí es la especificación de la sección 4, no una corrección de algo que haya visto.

## Hallazgos que cambian el encargo

### 1. El sitio vivo va muy por delante del repositorio que se usó para este sistema de diseño

Este proyecto se construyó a partir de `rmoral/webai`, que tenía: precios en euros (9,99 €/mes, 59,99 €/año), dos planes, una sola herramienta viva y tres marcadas "muy pronto". El sitio en producción tiene:

- **Titularidad y moneda distintas**: YBB Solutions, LLC. Precios en dólares, impuestos excluidos y calculados en el pago.
- **Tres planes más recarga**: Gratis (0,00 US$), Pro (7,49 US$/mes anual · 89,88 US$/año · 14,99 mensual), Ilimitado (14,99 US$/mes anual · 179,88 US$/año · 29,99 mensual) y recarga de 9,99 US$ por 25.000 palabras que no caducan.
- **Las cuatro herramientas están vivas**, no tres "muy pronto".
- **Sitio bilingüe** es/en con conmutador en la cabecera y rutas paralelas (`/en/pricing`, `/en/ai-humanizer`, `/en/ai-detector`).
- Límites reales: anónimo 300/día y 300 por petición; cuenta gratis 500/día; Pro 60.000/mes y 3.000 por petición; Ilimitado 500.000/mes y 8.000 por petición.

**Consecuencia:** el kit `ui_kits/marketing/PricingPage.jsx` de este sistema está obsoleto (euros, dos planes) y la home del kit sigue marcando herramientas como "muy pronto". Hay que resincronizar; lo señalo aquí y no lo toco todavía porque no me lo has pedido.

### 2. El detector NO da porcentajes — y mi componente `ScoreGauge` sí

Esto es lo más serio que encontré. La página del detector dedica una sección entera a explicar por qué no hay un número, y la FAQ lo repite dos veces. El sitio entrega **banda cualitativa** (sin indicios / algunos indicios / indicios claros) más la lista de evidencias, y argumenta que un porcentaje "sería inventado".

El `ScoreGauge` que añadí en la iteración anterior pinta un anillo con "72 %". **Contradice frontalmente la postura del producto.** No es un detalle de estilo: es exactamente lo que la página del detector señala como deshonesto.

Propongo sustituirlo por un `EvidenceBand` (banda + lista de hallazgos, sin cifra). No lo he hecho en este turno porque el encargo era paywall y registro, pero no debería sobrevivir a la próxima iteración. **Y no lo uso en ninguna pantalla nueva.**

### 3. El muro de pago actual es, literalmente, un párrafo

Idéntico en home, humanizador y detector, siempre debajo del editor:

> **¿Textos más largos?** Los planes de pago amplían el límite por petición, guardan tu historial y desbloquean todas las herramientas. → Ver planes

Y una segunda repetición al pie del contenido ("¿Necesitas más palabras al día? Consulta los planes"). Confirma tu diagnóstico: es pasivo, está siempre presente —lo que lo vuelve invisible— y no ocurre en el momento del límite. No hay ningún tratamiento del límite dentro del editor.

### 4. La ambigüedad de ciclo que describes está en la página, y es peor de lo que dice el estudio

En la tarjeta de Ilimitado conviven, a la vez:

- Cabecera: **14,99 US$ /mes**
- Bajo ella: 179,88 US$ al año — ahorras 180,00 US$. Mensual: 29,99 US$
- Botón primario: **Probar 3 días gratis**
- Botón secundario: Ilimitado anual
- Divulgación: al terminar los 3 días **se te cobrarán 29,99 US$/mes**

El usuario lee 14,99, pulsa "probar" y la divulgación le dice 29,99. Los dos números de la cabecera y de la divulgación **no coinciden nunca** en ningún camino: 14,99 es el equivalente mensual del anual, pero el trial es sobre el mensual. Es el punto 3 de tus anti-patrones, y la tarjeta de Pro tiene la misma estructura. El toggle de la sección 4.3 lo resuelve.

Dicho esto: **la divulgación en sí es de las mejores que he visto en el sector.** Fecha exacta, importe exacto, mención al downgrade a Pro y a los dos clics de cancelación. El problema es el anclaje del precio de cabecera, no el texto legal.

### 5. Lo que hay que conservar del tono, porque es el activo real

El copy del sitio es mejor que el de cualquier competidor del estudio, y es lo que no se puede romper al meter un paywall:

- «Humanizar no es un pase mágico por un detector.»
- «No lo prometemos, y desconfía de quien lo haga.»
- «Es menos vistoso y es más honesto.»
- «Garantizar un resultado sobre una herramienta de terceros sería venderte humo.»
- «Entre dejar pasar un texto generado y señalar a alguien que escribió su trabajo, los dos errores no cuestan lo mismo.»

Frases cortas, sin superlativos, admitiendo límites. Un muro de pago escrito en otro registro se notaría inmediatamente. Todo el copy que propongo va calibrado contra estas frases.

### 6. Detalles menores

- El pie dice "No guardamos los textos de los planes gratuitos" pero la FAQ del humanizador matiza mejor: en pago se guardan **cifrados** para el historial; en gratis solo el recuento. El muro debe usar el matiz de la FAQ, no el absoluto del pie.
- No hay prueba social en ninguna pantalla, confirmado.
- No hay FAQ de facturación en precios, confirmado.
- "Crear cuenta gratis" apunta a `/login` desde el footer y desde la tarjeta Gratis. Confirmado el problema de rutas.
- El detector exige **200 palabras y 8 frases** como mínimo, y responde "en gris" por debajo. Es un estado de vacío que ningún competidor tiene y que el sistema de diseño no cubre.

## Lo que asumo para el diseño

Datos tomados del sitio vivo, no del repositorio:

| Dato | Valor |
| --- | --- |
| Cuota anónima | 300 palabras/día, 300 por petición |
| Cuota cuenta gratis | 500 palabras/día |
| Pro | 14,99 US$/mes · 3.000 por petición · 60.000/mes |
| Ilimitado | 29,99 US$/mes · 8.000 por petición · 500.000/mes |
| Trial | 3 días, solo sobre Ilimitado **mensual** (sección 4.3, punto 2) |
| Fecha de ejemplo | 21 de septiembre de 2026 |

Si alguno no es correcto, dímelo antes de que siga: se propaga a las cinco variantes, a precios, al checkout y a los dos correos.
