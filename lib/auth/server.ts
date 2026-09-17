import { createServerClient } from "@supabase/ssr";
import { getLocale } from "next-intl/server";
import { cookies } from "next/headers";

import { redirect } from "@/lib/i18n/navigation";

// For Server Components, Server Actions and Route Handlers.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component: cookies are read-only there.
            // Session refresh is handled by the middleware instead.
          }
        },
      },
    },
  );
}

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * The session, or a redirect to the login page in the language being
 * browsed. The middleware already gates /app and /admin, so reaching the
 * redirect here means something upstream changed -- it is defence in depth,
 * and it is what lets every page under the app shell treat the user as
 * non-null without repeating the check.
 */
export async function requireSession() {
  const user = await getSession();
  if (!user) {
    redirect({ href: "/login", locale: await getLocale() });
    // redirect() throws. This line only exists so the return type is
    // non-null: next-intl's redirect is not declared as returning never.
    throw new Error("unreachable");
  }
  return user;
}
