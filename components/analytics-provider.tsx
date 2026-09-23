"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

import { track } from "@/lib/analytics/events";

// Cookieless until the user gives consent (Consent Mode v2 banner, Sprint 2+).
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    posthog.init(key, {
      api_host: "https://eu.i.posthog.com",
      persistence: "memory",
      capture_pageview: true,
      capture_pageleave: true,
    });
  }, []);

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

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
