import type { Post } from "@/content/blog";
import { Prose } from "@/components/marketing/article";
import { TOOLS } from "@/lib/ai/tools";
import { Link } from "@/lib/i18n/navigation";

function Body() {
  return (
    <Prose>
      <p>
        Un detector de IA no sabe quién escribió un texto. No existe una marca
        de agua en la prosa generada, ni un registro que se pueda consultar. Lo
        único que hace un detector es medir cuánto se parece un texto a lo que
        un modelo de lenguaje habría escrito, y devolver una probabilidad. Esa
        distinción no es un detalle técnico: es la diferencia entre una pista y
        una prueba, y se pierde constantemente cuando alguien pega un porcentaje
        en un correo y lo llama evidencia.
      </p>

      <h2>Qué miden en realidad</h2>
      <p>Casi todos los detectores serios miden variantes de dos cosas.</p>
      <p>
        <strong>Lo predecible que es cada palabra.</strong> Un modelo escribe
        eligiendo continuaciones probables, así que el resultado es, en
        promedio, más previsible que la prosa humana. Es lo que la literatura
        llama perplejidad baja. Un texto donde casi ninguna palabra sorprende
        puntúa alto.
      </p>
      <p>
        <strong>Lo uniforme que es el ritmo.</strong> Los humanos escribimos a
        golpes: una frase larguísima, dos cortas, un paréntesis. Los modelos
        tienden a la media y la sostienen. Cuando la longitud y la complejidad
        de las frases apenas varían a lo largo de varios párrafos, el texto
        puntúa alto otra vez.
      </p>
      <p>
        A eso se suman señales de superficie: conectores de manual en posición
        de manual, párrafos simétricos, ausencia de nombres propios y de cifras.
        Nada de esto es magia y nada de esto es concluyente.
      </p>

      <h2>Por qué se equivocan, y con quién</h2>
      <p>
        Los falsos positivos no se reparten al azar. Caen sistemáticamente en
        cuatro grupos, y si escribes en alguno de ellos conviene que lo sepas.
      </p>
      <ul>
        <li>
          <strong>Quien escribe en un idioma que no es el suyo.</strong> Un
          vocabulario más contenido y estructuras más regulares es exactamente
          el perfil que estas medidas premian. Es el sesgo mejor documentado y
          el más injusto.
        </li>
        <li>
          <strong>La prosa académica formal.</strong> Un abstract bien escrito
          es deliberadamente uniforme, impersonal y sin sorpresas léxicas. Todo
          lo que la disciplina exige es lo que el detector castiga.
        </li>
        <li>
          <strong>Los textos de formato fijo.</strong> Informes, actas,
          descripciones técnicas, fichas de producto. La plantilla aplana el
          ritmo.
        </li>
        <li>
          <strong>Los textos cortos.</strong> Por debajo de unas cien palabras
          no hay suficiente variación que medir. Cualquier número que salga ahí
          es ruido con dos decimales.
        </li>
      </ul>

      <h2>Un porcentaje no es una acusación</h2>
      <p>Tres consecuencias prácticas de todo lo anterior.</p>
      <p>
        <strong>Para quien corrige.</strong> Un resultado alto es una razón para
        mirar el texto y hablar con quien lo escribió, nunca para concluir por
        sí solo. Las herramientas no están diseñadas para sostener una decisión
        disciplinaria y sus propios fabricantes lo dicen en la letra pequeña.
      </p>
      <p>
        <strong>Para quien escribe.</strong> Si vas a ser evaluado, guarda
        rastro: el historial de versiones del documento, los borradores, las
        notas, las fuentes. Un historial de edición es la mejor respuesta que
        existe a un porcentaje, porque muestra el proceso y el porcentaje solo
        mide el resultado.
      </p>
      <p>
        <strong>Para todos.</strong> Pasar un texto propio por un detector antes
        de entregarlo es razonable. Reescribirlo hasta que el número baje, no:
        acabarás empeorando un texto que estaba bien para contentar a un
        estimador estadístico.
      </p>

      <h2>Cómo lo planteamos nosotros</h2>
      <p>
        Nuestro <Link href={TOOLS.detect.path}>detector de IA</Link> está
        construido alrededor de esa honestidad, y eso se ve en tres decisiones.
      </p>
      <ul>
        <li>
          <strong>Devuelve una banda, no un porcentaje con decimales.</strong>{" "}
          Un «87,3 %» comunica una precisión que ninguna de estas medidas tiene.
        </li>
        <li>
          <strong>Señala las frases</strong> que han pesado en el resultado,
          para que puedas juzgarlas tú. Un número sin las frases no se puede
          discutir.
        </li>
        <li>
          <strong>Se niega a puntuar un texto demasiado corto</strong> en lugar
          de inventar una cifra.
        </li>
      </ul>
      <p>
        Si lo que quieres es que tu propio texto lea mejor —no que un número
        baje—, eso es otra tarea y tiene su propia guía:{" "}
        <Link
          href={{
            pathname: "/blog/[slug]",
            params: { slug: "como-humanizar-un-texto-de-ia" },
          }}
        >
          cómo humanizar un texto de IA
        </Link>
        .
      </p>
    </Prose>
  );
}

export const post: Post = {
  slug: "que-detectan-los-detectores-de-ia",
  locale: "es",
  title: "Qué detectan realmente los detectores de IA (y qué no)",
  description:
    "Miden lo predecible y lo uniforme de un texto, no quién lo escribió. Por qué fallan con los no nativos y con la prosa académica.",
  published: "2026-09-25",
  tool: "detect",
  Body,
};
