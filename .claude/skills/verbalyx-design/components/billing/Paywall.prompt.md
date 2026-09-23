Muro de pago. Se muestra **solo** en respuesta a una acción del usuario, nunca al cargar.

```jsx
<Paywall trigger="overflow" attempted={812} perRequest={300} />
<Paywall trigger="quota" account="anonymous" partialResult={resultadoReal} fixed />
<Paywall trigger="tool" toolName="Parafraseador" fixed />
<Paywall trigger="feature" featureName="historial" popoverStyle={{ top: 44, left: 0 }} />
<Paywall trigger="trialEnd" fixed />
```

Cada disparador tiene su forma, y no son intercambiables:

| Disparador | Forma | Primario | Secundario |
| --- | --- | --- | --- |
| A `overflow` | barra ámbar dentro del editor, sin scrim | Ver planes (`soft`) | — |
| B `quota` | modal con resultado parcial real | Probar Ilimitado 3 días gratis | Crear cuenta / Ver Pro |
| C `tool` | modal estrecho sobre velo suave | Probar Ilimitado 3 días gratis | Ver planes |
| D `feature` | popover anclado al candado | Desbloquear con Pro | Cerrar |
| E `trialEnd` | pantalla completa, no descartable | Continuar en Ilimitado | Cambiar a Pro, **mismo tamaño** |

Reglas que no se negocian:

- **Un solo CTA primario**, salvo en E, donde los dos tienen el mismo tamaño y ancho por exigencia legal (uno `default`, otro `ink`).
- **El resultado parcial de B es real.** Un placeholder aquí es mentir.
- **La divulgación legal va a 14px sobre fondo tintado**, dentro del flujo. Nunca letra pequeña ni al pie.
- El trial es **solo sobre Ilimitado mensual**. Nunca sobre un ciclo anual.
- Privacidad con el matiz de la FAQ del sitio: en gratis no se guarda el texto, solo el recuento; en pago se guarda cifrado para el historial.
- Nada de prometer que el texto evade detectores.
- A **no interrumpe**: deja procesar las primeras 300 palabras y solo informa.
- E **no lleva X**. Su salida honesta es "Cancelar mi suscripción", visible en la misma pantalla.
- Descartable una vez ⇒ no vuelve en la misma sesión para el mismo disparador.
