import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Plantillas legales mínimas (España/UE). PENDIENTE: sustituir los campos
// [ENTRE CORCHETES] con los datos reales y revisar con un abogado antes del
// primer cobro (ver PLAN_DESARROLLO_WRITE_AI.md §6).

const COMPANY = {
  name: "[RAZÓN SOCIAL / NOMBRE DEL TITULAR]",
  nif: "[NIF]",
  address: "[DIRECCIÓN COMPLETA]",
  email: "hola@verbalyx.ai",
};

interface LegalPage {
  title: string;
  sections: { heading: string; body: string }[];
}

const PAGES: Record<string, LegalPage> = {
  "aviso-legal": {
    title: "Aviso legal",
    sections: [
      {
        heading: "Titular del sitio",
        body: `En cumplimiento de la Ley 34/2002 (LSSI-CE), se informa de que el titular de verbalyx.ai es ${COMPANY.name}, con NIF ${COMPANY.nif} y domicilio en ${COMPANY.address}. Contacto: ${COMPANY.email}.`,
      },
      {
        heading: "Objeto",
        body: "Verbalyx es un servicio de asistencia a la escritura mediante inteligencia artificial: humanización, detección, paráfrasis y corrección de textos en español.",
      },
      {
        heading: "Propiedad intelectual",
        body: "El diseño, el código y los contenidos del sitio pertenecen al titular. Los textos que los usuarios introducen y los resultados generados a partir de ellos pertenecen al usuario.",
      },
    ],
  },
  terminos: {
    title: "Términos del servicio",
    sections: [
      {
        heading: "El servicio",
        body: "Verbalyx ofrece herramientas de escritura con IA en modalidad gratuita (con límites diarios) y de suscripción Pro. Los límites vigentes de cada plan se muestran en la página de precios.",
      },
      {
        heading: "Suscripción, prueba y pagos",
        body: "La suscripción Pro se contrata a través de Stripe e incluye un periodo de prueba de 3 días con tarjeta. Si no cancelas antes de que termine la prueba, se activa el cobro del plan elegido. Puedes cancelar en cualquier momento desde tu cuenta; la cancelación surte efecto al final del periodo ya pagado. Los precios incluyen IVA.",
      },
      {
        heading: "Derecho de desistimiento",
        body: "Al contratar, consientes expresamente el acceso inmediato al contenido digital y aceptas la pérdida del derecho de desistimiento de 14 días (art. 103 m del RDL 1/2007), sin perjuicio del periodo de prueba gratuito.",
      },
      {
        heading: "Uso aceptable",
        body: "No está permitido usar el servicio para actividades ilícitas, para infringir derechos de terceros, ni para eludir sistemas de evaluación académica cuando ello contravenga las normas del centro. El detector de IA ofrece resultados orientativos y no debe usarse como prueba única de nada.",
      },
      {
        heading: "Garantías y responsabilidad",
        body: "Los resultados se generan mediante modelos de IA y pueden contener errores; revísalos antes de usarlos. El servicio se presta «tal cual», con los niveles de diligencia exigibles, y la responsabilidad del titular se limita a lo permitido por la ley.",
      },
    ],
  },
  privacidad: {
    title: "Política de privacidad",
    sections: [
      {
        heading: "Responsable",
        body: `${COMPANY.name}, NIF ${COMPANY.nif}, ${COMPANY.address}. Contacto: ${COMPANY.email}.`,
      },
      {
        heading: "Qué datos tratamos y para qué",
        body: "Cuenta (email, nombre) para prestar el servicio (base: contrato). Datos de facturación, gestionados por Stripe (no almacenamos tarjetas). Métricas de uso (recuentos de palabras y peticiones) para operar los límites de los planes (base: contrato) — las direcciones IP se almacenan siempre seudonimizadas mediante hash con clave. Analítica de producto con PostHog en modo sin cookies hasta tu consentimiento (base: interés legítimo/consentimiento).",
      },
      {
        heading: "Tus textos",
        body: "Los textos de usuarios anónimos y del plan gratuito no se almacenan. Para generar el resultado, el texto se procesa mediante proveedores de IA (Anthropic) vía API; no se usa para entrenar modelos. El historial de documentos es opcional del plan Pro y se guarda cifrado (AES-256-GCM); puedes desactivarlo o borrarlo.",
      },
      {
        heading: "Encargados y transferencias",
        body: "Usamos proveedores con acuerdos de encargo de tratamiento: Supabase (base de datos y autenticación), Vercel (alojamiento), Stripe (pagos), Anthropic (procesamiento de IA), Resend (email), PostHog (analítica) y Sentry (errores). Cuando implican transferencias fuera del EEE, se amparan en cláusulas contractuales tipo.",
      },
      {
        heading: "Tus derechos",
        body: `Puedes ejercer acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a ${COMPANY.email}, y eliminar tu cuenta y datos desde tu propia cuenta. También puedes reclamar ante la AEPD (aepd.es).`,
      },
    ],
  },
  cookies: {
    title: "Política de cookies",
    sections: [
      {
        heading: "Cookies que usamos",
        body: "Cookies técnicas imprescindibles: sesión de autenticación (Supabase) y preferencias. Analítica (PostHog): funciona sin cookies hasta que des tu consentimiento a través del banner; si consientes, se usan cookies de analítica. Publicidad (Google): solo con tu consentimiento (Consent Mode v2).",
      },
      {
        heading: "Cómo gestionar el consentimiento",
        body: "Puedes aceptar, rechazar o cambiar tu elección en cualquier momento desde el banner de cookies o la configuración de tu navegador. Rechazar la analítica no afecta al funcionamiento del servicio.",
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const page = PAGES[(await params).slug];
  return { title: page?.title, robots: { index: false } };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const page = PAGES[(await params).slug];
  if (!page) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
      <div className="mt-8 space-y-8">
        {page.sections.map(({ heading, body }) => (
          <section key={heading}>
            <h2 className="text-lg font-semibold">{heading}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {body}
            </p>
          </section>
        ))}
      </div>
      <p className="text-muted-foreground mt-12 text-xs">
        Última actualización: septiembre de 2026.
      </p>
    </main>
  );
}
