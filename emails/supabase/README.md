# Plantilla de Supabase Auth

`confirm-signup.es.html` es el correo número 1 del sistema (D6): el enlace de
confirmación y el enlace mágico. No lo envía esta aplicación, lo envía
Supabase, así que no hay forma de renderizarlo desde React Email ni de
cubrirlo con un test. Vive aquí para que esté versionado con el resto y para
que la próxima persona que lo cambie no tenga que buscarlo en un panel.

## Cómo se instala

1. Supabase → Authentication → Email Templates.
2. Pega el HTML en **Confirm signup** y en **Magic Link**, los dos.
3. Asunto, en ambos: `Confirma tu correo para entrar en Verbalyx`.
4. El cuerpo ya trae `{{ .ConfirmationURL }}`, que es la variable que
   Supabase sustituye. No la cambies de nombre.

## Por qué el remitente importa

Sin SMTP propio, Supabase manda desde `noreply@mail.app.supabase.io`, en
inglés y con su marca. Configura SMTP (Resend) con remitente
`Verbalyx <hola@verbalyx.ai>` en Authentication → Emails → SMTP Settings.

## Una cifra que caduca con la configuración

El texto dice que el enlace caduca en 60 minutos, que es el valor por defecto
de Supabase. Si se cambia en el panel, hay que cambiar también esta frase:
un correo que promete una hora y caduca en diez es peor que uno que no
promete nada.

## Inglés

Fuera de alcance a propósito. El copy en inglés necesita redacción nativa,
no una traducción de este.
