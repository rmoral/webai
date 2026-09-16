"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";

import { Button } from "@/components/ui/button";
import type { BillingInterval } from "@/lib/billing/plans";

// Stripe refusing us is our problem, not the customer's, and there is
// nothing for them to retry. The reference is what tells us which setting.
const CONFIG_PROBLEM =
  "El pago no está disponible ahora mismo por un problema de configuración nuestro. Ya estamos en ello.";

const MESSAGES: Record<string, string> = {
  tax_not_configured: CONFIG_PROBLEM,
  terms_url_missing: CONFIG_PROBLEM,
  stripe_key_invalid: CONFIG_PROBLEM,
  customer_update_invalid: CONFIG_PROBLEM,
  stripe_unavailable:
    "No hemos podido contactar con el proveedor de pagos. Vuelve a intentarlo en unos minutos.",
  database_unavailable:
    "No hemos podido leer tu plan. Vuelve a intentarlo en unos minutos.",
  price_not_configured:
    "Este plan todavía no está disponible para comprar. Estamos en ello.",
  checkout_failed:
    "Nuestro proveedor de pagos ha rechazado la solicitud. Vuelve a intentarlo en unos minutos.",
  server_error:
    "No hemos podido abrir el pago por un problema nuestro. Vuelve a intentarlo en unos minutos.",
  invalid_request: "La solicitud no era válida. Recarga la página.",
  default: "No se pudo abrir el pago. Inténtalo de nuevo.",
};

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
      return;
    }

    // Every failure used to read the same, so the four causes were
    // indistinguishable from the outside. The reference is what turns a
    // support message into a diagnosis.
    const code = typeof data?.error === "string" ? data.error : "sin_respuesta";
    setError(`${MESSAGES[code] ?? MESSAGES.default} (ref: ${code})`);
    setLoading(false);
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
