Use `Input` for single-line fields — today that means only the magic-link email field on the login card.

```jsx
<Input type="email" required placeholder="tu@correo.com" />
```

There are no visible field labels anywhere in Verbalyx: the placeholder plus the card description carries the meaning. Errors appear as a 14px `--destructive` paragraph below the form, not on the field.
