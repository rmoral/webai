import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Inicia sesión</CardTitle>
          <CardDescription>
            El acceso con Google y enlace mágico se activará al conectar
            Supabase (Sprint 0, tarea pendiente de credenciales).
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </main>
  );
}
