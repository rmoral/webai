import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { ensureUserRecord } from "@/lib/auth/ensure-user";
import { safeNext } from "@/lib/security/validation";

// Handles the three ways Supabase can return from a sign-in:
//   ?code=...        PKCE (OAuth and magic links on PKCE projects)
//   ?token_hash=...  email OTP links
//   #access_token=.. implicit flow — only the browser can read the fragment,
//                    so it is handed over to /auth/finish.
// Session cookies are written directly onto the redirect response: cookies
// set through the request-scoped store do not survive a new Response.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  // `next` has been outside the process -- it went to Supabase and came
  // back -- so it is validated here rather than trusted. See safeNext.
  const next = safeNext(searchParams.get("next"));

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

  // `signup_done` is the event the whole funnel is measured against, and
  // it has to fire once per account, from wherever the person lands.
  //
  // It rides on the redirect rather than being sent from here: a server
  // event carries the user id as its identity, which is a different
  // person to PostHog than the anonymous visitor who pasted the text --
  // so the one join the funnel depends on would be the one join that
  // breaks. AnalyticsProvider reads the marker, emits the event and
  // cleans the URL.
  //
  // New is read from the account's own age. Nothing else here can tell a
  // first sign-in from the hundredth, and a magic link is the same link
  // either way.
  const createdAt = Date.parse(data.user.created_at);
  const isNewAccount =
    Number.isFinite(createdAt) && Date.now() - createdAt < 5 * 60 * 1000;
  if (!isNewAccount) return response;

  const method =
    data.user.app_metadata?.provider === "google" ? "google" : "magic_link";
  const landing = new URL(next, origin);
  landing.searchParams.set("signup", method);
  // The destination is edited on the response that already carries the
  // session cookies. A fresh NextResponse.redirect would leave them
  // behind, and the landing page would ask them to sign in again.
  response.headers.set("location", landing.toString());
  return response;
}
