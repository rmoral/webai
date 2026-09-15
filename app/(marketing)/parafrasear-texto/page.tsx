import type { Metadata } from "next";
import Link from "next/link";

import { ToolEditor } from "@/components/tools/tool-editor";
import { TOOLS } from "@/lib/ai/tools";
import { PLANS, PRICES, formatUsd } from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "Parafrasear texto en español — 6 modos",
  description:
    "Parafrasea un texto en español conservando el significado: modos estándar, fluido, formal, simple, creativo y académico. Reescribe de verdad, no cambia sinónimos.",
};

const FAQ = [
  {
    q: "¿Qué es parafrasear un texto?",
    a: "Es expresar las mismas ideas con otras palabras y otra estructura. Parafrasear bien no es cambiar palabras por sinónimos: es reordenar las ideas dentro de la frase, alternar voz activa y pasiva, y fundir o dividir oraciones, conservando el significado, los datos y las citas.",
  },
  {
    q: "¿Qué modo elijo?",
    a: "«Estándar» es el equilibrio por defecto. «Fluido» prioriza que se lea bien aunque se aleje más del original. «Formal» sirve para informes y documentos profesionales. «Simple» reduce el vocabulario y acorta las frases. «Creativo» permite giros más expresivos. «Académico» mantiene el registro universitario y la terminología intacta.",
  },
  {
    q: "¿Parafrasear evita el plagio?",
    a: "No por sí solo. Reescribir una idea ajena sin citar la fuente sigue siendo plagio, por muy distinta que sea la redacción. Parafrasear es una herramienta de redacción, no un sustituto de la cita. Cita siempre la fuente de la que procede la idea.",
  },
  {
    q: "¿Conserva los datos y las citas?",
    a: "Sí. Las cifras, fechas, nombres propios, citas textuales entrecomilladas y la terminología técnica se mantienen tal cual. Tampoco se añade información que no estuviera en el original ni se omite ninguna idea.",
  },
  {
    q: "¿Está incluido en el plan gratuito?",
    a: `No. El parafraseador es una función de los planes de pago, desde ${formatUsd(PRICES.pro.yearly.monthlyEquivalent)} al mes. Gratis y sin registro puedes usar el humanizador y el detector de IA, hasta ${PLANS.anonymous.limits.wordsPerDay} palabras al día.`,
  },
];

export default function ParaphraseLandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Verbalyx — Parafraseador",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        inLanguage: "es",
        offers: {
          "@type": "Offer",
          price: String(PRICES.pro.monthly.amount),
          priceCurrency: "USD",
        },
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
    <main className="mx-auto max-w-[65rem] px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Parafrasear texto en español
      </h1>
      <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
        Reescribe un texto con otras palabras y otra estructura sin perder el
        significado. Seis modos, del académico al creativo, y el resultado te
        marca en color lo que ha cambiado.
      </p>

      <div className="mt-8">
        <ToolEditor tool="paraphrase" />
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold">
          Parafrasear no es cambiar sinónimos
        </h2>
        <p className="text-muted-foreground mt-3">
          La mayoría de las herramientas de paráfrasis sustituyen palabras por
          sinónimos del diccionario y dejan la sintaxis intacta. El resultado se
          reconoce a la primera: frases con la misma estructura del original y
          vocabulario que nadie usaría —«empero», «asaz», «menester»— en el
          lugar de las palabras corrientes. Y para colmo, un cambio de sinónimo
          mal elegido altera el matiz de lo que querías decir.
        </p>
        <p className="text-muted-foreground mt-3">
          Parafrasear de verdad significa tocar la estructura: mover el sujeto,
          convertir una subordinada en una frase independiente, fundir dos
          oraciones cortas en una, pasar de voz pasiva a activa. Eso es lo que
          hace esta herramienta, y por eso el texto resultante se lee como
          escrito de nuevo y no como el original disfrazado.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">Los seis modos</h2>
        <p className="text-muted-foreground mt-3">
          <b>Estándar</b> reescribe de forma equilibrada sin alterar el tono.{" "}
          <b>Fluido</b> prioriza la naturalidad y el ritmo, aunque se separe más
          del original. <b>Formal</b> sube el registro para informes y
          documentos profesionales, sin contracciones coloquiales. <b>Simple</b>{" "}
          usa vocabulario común y frases cortas, explicando los tecnicismos
          imprescindibles. <b>Creativo</b> permite imágenes y giros expresivos
          siempre que no cambien el sentido. Y <b>académico</b> mantiene el
          tratamiento impersonal, los conectores propios de un trabajo
          universitario y la terminología intacta.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">
          Una advertencia sobre el plagio
        </h2>
        <p className="text-muted-foreground mt-3">
          Parafrasear no convierte una idea ajena en propia. Si la idea viene de
          una fuente, hay que citarla, por muy distinta que sea la redacción. Un
          detector de plagio compara textos; un tribunal académico compara
          ideas. Usa el parafraseador para redactar mejor lo que ya has
          entendido y citado, no para esquivar una cita.
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
        ¿Prefieres empezar por algo gratuito? Prueba el{" "}
        <Link href={TOOLS.humanize.path} className="underline">
          humanizador
        </Link>{" "}
        o el{" "}
        <Link href={TOOLS.detect.path} className="underline">
          detector de IA
        </Link>
        , o{" "}
        <Link href="/precios" className="underline">
          consulta los planes
        </Link>
        .
      </p>
    </main>
  );
}
