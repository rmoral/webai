Resultado del Detector de IA. **Nunca muestres un porcentaje.**

```jsx
<EvidenceBand
  band="clear"
  findings={[
    { label: "Frases de longitud casi idéntica en todo el texto", tone: "bad" },
    { label: "Conectores de relleno repetidos («es importante destacar»)", tone: "bad" },
    { label: "Terminología técnica coherente y bien empleada", tone: "good" },
  ]}
/>
```

Reglas, y son la postura del producto, no una preferencia visual:

- **Tres bandas: «Sin indicios», «Algunos indicios», «Indicios claros».** Ninguna cifra, ningún anillo, ninguna barra de 0 a 100. Una cifra da una precisión que la herramienta no tiene.
- **La lista de evidencias es el producto**, no un adorno de la banda. Una banda sin evidencias no se entrega.
- Por debajo de 200 palabras u 8 frases, `band="insufficient"`: se dice que no hay texto suficiente en vez de dar una lectura mala.
- **El descargo siempre.** Recuerda que los dos errores posibles no cuestan lo mismo: acusar a quien escribió su propio texto es peor que dejar pasar uno generado.
- Nada de prometer que un texto evade detectores de terceros, ni aquí ni en el humanizador.
