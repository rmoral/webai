import * as Sentry from "@sentry/nextjs";
import { Resend } from "resend";

// Transactional email via Resend. No-op when not configured; never throws
// into the caller (emails must not break webhooks).
const FROM = "Verbalyx <hola@verbalyx.ai>";

export async function sendEmail(options: {
  to: string;
  subject: string;
  react: React.ReactElement;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  try {
    await new Resend(key).emails.send({ from: FROM, ...options });
  } catch (error) {
    Sentry.captureException(error);
  }
}
