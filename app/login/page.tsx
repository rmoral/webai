"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/auth/client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const next = useSearchParams().get("next") ?? "/app";

  const redirectTo = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function signInWithGoogle() {
    await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
  }

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo() },
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Inicia sesión</CardTitle>
        <CardDescription>
          Con Google o con un enlace mágico a tu correo. Sin contraseñas.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button variant="outline" onClick={signInWithGoogle}>
          Continuar con Google
        </Button>
        <div className="text-muted-foreground text-center text-xs">o</div>
        {status === "sent" ? (
          <p className="text-sm">
            Revisa tu correo: te hemos enviado un enlace para entrar.
          </p>
        ) : (
          <form onSubmit={signInWithEmail} className="flex flex-col gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="border-input focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
            />
            <Button type="submit" disabled={status === "sending" || !email}>
              {status === "sending" ? "Enviando…" : "Enviarme el enlace"}
            </Button>
            {status === "error" && (
              <p className="text-destructive text-sm">
                No se pudo enviar el enlace. Inténtalo de nuevo.
              </p>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
