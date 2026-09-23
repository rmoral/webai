Pantalla de alta (`/registro`) y de acceso (`/login`). Un componente, dos rutas.

```jsx
<AuthPage mode="registro" onSwitch={() => router.push("/login")} />
```

- **El título lleva el beneficio, no la acción.** "Tu cuenta gratis: 500 palabras al día e historial de sesión", nunca "Inicia sesión para continuar".
- **Sin contraseña.** Google arriba, enlace mágico debajo. Sin campos extra: nombre y uso previsto se piden después, si acaso.
- **Sin campos de nombre ni de uso.** Cualquier campo añadido aquí cuesta conversión y no lo necesita nadie.
- La línea "Tu texto sigue en el editor" es funcional, no decorativa: el texto va a `sessionStorage` y el usuario aterriza donde estaba. Perder el texto al registrarse es la fuga más tonta del embudo.
- La nota de privacidad usa el matiz de la FAQ del sitio, y añade "Sin tarjeta" porque es lo que diferencia a Verbalyx de Undetectable.
