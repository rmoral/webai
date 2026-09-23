import * as Sentry from "@sentry/nextjs";
import { PostHog } from "posthog-node";

import type { FunnelEvent, FunnelEvents } from "@/lib/analytics/events";

// Server-side half of the funnel.
//
// It exists for one event, `purchase`, and for the two cancellation events.
// A sale reported by the browser is reported by whichever browsers happen
// to stay open through the redirect, and never by the customer who paid on
// a phone that locked -- so the number is always low and never by a known
// amount. Stripe tells us instead, in a webhook that retries.
//
// Kept apart from lib/analytics/events.ts because this file imports
// posthog-node: importing it from a component would put a Node SDK, and
// its API key handling, into a browser bundle.

let client: PostHog | null | undefined;

function getClient(): PostHog | null {
  if (client !== undefined) return client;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  client = key
    ? new PostHog(key, {
        host: "https://eu.i.posthog.com",
        // Serverless: the process can be frozen the moment the response is
        // written, so there is no later in which to batch. Send on capture
        // and flush before returning.
        flushAt: 1,
        flushInterval: 0,
      })
    : null;
  return client;
}

/**
 * Emits a funnel event attributed to a user id.
 *
 * Never throws: analytics failing must not make Stripe retry a webhook it
 * already handled, which would double the email and the entitlement write.
 */
export async function trackServer<K extends FunnelEvent>(
  distinctId: string,
  event: K,
  props: FunnelEvents[K],
): Promise<void> {
  const posthog = getClient();
  if (!posthog) return;
  try {
    posthog.capture({ distinctId, event, properties: props });
    await posthog.flush();
  } catch (error) {
    Sentry.captureException(error);
  }
}
