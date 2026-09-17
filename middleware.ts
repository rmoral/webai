import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { refreshSession } from "@/lib/auth/middleware";
import { routing, splitLocale } from "@/lib/i18n/routing";

const intl = createIntlMiddleware(routing);

/** Private areas, as internal pathnames (see lib/i18n/routing.ts). */
const PROTECTED = ["/app", "/admin"];

/**
 * Paths that exist outside the [locale] tree: the API and the two auth
 * route handlers. They still need the session refreshed -- that is why they
 * are matched at all -- but sending them through next-intl would rewrite
 * them to /es/... and 404.
 */
const UNLOCALIZED = ["/api", "/auth/callback", "/auth/signout"];

/**
 * Two middlewares, one response.
 *
 * Supabase runs first because refreshing the session mutates
 * `request.cookies`, and next-intl builds its rewrite from that same
 * request -- so the fresh token reaches the render. next-intl then decides
 * the response, and the refreshed cookies are written onto whatever it
 * returned. Losing that last step logs people out at random, which is the
 * bug the Supabase SSR docs warn about.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { userId, cookies } = await refreshSession(request);

  const write = (response: NextResponse) => {
    cookies.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options),
    );
    return response;
  };

  if (UNLOCALIZED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return write(NextResponse.next({ request }));
  }

  const { locale, rest } = splitLocale(pathname);
  const needsSession = PROTECTED.some(
    (prefix) => rest === prefix || rest.startsWith(`${prefix}/`),
  );

  if (!userId && needsSession) {
    const url = request.nextUrl.clone();
    // Send them to the login page in the language they were browsing.
    url.pathname =
      locale === routing.defaultLocale ? "/login" : `/${locale}/login`;
    url.searchParams.set("next", pathname);
    return write(NextResponse.redirect(url));
  }

  return write(intl(request));
}

export const config = {
  matcher: [
    // Skip static assets and images; run on everything else, including the
    // API, which needs the session refreshed even though it is not localised.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
