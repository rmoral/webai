Página de precios de Verbalyx.

```jsx
<PricingPage onNavigate={(d) => router.push(d === "registro" ? "/registro" : "/checkout/resumen")} />
```

Reglas que existen para evitar disputas de facturación, no por estética:

- **El toggle cambia el precio grande de la tarjeta.** Nunca dos precios compitiendo dentro de la misma tarjeta.
- **El trial solo se ofrece sobre Ilimitado mensual.** En anual el botón dice "Elegir Ilimitado anual" y la divulgación dice el importe que se cobra hoy. Un trial colgado de un cargo anual de 179,88 US$ es el patrón que genera las quejas del sector.
- **Cada tarjeta con cobro lleva su divulgación a 14px**, con fecha e importe exactos, dentro de la tarjeta.
- La línea de garantía ("Cancela online en dos clics") va sobre la tabla, no escondida al pie.
- La prueba social es un dato real del sistema (textos procesados esta semana). Sin testimonios inventados: si no hay, solo el contador.
