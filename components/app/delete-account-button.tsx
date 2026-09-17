"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export function DeleteAccountButton() {
  const t = useTranslations("account");
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
      setError(t("deleteError"));
      setDeleting(false);
    }
  }

  if (!confirming) {
    return (
      <Button variant="outline" onClick={() => setConfirming(true)}>
        {t("deleteCta")}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">{t("deleteConfirm")}</p>
      <div className="flex gap-2">
        <Button variant="destructive" onClick={remove} disabled={deleting}>
          {deleting ? t("deleting") : t("deleteYes")}
        </Button>
        <Button variant="outline" onClick={() => setConfirming(false)}>
          {t("cancel")}
        </Button>
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
