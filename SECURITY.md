# Seguridad — modelo de amenazas y decisiones

> Qué protege la plataforma, cómo, y qué queda pendiente. El código de esta capa vive en `lib/security/`, `lib/usage/quotas.ts`, `next.config.ts` (cabeceras) y `lib/db/migrations/0001_enable_rls.sql`.

## Modelo de amenazas (qué nos puede atacar)

| Amenaza                                                                 | Mitigación                                                                                                                                                | Estado                                          |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Scraping/abuso del tier gratuito (bots agotando la API de IA → coste)   | Turnstile en endpoints anónimos + rate limit por sujeto (Upstash) + cuota diaria de palabras + tope duro de tamaño de entrada                             | ✅ Código listo; se activa con las credenciales |
| Inyección vía input del usuario (payloads gigantes, campos inesperados) | Validación zod estricta en todo endpoint (`lib/security/validation.ts`), tope de 80 K caracteres, modos con lista cerrada                                 | ✅                                              |
| Robo/filtración de datos de usuarios                                    | RLS deny-by-default en todas las tablas; cifrado app-level AES-256-GCM del texto de documentos Pro; no se guarda texto de usuarios no-Pro (solo métricas) | ✅                                              |
| Acceso entre usuarios (IDOR)                                            | RLS con `auth.uid()` + todo gating server-side por `entitlements.ts`; las claves anónimas de Supabase no pueden leer filas ajenas                         | ✅                                              |
| Clickjacking, MIME sniffing, downgrade a HTTP                           | `frame-ancestors 'none'`, `nosniff`, HSTS con preload, CSP completa en `next.config.ts`                                                                   | ✅                                              |
| XSS                                                                     | React escapa por defecto + CSP; regla: nunca `dangerouslySetInnerHTML` con contenido de usuario                                                           | ✅                                              |
| Webhooks de Stripe falsificados o repetidos                             | Verificación de firma (`STRIPE_WEBHOOK_SECRET`) + idempotencia por `event.id` (tabla `stripe_events`)                                                     | ✅                                              |
| Exposición de claves de API                                             | Solo llamadas server-side; claves solo en variables de entorno de Vercel; `.env*` en gitignore; `poweredByHeader` off                                     | ✅                                              |
| Almacenar IPs en claro (RGPD)                                           | HMAC-SHA256 con `IP_HASH_SECRET` (`hashIp`); nunca se persiste la IP original                                                                             | ✅                                              |
| CSRF                                                                    | Server Actions de Next validan Origin; los endpoints API solo aceptan JSON del mismo origen (`form-action 'self'`)                                        | ✅                                              |

## Decisión sobre cifrado

- **En reposo**: Supabase ya cifra todo el disco (AES-256). Stripe custodia los datos de pago: nunca tocan nuestra base de datos.
- **App-level (añadido)**: el texto de los documentos Pro (`documents.input_text/output_text`) se cifra **antes** de insertarse, con AES-256-GCM y clave en `DATA_ENCRYPTION_KEY` (solo en Vercel). Así, ni un volcado de la base de datos ni el panel de Supabase exponen el contenido de los usuarios. GCM además autentica: un ciphertext manipulado no descifra.
- **No se cifran** columnas de métricas/atribución (no contienen texto del usuario) — cifrarlas impediría agregarlas en SQL sin beneficio real.
- Formato versionado (`v1.iv.tag.ciphertext`) para poder rotar clave/algoritmo sin migración destructiva.

## Reglas de operación (checklist para las cuentas que estás creando)

- **Supabase**: activar _leaked password protection_ y confirmar que RLS está ON tras `pnpm db:migrate`; no usar nunca el `service_role` key en el cliente; restringir el acceso al panel con 2FA.
- **Vercel**: todas las claves como variables de entorno (nunca en el repo); generar `IP_HASH_SECRET` y `DATA_ENCRYPTION_KEY` con `openssl rand -base64 32` y guardar copia de `DATA_ENCRYPTION_KEY` en un gestor de contraseñas (si se pierde, los documentos cifrados son irrecuperables).
- **Stripe**: modo test hasta el Sprint 2; activar Radar (antifraude) al pasar a live.
- **Cloudflare**: WAF en modo estándar + bot fight mode; el dominio con proxy naranja.
- **2FA en todas las cuentas** (GitHub, Supabase, Stripe, Vercel, Cloudflare, Google).

## Fallos seguros

- Rate limiting y Turnstile: **fail-closed en producción** (si Upstash/Turnstile no están configurados, el endpoint rechaza); en desarrollo se desactivan para poder trabajar sin credenciales.
- CSP: al añadir un script de terceros (GTM, etc.) hay que ampliarla en `next.config.ts`; si no, el navegador lo bloquea (mejor bloquear que abrir).

## Pendiente por sprint

- Sprint 3: botón "Eliminar mi cuenta y datos" (RGPD) en /app/cuenta.
- Sprint 4: revisar CSP al añadir GTM/Consent Mode; cabecera `Report-To` para violaciones de CSP.
- Antes de live: pasar `/security-review` sobre el diff acumulado y revisar dependencias (`pnpm audit`).
