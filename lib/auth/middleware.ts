import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest } from "next/server";

export interface SessionRefresh {
  /** Null when nobody is signed in. */
  userId: string | null;
  /**
   * Cookies the caller must write onto whatever response it ends up
   * returning. Dropping them loses the refreshed session.
   */
  cookies: { name: string; value: string; options: CookieOptions }[];
}

/**
 * Refreshes the Supabase session and reports what it found.
 *
 * It does not build the response. Two middlewares now want to own that --
 * this one and next-intl's -- and only one can, so this half mutates
 * `request.cookies` (which is what makes a refreshed token visible to the
 * render downstream) and hands the Set-Cookie headers back for the caller to
 * attach. See middleware.ts for the composition.
 */
export async function refreshSession(
  request: NextRequest,
): Promise<SessionRefresh> {
  const cookies: SessionRefresh["cookies"] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            cookies.push({ name, value, options });
          });
        },
      },
    },
  );

  // Do not run code between createServerClient and auth.getUser():
  // it can cause random logouts (see Supabase SSR docs).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { userId: user?.id ?? null, cookies };
}
