"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";

// The last-resort crash page. It replaces the root layout, so there is no
// locale segment above it and no message provider around it: by the time
// this renders, the thing that would have told us the language is what
// broke. Reading the prefix off the URL is all that is left, and the two
// strings are inlined rather than loaded, because loading is not available.
const COPY = {
  es: {
    title: "Algo ha salido mal",
    body: "Hemos registrado el error. Inténtalo de nuevo.",
    retry: "Reintentar",
  },
  en: {
    title: "Something went wrong",
    body: "We have logged the error. Try again.",
    retry: "Try again",
  },
} as const;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Read after mount: the server render has no window, and guessing on the
  // server would put the wrong language in the HTML for half the visitors.
  const [lang, setLang] = useState<keyof typeof COPY>("es");

  useEffect(() => {
    Sentry.captureException(error);
    if (window.location.pathname.startsWith("/en")) setLang("en");
  }, [error]);

  const copy = COPY[lang];

  return (
    <html lang={lang}>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 font-sans">
        <h1 className="text-2xl font-semibold">{copy.title}</h1>
        <p>{copy.body}</p>
        <button
          onClick={reset}
          className="rounded-md border px-4 py-2 text-sm font-medium"
        >
          {copy.retry}
        </button>
      </body>
    </html>
  );
}
