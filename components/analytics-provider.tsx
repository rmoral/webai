"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

import { useConsent } from "@/components/consent";
import { track } from "@/lib/analytics/events";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { consent } = useConsent();

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    posthog.init(key, {
      api_host: "https://eu.i.posthog.com",
      // Cookieless until the answer says otherwise. This is the state the
      // cookie policy describes, and the one the site is in for every
      // visitor who has not been asked yet.
      persistence: "memory",
      capture_pageview: true,
      capture_pageleave: true,
    });
  }, []);

  // Analytics consented to: the same visitor becomes the same visitor
  // across visits, which is the difference between a funnel and a pile of
  // sessions. Refused, or unanswered, it stays in memory for the tab.
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    posthog.set_config({
      persistence: consent?.analytics ? "localStorage+cookie" : "memory",
    });
  }, [consent?.analytics]);

  // `signup_done`, wherever the new account lands.
  //
  // The auth callback marks the redirect with ?signup=<method> when the
  // account is new (app/auth/callback/route.ts). Reading it here rather
  // than on any one page is what makes the event independent of where
  // `next` pointed -- the editor, the pricing page, the card field -- and
  // keeps it attached to the same anonymous visitor who started the run,
  // which is what turns the events into a funnel instead of a list.
  //
  // The marker is then removed from the URL: a reload must not count as a
  // second signup, and the query string is visible to the user.
  useEffect(() => {
    const url = new URL(window.location.href);
    const method = url.searchParams.get("signup");
    if (method !== "google" && method !== "magic_link") return;
    track(posthog, "signup_done", { method, next: url.pathname });
    url.searchParams.delete("signup");
    window.history.replaceState(null, "", url.toString());
  }, []);

  return (
    <PostHogProvider client={posthog}>
      {/* Wrapped, because `useSearchParams` outside a boundary opts every
          page under this layout out of static rendering -- which is every
          page the site has to rank with. */}
      <Suspense>
        <GooglePageviews />
      </Suspense>
      {children}
    </PostHogProvider>
  );
}

/**
 * Page views for GA4, which a single-page navigation does not produce.
 *
 * The tag is configured with `send_page_view: false` so the first view is
 * sent from here too: two sources counting the landing page is how a
 * bounce rate ends up at half of what it is.
 */
function GooglePageviews() {
  const pathname = usePathname();
  const params = useSearchParams();
  const sent = useRef<string | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GA_ID) return;
    const query = params.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    if (sent.current === path) return;
    sent.current = path;
    window.gtag?.("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
    });
  }, [pathname, params]);

  return null;
}
