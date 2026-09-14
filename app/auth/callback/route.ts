import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { ensureUserRecord } from "@/lib/auth/ensure-user";

// Handles the three ways Supabase can return from a sign-in:
//   ?code=...        PKCE (OAuth and magic links on PKCE projects)
//   ?token_hash=...  email OTP links
//   #access_token=.. implicit flow — only the browser can read the fragment,
//                    so it is handed over to /auth/finish.
// Session cookies are written directly onto the redirect response: cookies
// set through the request-scoped store do not survive a new Response.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const requestedNext = searchParams.get("next");
  const next =
    requestedNext && requestedNext.startsWith("/") ? requestedNext : "/app";

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");

  if (!code && !tokenHash) {
    return NextResponse.redirect(
      `${origin}/auth/finish?next=${encodeURIComponent(next)}`,
    );
  }

  const response = NextResponse.redirect(`${origin}${next}`);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data, error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        type: (searchParams.get("type") ?? "email") as EmailOtpType,
        token_hash: tokenHash!,
      });

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  await ensureUserRecord(data.user.id, data.user.email);
  return response;
}
