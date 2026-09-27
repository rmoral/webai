import * as Sentry from "@sentry/nextjs";
import { Resend } from "resend";

// Transactional email via Resend. No-op when not configured; never throws
// into the caller (emails must not break webhooks).
const FROM = "Verbalyx <hola@verbalyx.ai>";

export async function sendEmail(options: {
  to: string;
  subject: string;
  react: React.ReactElement;
  /**
   * Extra headers, for the one kind of message that needs them.
   *
   * Gmail and Yahoo require a bulk sender to carry List-Unsubscribe and to
   * honour a one-click POST to it; without them the onboarding emails are
   * what gets a domain filtered, and a filtered domain takes the billing
   * notices down with it.
   */
  headers?: Record<string, string>;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  try {
    await new Resend(key).emails.send({ from: FROM, ...options });
  } catch (error) {
    Sentry.captureException(error);
  }
}
