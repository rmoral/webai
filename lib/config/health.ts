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

/** Where DATABASE_URL points, and what is wrong with it if anything. */
export interface DatabaseTarget {
  /** Host and port. Never the user, never the password. */
  endpoint: string | null;
  /** Null when the string looks right; otherwise what to change. */
  problem: string | null;
}

/**
 * Supabase hands out three connection strings and only one of them works
 * from Vercel for everything. The direct one resolves over IPv6, which the
 * functions cannot reach, so it fails exactly like a wrong password — from
 * a browser the two are indistinguishable. Reading the host apart tells
 * them apart without ever touching the credentials.
 */
export function databaseTarget(): DatabaseTarget {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return { endpoint: null, problem: "No está definida." };

  if (url.includes("YOUR-PASSWORD")) {
    return {
      endpoint: null,
      problem:
        "Sigue el marcador [YOUR-PASSWORD] sin sustituir por la contraseña real.",
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {
      endpoint: null,
      problem:
        "No es una URL válida. ¿Se ha colado un espacio o un salto de línea al pegarla?",
    };
  }

  const port = parsed.port || "5432";
  const endpoint = `${parsed.hostname}:${port}`;

  if (!parsed.password) {
    return { endpoint, problem: "La cadena no lleva contraseña." };
  }

  if (/^db\..+\.supabase\.co$/.test(parsed.hostname)) {
    return {
      endpoint,
      problem:
        "Es la conexión directa de Supabase: solo resuelve en IPv6 y las funciones de Vercel son IPv4, así que nunca conectará. Copia la cadena de Supabase → Connect → Session pooler.",
    };
  }

  if (parsed.hostname.endsWith(".pooler.supabase.com") && port === "6543") {
    return {
      endpoint,
      problem:
        "Es el transaction pooler. La app lee y escribe bien, pero «Migrate database» fallará porque ese puerto no admite DDL. El session pooler, puerto 5432, sirve para las dos cosas.",
    };
  }

  return { endpoint, problem: null };
}
