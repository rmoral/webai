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
      name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      value: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      breaks:
        "El campo de tarjeta no se pinta: la página de pago carga y no se puede pagar.",
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
      // Sentry reads two different variables and the panel only named one,
      // so a deployment with SENTRY_DSN set looked fully instrumented
      // while every error in a browser -- a card field that fails to
      // mount, a wall that throws -- went nowhere and said nothing.
      name: "NEXT_PUBLIC_SENTRY_DSN",
      value: process.env.NEXT_PUBLIC_SENTRY_DSN,
      breaks:
        "Los errores del navegador no se registran: el pago puede romperse en el cliente sin dejar rastro.",
      critical: false,
    },
    {
      name: "NEXT_PUBLIC_POSTHOG_KEY",
      value: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      breaks: "No hay analítica de producto ni embudo de conversión.",
      critical: false,
    },
    {
      // Deliberately absent outside production: a measurement id set
      // everywhere turns every click on a preview into traffic on the
      // property the ad spend is judged by.
      name: "NEXT_PUBLIC_GA_ID",
      value: process.env.NEXT_PUBLIC_GA_ID,
      breaks:
        "Google Analytics no carga: la campaña de anuncios no puede medir conversiones ni hacer remarketing.",
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
        "No es una URL válida. Suele ser un carácter sin codificar en la contraseña: #, ? o / la rompen. Lo más simple es resetearla en Supabase por una de solo letras y números.",
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

  if (parsed.hostname.endsWith(".pooler.supabase.com")) {
    // The pooler routes by the project ref carried in the username. With a
    // bare `postgres` it has no tenant to route to and refuses the
    // connection, which it reports as an SSL problem rather than a naming
    // one. Easy to hit by swapping only the host of the direct string.
    const expected = expectedPoolerUser();
    const actual = decodeURIComponent(parsed.username);
    if (expected && actual !== expected) {
      return {
        endpoint,
        problem: `El usuario debe ser ${expected}, no ${actual}. El pooler enruta por el ref del proyecto que va en el usuario; sin él no sabe a qué base de datos conectar.`,
      };
    }
  }

  // A password containing a raw @ still parses -- the last @ wins as the
  // delimiter -- so the host reads correctly and only the credentials come
  // out wrong. Nothing downstream can tell that from a wrong password.
  if ((url.match(/@/g) ?? []).length > 1) {
    return {
      endpoint,
      problem:
        "La contraseña contiene una @ sin codificar, así que se corta al leer la cadena. Escríbela como %40, o resetea la contraseña en Supabase por una de solo letras y números.",
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

/** The pooler username this project should be using, from its Supabase URL. */
function expectedPoolerUser(): string | null {
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabase) return null;
  try {
    const ref = new URL(supabase).hostname.split(".")[0];
    return ref ? `postgres.${ref}` : null;
  } catch {
    return null;
  }
}

/** Why a database query failed, in terms the operator can act on. */
export interface DatabaseFailure {
  /** The driver's own complaint, with any credentials stripped. */
  detail: string;
  /** What to do about it, when the Postgres error code says plainly enough. */
  hint: string | null;
}

// Postgres answers a misconfiguration with a code before it answers with
// prose, and the code is the part that maps to an action. Only the ones a
// fresh deployment actually hits are listed; anything else falls through
// to the driver's own words.
const MIGRATIONS_PENDING =
  "Lánzalas desde GitHub → Actions → «Migrate database» → Run workflow.";

const HINTS: Record<string, string> = {
  "42P01": `La tabla no existe: las migraciones no se han aplicado a esta base de datos. ${MIGRATIONS_PENDING}`,
  "42501":
    "El usuario de la cadena no tiene permiso sobre la tabla. Usa el usuario postgres del proyecto.",
  "28P01":
    "Contraseña incorrecta. Si lleva caracteres como @, #, ? o /, la cadena se lee mal aunque la contraseña sea la buena. Lo más rápido: resetéala en Supabase → Settings → Database por una de solo letras y números, y actualízala aquí y en el secret DATABASE_URL de GitHub Actions.",
  "28000":
    "Usuario rechazado. En el pooler el usuario es postgres.<ref-del-proyecto>, no solo postgres.",
  "3D000":
    "La base de datos del final de la cadena no existe. Debe terminar en /postgres.",
  XX000:
    "El pooler rechaza la conexión. Casi siempre es el usuario: debe ser postgres.<ref-del-proyecto>, no solo postgres. El pooler lo comunica como un problema de SSL, pero lo que le falta es saber a qué proyecto conectar.",
  ENOTFOUND: "El host no resuelve. Revisa que esté bien escrito.",
  ECONNREFUSED: "El host resuelve pero rechaza la conexión. Revisa el puerto.",
  ETIMEDOUT:
    "La conexión expira sin respuesta. Es lo que ocurre con la conexión directa de Supabase, que solo resuelve en IPv6.",
};

/**
 * Drizzle wraps the driver's error and its own message is just the SQL it
 * tried, which says nothing about why. The reason — the Postgres code and
 * complaint — is in `cause`, so unwrap to the innermost error before
 * reporting. Without this the panel shows a query and no diagnosis.
 */
export function describeDatabaseFailure(error: unknown): DatabaseFailure {
  let inner: unknown = error;
  // Bounded: an error chain should be short, and cause can be cyclic.
  for (let depth = 0; depth < 5; depth++) {
    const next = inner instanceof Error ? inner.cause : undefined;
    if (!next || next === inner) break;
    inner = next;
  }

  const message = inner instanceof Error ? inner.message : String(inner);
  const raw = (inner as { code?: unknown })?.code;
  const code = typeof raw === "string" ? raw : null;

  // A value the code knows and the database does not means the schema is
  // behind the code, not bad input from a user. 22P02 is too broad to map
  // on its own -- it also covers a malformed uuid or integer -- so match
  // the complaint, not the code.
  const staleSchema = /invalid input value for enum/.test(message);

  return {
    detail: redactCredentials(code ? `${code}: ${message}` : message),
    hint: staleSchema
      ? `La base de datos tiene un esquema anterior al del código: hay migraciones sin aplicar. ${MIGRATIONS_PENDING}`
      : code
        ? (HINTS[code] ?? null)
        : null,
  };
}

// Driver errors are not supposed to quote the connection string, but this
// text is rendered on a page, so do not depend on that.
function redactCredentials(message: string): string {
  return message.replace(/\/\/[^/@\s]*@/g, "//…@");
}

/** Test or live, as Stripe writes it into the key itself. */
export type StripeMode = "live" | "test" | "unknown";

export interface StripeModeReport {
  secret: StripeMode;
  publishable: StripeMode;
  /** Whether this deployment is the one customers actually reach. */
  production: boolean;
  /** Null when the keys are coherent with where they are running. */
  problem: string | null;
}

/**
 * Which Stripe account the deployment is really talking to.
 *
 * This exists because the failure it catches is invisible from the inside
 * and total from the outside: with test keys in production the checkout
 * renders, the card is accepted, the confirmation appears -- and no money
 * has moved. The only tells are Stripe's own sandbox furniture, a black
 * developer pill and an authorisation line naming a sandbox account, which
 * nobody on our side is looking at. Every visit that converts is lost, and
 * the graphs say the funnel is working.
 *
 * Only the key prefixes are read. The value itself is never returned,
 * logged or rendered: `sk_test_` and `sk_live_` are the whole signal.
 */
export function stripeMode(): StripeModeReport {
  const modeOf = (key: string | undefined): StripeMode => {
    const value = key?.trim() ?? "";
    // The prefix sits after the kind: sk_live_…, pk_test_…, and the
    // restricted keys rk_live_… / rk_test_….
    if (/^[a-z]{2}_live_/.test(value)) return "live";
    if (/^[a-z]{2}_test_/.test(value)) return "test";
    return "unknown";
  };

  const secret = modeOf(process.env.STRIPE_SECRET_KEY);
  const publishable = modeOf(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  // On Vercel every deployment builds with NODE_ENV=production, previews
  // included, so it cannot tell them apart on its own.
  const production =
    (process.env.VERCEL_ENV ?? process.env.NODE_ENV) === "production";

  const problem =
    secret !== publishable && secret !== "unknown" && publishable !== "unknown"
      ? "La clave secreta y la publicable no son del mismo modo. Stripe rechaza la confirmación del pago porque el intent y el cliente viven en cuentas distintas. Copia las dos del mismo modo en Stripe → Developers → API keys."
      : production && (secret === "test" || publishable === "test")
        ? "Producción con claves de prueba: el checkout funciona y nadie paga de verdad. Cambia STRIPE_SECRET_KEY y NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY por las de modo live, crea los precios en la cuenta live (pnpm stripe:sync) y apunta el webhook de esa cuenta a /api/stripe/webhook con su propio STRIPE_WEBHOOK_SECRET."
        : secret === "unknown" || publishable === "unknown"
          ? "No se reconoce el formato de alguna clave de Stripe. Deben empezar por sk_live_/sk_test_ y pk_live_/pk_test_."
          : null;

  return { secret, publishable, production, problem };
}
