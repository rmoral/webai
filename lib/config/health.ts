// Which server configuration is present, and what breaks without it.
//
// This exists because the failure mode it catches is expensive: a missing
// variable takes down one path while the rest of the site looks fine, so it
// is found by a user rather than by us. The operator has no terminal, so the
// answer has to be readable from the browser.
//
// Values are never read out — only whether each one is set. NEXT_PUBLIC_*
// names are written literally because Next replaces them at build time and a
// dynamic lookup would always come back empty.

export interface ConfigCheck {
  name: string;
  present: boolean;
  /** What stops working when this is missing, in plain Spanish. */
  breaks: string;
  /** Whether the product is broken without it, as opposed to degraded. */
  critical: boolean;
}

export function configHealth(): ConfigCheck[] {
  const checks: Array<Omit<ConfigCheck, "present"> & { value?: string }> = [
    {
      name: "NEXT_PUBLIC_SUPABASE_URL",
      value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      breaks: "Nadie puede iniciar sesión.",
      critical: true,
    },
    {
      name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      breaks: "Nadie puede iniciar sesión.",
      critical: true,
    },
    {
      name: "SUPABASE_SERVICE_ROLE_KEY",
      value: process.env.SUPABASE_SERVICE_ROLE_KEY,
      breaks: "Borrar la cuenta desde «Mi cuenta» falla.",
      critical: false,
    },
    {
      name: "DATABASE_URL",
      value: process.env.DATABASE_URL,
      breaks: "Planes, uso y backoffice dejan de funcionar.",
      critical: true,
    },
    {
      name: "ANTHROPIC_API_KEY",
      value: process.env.ANTHROPIC_API_KEY,
      breaks:
        "Humanizador, parafraseador y corrector fallan. El detector no la usa.",
      critical: true,
    },
    {
      name: "STRIPE_SECRET_KEY",
      value: process.env.STRIPE_SECRET_KEY,
      breaks: "No se puede abrir el pago ni el portal de cliente.",
      critical: true,
    },
    {
      name: "STRIPE_WEBHOOK_SECRET",
      value: process.env.STRIPE_WEBHOOK_SECRET,
      breaks: "Se cobra, pero el plan del usuario nunca se activa.",
      critical: true,
    },
    {
      name: "IP_HASH_SECRET",
      value: process.env.IP_HASH_SECRET,
      breaks: "Toda petición de un visitante sin sesión responde error.",
      critical: true,
    },
    {
      name: "UPSTASH_REDIS_REST_URL",
      value: process.env.UPSTASH_REDIS_REST_URL,
      breaks: "Cuotas y límite de ráfaga fallan cerrados en producción.",
      critical: true,
    },
    {
      name: "UPSTASH_REDIS_REST_TOKEN",
      value: process.env.UPSTASH_REDIS_REST_TOKEN,
      breaks: "Cuotas y límite de ráfaga fallan cerrados en producción.",
      critical: true,
    },
    {
      name: "TURNSTILE_SECRET_KEY",
      value: process.env.TURNSTILE_SECRET_KEY,
      breaks: "Los visitantes sin sesión reciben 403 en las herramientas.",
      critical: true,
    },
    {
      name: "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
      value: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      breaks: "El widget anti-bot no se pinta y el visitante no puede pasar.",
      critical: true,
    },
    {
      name: "NEXT_PUBLIC_APP_URL",
      value: process.env.NEXT_PUBLIC_APP_URL,
      breaks: "Stripe vuelve al dominio de la petición, no al canónico.",
      critical: false,
    },
    {
      name: "DATA_ENCRYPTION_KEY",
      value: process.env.DATA_ENCRYPTION_KEY,
      breaks: "El historial cifrado de los planes de pago no funcionará.",
      critical: false,
    },
    {
      name: "ADMIN_EMAILS",
      value: process.env.ADMIN_EMAILS,
      breaks: "Nadie puede entrar en este backoffice.",
      critical: false,
    },
    {
      name: "RESEND_API_KEY",
      value: process.env.RESEND_API_KEY,
      breaks: "No se envían correos transaccionales.",
      critical: false,
    },
    {
      name: "SENTRY_DSN",
      value: process.env.SENTRY_DSN,
      breaks: "Los errores del servidor no se registran en ningún sitio.",
      critical: false,
    },
    {
      name: "NEXT_PUBLIC_POSTHOG_KEY",
      value: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      breaks: "No hay analítica de producto ni embudo de conversión.",
      critical: false,
    },
  ];

  return checks.map(({ value, ...rest }) => ({
    ...rest,
    present: Boolean(value && value.trim()),
  }));
}
