import type { Metadata } from "next";
import Link from "next/link";

import { ToolEditor } from "@/components/tools/tool-editor";
import { PLANS } from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "Humanizador de texto IA gratis en español",
  description:
    "Humaniza texto generado por ChatGPT u otra IA para que suene natural y humano. Gratis, en español, conservando el significado y el registro.",
};

const FAQ = [
  {
    q: "¿Qué hace un humanizador de texto IA?",
    a: "Reescribe un texto generado por inteligencia artificial para que suene natural y humano: varía la estructura de las frases, elimina las muletillas típicas de la IA y ajusta el tono, sin cambiar el significado ni los datos.",
  },
  {
    q: "¿Es gratis?",
    a: `Sí. Puedes humanizar hasta ${PLANS.anonymous.limits.wordsPerDay} palabras al día sin registrarte, y ${PLANS.free.limits.wordsPerDay} al día con una cuenta gratuita. El plan Pro amplía el límite a ${PLANS.pro.limits.maxWordsPerRequest.toLocaleString("es-ES")} palabras por petición.`,
  },
  {
    q: "¿Funciona con textos académicos?",
    a: "Sí. El registro «académico» mantiene el tono formal, los conectores propios de trabajos universitarios y la terminología técnica, cuidando las normas del español.",
  },
  {
    q: "¿El texto humanizado pasa los detectores de IA?",
    a: "El objetivo es que el texto suene natural y humano. Ningún servicio puede garantizar un resultado concreto frente a detectores de terceros, cuyos resultados son orientativos y cambian con frecuencia.",
  },
  {
    q: "¿Guardáis mis textos?",
    a: "No. Los textos de usuarios anónimos y gratuitos no se almacenan: solo registramos métricas de uso. El historial es una función de los planes de pago.",
  },
];

export default function HumanizerLandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Verbalyx — Humanizador de texto IA",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        inLanguage: "es",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Humanizador de texto IA en español
      </h1>
      <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
        Pega un texto generado por ChatGPT u otra IA y conviértelo en un texto
        natural, fluido y con tu registro: académico, neutro o informal. Gratis
        y sin registro.
      </p>

      <div className="mt-8">
        <ToolEditor tool="humanize" />
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold">
          Cómo humanizar un texto de IA (bien)
        </h2>
        <p className="text-muted-foreground mt-3">
          Los textos generados por IA se reconocen por sus tics: frases de
          longitud uniforme, conectores repetidos («en resumen», «es importante
          destacar»), un tono impersonal y párrafos que dicen mucho sin decir
          nada. Humanizar un texto no es cambiar palabras por sinónimos: es
          reescribirlo como lo haría una persona, conservando el significado,
          los datos y la terminología.
        </p>
        <p className="text-muted-foreground mt-3">
          Nuestro humanizador está construido específicamente para el español —
          de España y de LATAM — y no es una traducción de una herramienta en
          inglés. Respeta las normas de la RAE en el registro académico, varía
          la estructura sintáctica de forma natural y nunca añade información
          que no estaba en el original. Por eso funciona bien con trabajos
          universitarios (TFG, TFM), textos de oposiciones, artículos de blog y
          contenidos de marketing.
        </p>
        <h2 className="mt-8 text-2xl font-semibold">
          Tres registros, un mismo significado
        </h2>
        <p className="text-muted-foreground mt-3">
          El registro «académico» mantiene la formalidad y los conectores
          propios de la escritura universitaria. El «neutro» produce un español
          claro y directo, válido a ambos lados del Atlántico. El «informal»
          acerca el tono a una conversación, ideal para redes sociales o
          newsletters. En los tres casos, la longitud del texto se conserva de
          forma aproximada y las citas y cifras quedan intactas.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold">Preguntas frecuentes</h2>
        <div className="mt-6 space-y-6">
          {FAQ.map(({ q, a }) => (
            <div key={q}>
              <h3 className="font-medium">{q}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-muted-foreground mt-16 text-sm">
        ¿Necesitas más palabras o el registro académico a diario?{" "}
        <Link href="/precios" className="underline">
          Consulta el plan Pro
        </Link>
        .
      </p>
    </main>
  );
}
