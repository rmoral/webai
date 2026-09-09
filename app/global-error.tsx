"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 font-sans">
        <h1 className="text-2xl font-semibold">Algo ha salido mal</h1>
        <p>Hemos registrado el error. Inténtalo de nuevo.</p>
        <button
          onClick={reset}
          className="rounded-md border px-4 py-2 text-sm font-medium"
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
