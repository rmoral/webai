import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TOOLS } from "@/lib/ai/tools";

export const metadata: Metadata = {
  title: "Detector de IA en español — próximamente",
  description:
    "Detector de texto generado por IA para español. Cómo funcionan los detectores, qué fiabilidad tienen y por qué sus resultados son orientativos.",
};

const FAQ = [
  {
    q: "¿Cómo funciona un detector de IA?",
    a: "Mide rasgos estadísticos del texto: lo predecible que resulta cada palabra en su contexto (perplejidad) y lo uniforme que es la variación entre frases (ráfaga). Los textos generados por modelos de lenguaje tienden a ser más predecibles y más uniformes que los escritos por personas.",
  },
  {
    q: "¿Son fiables los detectores de IA?",
    a: "No de forma concluyente. Todos los detectores producen falsos positivos y falsos negativos, y su fiabilidad baja con textos cortos, muy técnicos o escritos por personas no nativas. Ningún resultado debería usarse por sí solo para acusar a nadie de nada: es un indicio, no una prueba.",
  },
  {
    q: "¿Funcionan igual en español que en inglés?",
    a: "No. La mayoría se entrenaron sobre todo con textos en inglés y pierden precisión en español, sobre todo con variedades de LATAM. Por eso construimos el nuestro específicamente para el español.",
  },
  {
    q: "¿Cuándo estará disponible?",
    a: "Estamos ajustando el modelo para el español antes de publicarlo. Preferimos retrasarlo a publicar una puntuación en la que no se pueda confiar.",
  },
];

export default function DetectorLandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <main className="mx-auto max-w-[65rem] px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Badge variant="warning">En desarrollo</Badge>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        Detector de IA en español
      </h1>
      <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
        Estamos construyendo un detector entrenado para el español, no adaptado
        del inglés. Mientras tanto, esto es lo que conviene saber sobre cómo
        funcionan estas herramientas y qué fiabilidad tienen.
      </p>

      <div className="border-brand-line bg-brand-soft mt-8 flex flex-wrap items-center gap-4 rounded-xl border px-6 py-4">
        <p className="text-brand-ink flex-1 basis-80 text-sm">
          <b className="font-semibold">Todavía no está disponible.</b> El{" "}
          {TOOLS.humanize.name.toLowerCase()} sí lo está y es gratuito: pruébalo
          mientras terminamos el detector.
        </p>
        <Button size="sm" asChild>
          <Link href={TOOLS.humanize.path}>Probar el humanizador</Link>
        </Button>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold">
          Qué mide realmente un detector de IA
        </h2>
        <p className="text-muted-foreground mt-3">
          Un detector no «reconoce» a ChatGPT. Lo que hace es estimar hasta qué
          punto un texto se parece a lo que produciría un modelo de lenguaje.
          Trabaja con dos señales principales. La <b>perplejidad</b> mide lo
          sorprendente que resulta cada palabra dado lo que la precede: los
          modelos eligen casi siempre la continuación más probable, así que su
          texto tiene perplejidad baja. La <b>ráfaga</b> mide cuánto varía la
          longitud y la complejidad entre frases consecutivas: las personas
          alternamos frases largas y cortas de forma irregular, los modelos
          tienden a un ritmo plano.
        </p>
        <p className="text-muted-foreground mt-3">
          Ninguna de las dos señales es concluyente. Un texto académico escrito
          por una persona, con terminología fija y estructura muy pautada,
          puntúa como «IA» con facilidad. Y un texto generado y luego editado a
          mano puede pasar desapercibido. Por eso el resultado de cualquier
          detector es un indicio estadístico, nunca una prueba.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">
          Por qué el español necesita su propio detector
        </h2>
        <p className="text-muted-foreground mt-3">
          Los detectores más conocidos se entrenaron mayoritariamente con textos
          en inglés. Aplicados al español pierden precisión, y la pierden de
          forma desigual: penalizan construcciones perfectamente normales en
          registro formal peninsular o en variedades de LATAM. El resultado son
          falsos positivos que recaen sobre quien escribe bien y de forma
          cuidada, que es justo lo contrario de lo que debería pasar.
        </p>
        <p className="text-muted-foreground mt-3">
          Preferimos publicar tarde y que la puntuación signifique algo. Cuando
          esté listo, el detector devolverá una puntuación global y, en los
          planes de pago, el desglose por frases para ver qué partes del texto
          levantan la sospecha.
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
    </main>
  );
}
