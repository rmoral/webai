"use server";

import * as Sentry from "@sentry/nextjs";
import { redirect } from "next/navigation";

import { applyOptOut } from "@/lib/email/unsubscribe";
import { getPathname } from "@/lib/i18n/navigation";
import { isLocale, routing } from "@/lib/i18n/routing";

/**
 * Confirms the unsubscribe, for a person who may not be signed in.
 *
 * No session check, on purpose: the right to stop the emails belongs to
 * whoever holds the signed link, and requiring a login first is an
 * unsubscribe that does not work on the phone the email was opened on.
 * `applyOptOut` refuses anything that does not verify.
 */
export async function unsubscribe(formData: FormData) {
  const token = String(formData.get("t") ?? "");
  const raw = String(formData.get("locale") ?? "");
  const locale = isLocale(raw) ? raw : routing.defaultLocale;
  const path = getPathname({ href: "/email/unsubscribe", locale });

  // `redirect` works by throwing, so it cannot be called inside the try:
  // its own control flow would be caught here, reported to Sentry as a
  // failure and turned into the wrong answer.
  let stopped: boolean;
  try {
    stopped = await applyOptOut(token);
  } catch (error) {
    Sentry.captureException(error);
    redirect(`${path}?error=1`);
  }

  redirect(`${path}?${stopped ? "done" : "invalid"}=1`);
}
