"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";

import { track } from "@/lib/analytics/events";
import type { PlanId } from "@/lib/billing/plans";

// The cancellation links in the billing emails land here.
//
// "Cancel in two clicks" is a promise the account page cannot keep on its
// own: the Stripe portal opens on its front page, and finding the cancel
// button there is a third click and a hunt. `?cancel=1` posts straight
// into the portal's cancellation flow instead, so the link in the email
// and the sentence in the email agree.

export function CancelFlow({ plan }: { plan: PlanId | "unknown" }) {
  const asked = useSearchParams().get("cancel") === "1";
  const posthog = usePostHog();
  const form = useRef<HTMLFormElement>(null);
  const sent = useRef(false);

  useEffect(() => {
    if (!asked || sent.current) return;
    sent.current = true;
    // Counted from here rather than from the portal, which cannot tell us
    // anything: this is the last moment the funnel can see.
    track(posthog, "cancel_start", { plan });
    form.current?.submit();
  }, [asked, plan, posthog]);

  if (!asked) return null;

  return (
    <form
      ref={form}
      action="/api/stripe/portal?flow=cancel"
      method="POST"
      hidden
    />
  );
}
