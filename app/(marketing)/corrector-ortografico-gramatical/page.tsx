import type { Metadata } from "next";
import Link from "next/link";

import { ToolEditor } from "@/components/tools/tool-editor";
import { TOOLS } from "@/lib/ai/tools";
import { PLANS, PRICES, formatUsd } from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "Corrector ortográfico y gramatical en español",
  description:
    "Corrige ortografía, tildes, puntuación, gramática y estilo en español. Modo general y modo académico. Te marca en color exactamente qué ha cambiado.",
};

const FAQ = [
  {
    q: "¿Qué corrige exactamente?",
    a: "Ortografía y tildes, incluidas las diacríticas; puntuación, con los signos de apertura ¿ y ¡ que el español exige; gramática, desde la concordancia hasta el queísmo, el dequeísmo, el laísmo y el leísmo; y estilo: redundancias, muletillas, cacofonías y gerundios mal empleados.",
  },
  {
    q: "¿En qué se diferencia del corrector de Word?",
    a: "Un corrector clásico compara palabras contra un diccionario y aplica reglas fijas, así que no ve los errores que son palabras correctas en el sitio equivocado: «haber» por «a ver», «sino» por «si no», una tilde diacrítica que falta o una concordancia rota a tres palabras de distancia. Este corrector lee la frase entera y entiende el contexto.",
  },
  {
    q: "¿Me cambia el estilo o la voz?",
    a: "No. La regla es explícita: si una frase ya está bien, se devuelve tal cual. Corregir no es parafrasear. Tampoco convierte el español de América al de España ni al revés, y ante una duda de estilo donde ambas opciones son válidas, deja la del autor.",
  },
  {
    q: "¿Qué hace el modo académico?",
    a: "Además de la corrección normal, ajusta el texto a la norma de un trabajo universitario: tratamiento impersonal, sin primera persona del singular, conectores propios de la escritura académica, y fuera los coloquialismos y las valoraciones subjetivas innecesarias.",
  },
  {
    q: "¿Cómo veo lo que ha cambiado?",
    a: "El resultado marca en color las partes reescritas y las añadidas, así que puedes revisar cada corrección en lugar de fiarte a ciegas. Conviene hacerlo: la corrección automática acierta casi siempre, pero el texto es tuyo.",
  },
  {
    q: "¿Está incluido en el plan gratuito?",
    a: `No. El corrector es una función de los planes de pago, desde ${formatUsd(PRICES.pro.yearly.monthlyEquivalent)} al mes. Gratis y sin registro puedes usar el humanizador y el detector de IA, hasta ${PLANS.anonymous.limits.wordsPerDay} palabras al día.`,
  },
];

export default function CorrectorLandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Verbalyx — Corrector ortográfico y gramatical",
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
        Corrector ortográfico y gramatical en español
      </h1>
      <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
        Corrige ortografía, tildes, puntuación, gramática y estilo sin tocar lo
        que ya está bien. Modo general y modo académico, y el resultado te marca
        en color cada cambio para que puedas revisarlo.
      </p>

      <div className="mt-8">
        <ToolEditor tool="correct" />
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold">
          Los errores que un corrector clásico no ve
        </h2>
        <p className="text-muted-foreground mt-3">
          El corrector de un procesador de textos compara cada palabra con un
          diccionario. Por eso encuentra «vevida» y no encuentra «haber» donde
          debía ir «a ver»: las dos son palabras correctas del español, solo que
          una está en el sitio equivocado. Lo mismo pasa con «sino» y «si no»,
          con «porque», «por que», «porqué» y «por qué», con las tildes
          diacríticas de «más» y «mas» o «sé» y «se», y con una concordancia que
          se rompe a varias palabras de distancia del sujeto.
        </p>
        <p className="text-muted-foreground mt-3">
          Este corrector lee la frase completa, así que ve esos casos. También
          los que un corrector de reglas marca en falso: un nombre propio poco
          común, un tecnicismo de tu campo o una construcción válida en tu
          variedad del español que su diccionario no contempla.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">
          Corregir no es reescribir
        </h2>
        <p className="text-muted-foreground mt-3">
          Es la diferencia que más importa y la que peor llevan las herramientas
          de IA: si le pides a un modelo que «mejore» un texto, te devuelve otro
          texto. Aquí la instrucción es la contraria. Lo que está bien se
          devuelve intacto; solo se toca lo que tiene un error. Tampoco se
          uniformiza la variedad del español: si escribes «computadora» y
          «celular», siguen ahí.
        </p>
        <p className="text-muted-foreground mt-3">
          Por eso el resultado va con las correcciones resaltadas. Puedes
          repasarlas una a una y quedarte solo con las que te convenzan, que es
          como debería usarse cualquier corrección automática sobre un texto
          propio.
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
