"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setDeleting(true);
    setError(null);
    const res = await fetch("/api/account/delete", { method: "POST" });
    if (res.ok) {
      window.location.replace("/");
    } else {
      setError("No se pudo eliminar la cuenta. Inténtalo de nuevo.");
      setDeleting(false);
    }
  }

  if (!confirming) {
    return (
      <Button variant="outline" onClick={() => setConfirming(true)}>
        Eliminar mi cuenta
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">
        ¿Seguro? Se borrarán tu cuenta, tu historial y tu suscripción.
      </p>
      <div className="flex gap-2">
        <Button variant="destructive" onClick={remove} disabled={deleting}>
          {deleting ? "Eliminando…" : "Sí, eliminar"}
        </Button>
        <Button variant="outline" onClick={() => setConfirming(false)}>
          Cancelar
        </Button>
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
