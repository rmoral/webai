import type { Metadata } from "next";
import Link from "next/link";

import { ToolEditor } from "@/components/tools/tool-editor";
import { PLANS } from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "Detector de IA gratis en español",
  description:
    "Analiza si un texto muestra los patrones de la escritura generada por IA: ritmo de las frases, conectores de relleno, repetición y puntuación. Gratis y en español.",
};

const FAQ = [
  {
    q: "¿Cómo funciona este detector de IA?",
    a: "Mide cuatro propiedades del texto que distinguen la escritura automática de la humana: la variación de longitud entre frases (los modelos escriben con un ritmo más plano), la densidad de conectores de relleno como «es importante destacar» o «cabe señalar», la repetición de estructuras y secuencias, y la variedad de puntuación. Te enseñamos las cuatro medidas por separado, no solo un número.",
  },
  {
    q: "¿Es fiable? ¿Puedo usarlo para acusar a alguien?",
    a: "No. Ningún detector de IA, el nuestro incluido, sirve como prueba. Todos producen falsos positivos y falsos negativos: un texto humano muy formal —un TFG, un informe técnico— puede puntuar alto, y un texto generado y luego editado a mano puede puntuar bajo. Nuestro resultado es un indicio de estilo, no un dictamen sobre la autoría.",
  },
  {
    q: "¿Por qué no me dais un porcentaje como otras herramientas?",
    a: "Porque sería inventado. Un «87 % generado por IA» sugiere una precisión estadística que ninguna técnica actual tiene. Preferimos darte un índice de 0 a 100 sobre patrones medibles y explicarte exactamente qué lo sube, para que puedas juzgar tú.",
  },
  {
    q: "¿Funciona en español o es una traducción de una herramienta inglesa?",
    a: "Está construido para el español. Los conectores que buscamos son los que los modelos usan en español, y los umbrales de ritmo están ajustados a la prosa en castellano. Además, el calibrado está deliberadamente sesgado a la baja: preferimos no marcar un texto de IA antes que señalar a alguien que escribió su trabajo.",
  },
  {
    q: "¿Cuántas palabras necesita?",
    a: `Al menos 120 palabras y 5 frases. Por debajo de eso las medidas de variación son ruido y te lo decimos en vez de darte un número sin valor. Puedes analizar hasta ${PLANS.anonymous.limits.wordsPerDay} palabras al día sin registrarte.`,
  },
  {
    q: "¿Guardáis los textos que analizo?",
    a: "No. El análisis se ejecuta en nuestro servidor sobre el texto que envías y no se almacena: solo registramos el recuento de palabras para aplicar los límites del plan.",
  },
];

export default function DetectorLandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Verbalyx — Detector de IA",
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
    <main className="mx-auto max-w-[65rem] px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Detector de IA en español
      </h1>
      <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
        Pega un texto y mide los patrones que delatan a la escritura automática:
        ritmo de las frases, conectores de relleno, repetición y puntuación. Te
        enseñamos las cuatro medidas, no solo un número. Gratis y sin registro.
      </p>

      <div className="mt-8">
        <ToolEditor tool="detect" />
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold">Qué mide y qué no mide</h2>
        <p className="text-muted-foreground mt-3">
          Un detector no «reconoce» a ChatGPT. Lo que hace es estimar hasta qué
          punto un texto se parece a lo que produciría un modelo de lenguaje.
          Nosotros medimos cuatro propiedades comprobables. El{" "}
          <b>ritmo de las frases</b>: las personas alternamos frases largas y
          cortas de forma irregular, los modelos tienden a un compás plano, y
          eso se mide con el coeficiente de variación de la longitud. Los{" "}
          <b>conectores de relleno</b>: «es importante destacar», «cabe
          señalar», «por otro lado», «en conclusión» aparecen en el texto
          generado con una frecuencia muy superior a la del habla escrita real.
          La <b>repetición</b> de secuencias de tres palabras y de arranques de
          frase. Y la <b>variedad de puntuación</b>: el punto y coma, la raya,
          los dos puntos y la interrogación escasean en la prosa automática.
        </p>
        <p className="text-muted-foreground mt-3">
          Ninguna de estas señales es concluyente por separado, y su suma
          tampoco lo es. Un texto académico escrito por una persona, con
          terminología fija y estructura muy pautada, se parece estadísticamente
          al texto generado. Por eso el resultado es un indicio, y por eso te
          mostramos qué lo sube: para que puedas mirar las frases concretas y
          decidir tú.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">
          Por qué no verás un porcentaje
        </h2>
        <p className="text-muted-foreground mt-3">
          Las herramientas que anuncian «92 % generado por IA» no tienen forma
          de respaldar esa cifra: no existe un modelo calibrado que convierta
          estas señales en una probabilidad real, y presentarla como tal es una
          invitación a tomar decisiones graves sobre una medida frágil. Te damos
          un índice de 0 a 100 sobre lo medido, con el desglose delante, y una
          banda cualitativa. Es menos vistoso y es más honesto.
        </p>
        <p className="text-muted-foreground mt-3">
          Por la misma razón el calibrado está sesgado: los umbrales están
          puestos para que un texto humano cuidado caiga en «indicios bajos»
          aunque comparta rasgos con la escritura automática. Preferimos
          equivocarnos dejando pasar texto de IA antes que equivocarnos
          señalando a quien escribió su trabajo.
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
        ¿Tu texto suena a IA y quieres arreglarlo?{" "}
        <Link href="/humanizador-de-texto-ia" className="underline">
          Prueba el humanizador
        </Link>
        , o{" "}
        <Link href="/precios" className="underline">
          consulta los planes
        </Link>{" "}
        para el desglose frase por frase.
      </p>
    </main>
  );
}
