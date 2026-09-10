"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";

import { Button } from "@/components/ui/button";

export function CheckoutButton({
  interval,
  variant = "default",
}: {
  interval: "monthly" | "yearly";
  variant?: "default" | "outline";
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const posthog = usePostHog();

  async function checkout() {
    setLoading(true);
    posthog?.capture("checkout_started", { interval });
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ interval }),
    });
    if (res.status === 401) {
      router.push("/login?next=/precios");
      return;
    }
    const data = await res.json().catch(() => null);
    if (data?.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  }

  return (
    <Button size="lg" variant={variant} onClick={checkout} disabled={loading}>
      {loading ? "Abriendo el pago…" : "Probar Pro 3 días"}
    </Button>
  );
}
