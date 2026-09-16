"use client";

import { useEffect, useState, useTransition } from "react";
import { usePostHog } from "posthog-js/react";

import { removeDocument } from "@/app/(app)/app/historial/actions";
import { Button } from "@/components/ui/button";

/**
 * Whether people on a paid plan actually open the history is the question
 * that says if the feature is worth its storage. Fired once per visit.
 */
export function HistoryOpened({ count }: { count: number }) {
  const posthog = usePostHog();
  useEffect(() => {
    posthog?.capture("history_opened", { documents: count });
  }, [posthog, count]);
  return null;
}

export function DeleteDocumentButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const posthog = usePostHog();

  if (!confirming) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
        Eliminar
      </Button>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <Button
        variant="destructive"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await removeDocument(id);
            posthog?.capture("history_document_deleted");
          })
        }
      >
        {pending ? "Eliminando…" : "Confirmar"}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Cancelar
      </Button>
    </span>
  );
}
