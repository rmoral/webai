"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";

import { Button } from "@/components/ui/button";
import type { BillingInterval } from "@/lib/billing/plans";

export function CheckoutButton({
  plan,
  interval,
  label,
  variant = "default",
}: {
  plan: "pro" | "unlimited" | "topup";
  interval: BillingInterval;
  label: string;
  variant?: "default" | "outline";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const posthog = usePostHog();

  async function checkout() {
    setLoading(true);
    setError(null);
    posthog?.capture("checkout_started", { plan, interval });

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan, interval }),
    });

    if (res.status === 401) {
      router.push("/login?next=/precios");
      return;
    }
    if (res.status === 403) {
      setError("Necesitas una suscripción activa para comprar una recarga.");
      setLoading(false);
      return;
    }

    const data = await res.json().catch(() => null);
    if (data?.url) {
      window.location.href = data.url;
    } else {
      setError("No se pudo abrir el pago. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant={variant} onClick={checkout} disabled={loading}>
        {loading ? "Abriendo el pago…" : label}
      </Button>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </>
  );
}
