import type { Post } from "@/content/blog";
import { Prose } from "@/components/marketing/article";
import { TOOLS } from "@/lib/ai/tools";
import { Link } from "@/lib/i18n/navigation";

function Body() {
  return (
    <Prose>
      <p>
        «Humanizar» un texto se confunde a menudo con disfrazarlo. Son dos cosas
        distintas y solo una funciona. Disfrazar es cambiar palabras para que un
        detector falle; humanizar es arreglar aquello que hace que el texto
        suene a máquina, que es casi siempre lo mismo que lo hace aburrido de
        leer. La segunda mejora el trabajo. La primera lo empeora y, además, se
        nota.
      </p>

      <h2>Por qué se nota un texto generado</h2>
      <p>
        No es el vocabulario. Un modelo de lenguaje escribe eligiendo, palabra a
        palabra, la continuación más probable, y eso deja cuatro marcas que no
        dependen del idioma:
      </p>
      <ul>
        <li>
          <strong>Frases de longitud uniforme.</strong> Un humano alterna una
          frase de tres palabras con otra de cuarenta. Un modelo tiende a la
          media y la mantiene durante párrafos.
        </li>
        <li>
          <strong>Conectores de manual.</strong> «En primer lugar», «por otro
          lado», «en conclusión», «es importante destacar que». Aparecen en el
          sitio exacto donde un libro de estilo diría que aparezcan.
        </li>
        <li>
          <strong>Ausencia de concreción.</strong> Ni cifras, ni nombres, ni
          fechas, ni un ejemplo que solo pueda haber vivido quien escribe. Las
          afirmaciones son ciertas y no comprometen a nada.
        </li>
        <li>
          <strong>Párrafos simétricos.</strong> Tres ideas, tres párrafos, tres
          frases cada uno. El texto parece una plantilla rellenada porque, en
          cierto sentido, lo es.
        </li>
      </ul>
      <p>
        Esas cuatro cosas son también las que miden los detectores. Lo
        explicamos en detalle en{" "}
        <Link
          href={{
            pathname: "/blog/[slug]",
            params: { slug: "que-detectan-los-detectores-de-ia" },
          }}
        >
          qué detectan realmente los detectores de IA
        </Link>
        .
      </p>

      <h2>Los trucos que no funcionan</h2>
      <p>
        Circulan tres, y conviene descartarlos antes de perder una tarde con
        ellos.
      </p>
      <p>
        <strong>Cambiar palabras por sinónimos raros.</strong> Sustituir
        «importante» por «cardinal» no altera el ritmo ni la estructura, que es
        lo que se mide, y sí destruye la naturalidad: queda un texto que ningún
        hispanohablante escribiría. Es el peor de los tres porque empeora la
        lectura sin mover el resultado.
      </p>
      <p>
        <strong>Meter caracteres invisibles u homoglifos.</strong> Espacios de
        ancho cero, una «а» cirílica donde iba una latina. Funciona contra un
        detector que compare cadenas y contra ninguno que lea el texto. En un
        entorno académico, además, es un intento deliberado de engañar al
        sistema de entrega: cuando se descubre —y se descubre, porque el propio
        procesador de textos marca los caracteres— la consecuencia es bastante
        peor que un porcentaje alto.
      </p>
      <p>
        <strong>Añadir erratas a propósito.</strong> Una falta de ortografía no
        hace humano a un texto; hace descuidado a un texto. Y los detectores no
        puntúan la corrección ortográfica.
      </p>

      <h2>Lo que sí funciona</h2>
      <p>
        Todo lo que sigue mejora el texto por sí mismo. Que además cambie lo que
        ve un detector es una consecuencia, no el objetivo.
      </p>
      <h3>1. Rompe el ritmo</h3>
      <p>
        Busca tres párrafos seguidos donde todas las frases midan parecido.
        Parte la más larga en dos. Une dos cortas con un punto y coma. Deja una
        frase de cuatro palabras sola. El texto respira distinto de inmediato.
      </p>
      <h3>2. Quita el andamio</h3>
      <p>
        Los conectores de manual casi siempre se pueden borrar sin pérdida. «En
        primer lugar, hay que considerar que el precio importa» dice lo mismo
        que «el precio importa», con cinco palabras menos y sin sonar a examen.
        Empieza por «es importante destacar que»: es puro relleno.
      </p>
      <h3>3. Aterriza cada afirmación</h3>
      <p>
        Por cada párrafo, pregúntate si un lector podría discutirlo. Si no
        puede, es que no dice nada. «Muchas empresas adoptan la IA» no
        compromete; «tres de cada cuatro agencias con las que hablamos este año
        ya la usan para el primer borrador» sí. Una cifra, un nombre, una fecha
        o un ejemplo propio por párrafo cambia el texto entero.
      </p>
      <h3>4. Elige un registro y mantenlo</h3>
      <p>
        El error más común no es el vocabulario: es la mezcla. Un trabajo
        académico con un «vamos al grano» en medio, o un post de blog que de
        repente escribe «el presente documento tiene por objeto». Decide si
        escribes en primera persona o no, y no cambies a mitad.
      </p>
      <h3>5. Corta un quinto</h3>
      <p>
        Un texto generado casi siempre admite un 20 % menos sin perder una sola
        idea. Lo que se va es exactamente lo que sonaba a máquina.
      </p>

      <h2>Un método en cinco minutos</h2>
      <ol>
        <li>Lee el texto en voz alta. Marca donde te aburres.</li>
        <li>Borra todos los conectores de manual.</li>
        <li>Parte o une frases hasta que dos seguidas no midan igual.</li>
        <li>Añade un dato concreto por sección.</li>
        <li>Recorta hasta que no puedas quitar nada más.</li>
      </ol>

      <h2>Qué puede hacer una herramienta y qué no</h2>
      <p>
        Nuestro <Link href={TOOLS.humanize.path}>humanizador</Link> hace los
        pasos 1, 2 y 5 en un segundo, respetando el significado y el registro
        que le indiques —académico, neutro o informal—. Lo que no puede hacer,
        ni él ni ninguno, es el paso 3: el dato concreto que hace tuyo un texto
        solo lo tienes tú.
      </p>
      <p>
        Y una advertencia honesta, porque la verás prometida en otros sitios:
        <strong> nadie puede garantizar que un texto sea «indetectable»</strong>
        . Los detectores cambian cada pocos meses, funcionan por probabilidad y
        se equivocan en ambas direcciones. Cualquiera que te venda un 0 %
        garantizado te está vendiendo un número que no controla. Lo que sí
        puedes controlar es que el texto esté bien escrito, diga algo y sea
        tuyo.
      </p>
    </Prose>
  );
}

export const post: Post = {
  slug: "como-humanizar-un-texto-de-ia",
  locale: "es",
  title: "Cómo humanizar un texto de IA",
  description:
    "Las cuatro marcas que delatan a un texto generado, los tres trucos que no sirven de nada y un método de cinco pasos para arreglarlo de verdad.",
  published: "2026-09-26",
  tool: "humanize",
  Body,
};
