import type { Post } from "@/content/blog";
import { Prose } from "@/components/marketing/article";
import { TOOLS } from "@/lib/ai/tools";
import { Link } from "@/lib/i18n/navigation";

function Body() {
  return (
    <Prose>
      <p>
        Parafrasear bien es una de esas cosas que parecen fáciles hasta que
        alguien te explica dónde está la línea. Y la línea no está donde casi
        todo el mundo cree: no la marca cuántas palabras has cambiado, sino si
        has atribuido la idea. Un texto puede tener todas las palabras distintas
        y seguir siendo plagio.
      </p>

      <h2>El error de base: cambiar sinónimos</h2>
      <p>
        Coger una frase ajena y sustituir una palabra de cada tres tiene nombre
        propio en la literatura académica: plagio de mosaico. Se reconoce a
        simple vista, porque la estructura sintáctica del original sigue ahí
        intacta debajo de las palabras nuevas, y los sistemas de similitud lo
        detectan sin dificultad precisamente por eso.
      </p>
      <blockquote>
        Original: «El aumento de la temperatura media provoca una reducción
        significativa de la biodiversidad en los ecosistemas costeros».
        <br />
        Mosaico: «El incremento de la temperatura promedio causa una disminución
        notable de la biodiversidad en los ecosistemas del litoral».
      </blockquote>
      <p>
        La segunda versión no es una paráfrasis. Es la primera con un
        diccionario de sinónimos encima.
      </p>

      <h2>Qué exige una paráfrasis de verdad</h2>
      <p>Tres cosas, y las tres a la vez:</p>
      <ol>
        <li>
          <strong>Cambiar la estructura, no solo el léxico.</strong> Reordena la
          causa y el efecto, pasa de pasiva a activa, convierte una subordinada
          en una frase independiente, junta dos ideas en una o parte una en dos.
        </li>
        <li>
          <strong>Conservar el significado exacto.</strong> Incluidos los
          matices y las reservas. Si el original dice «podría contribuir», la
          paráfrasis no puede decir «contribuye»: eso no es reformular, es
          cambiar la afirmación de otro.
        </li>
        <li>
          <strong>Citar la fuente igualmente.</strong> Aquí está el punto que
          más se falla. Parafrasear no exime de citar; la cita es lo que
          convierte una idea ajena en una idea ajena bien usada.
        </li>
      </ol>
      <p>
        La prueba práctica: escribe la paráfrasis sin el original delante. Si
        necesitas tenerlo a la vista para reformularlo, estás copiando la
        estructura.
      </p>

      <h2>Cuándo hay que citar textualmente</h2>
      <p>
        No todo se parafrasea. Si la formulación concreta importa —una
        definición legal, un término que el autor acuña, una frase cuya
        redacción es el objeto de tu análisis— la cita literal entre comillas es
        la opción correcta, y reformularla sería empeorarla.
      </p>

      <h2>Qué modo elegir</h2>
      <p>
        Nuestro <Link href={TOOLS.paraphrase.path}>parafraseador</Link> ofrece
        varios modos, y la elección importa más de lo que parece:
      </p>
      <ul>
        <li>
          <strong>Académico</strong> para un trabajo o un artículo: mantiene la
          precisión terminológica y no «alegra» la prosa.
        </li>
        <li>
          <strong>Formal</strong> para correos y documentos profesionales.
        </li>
        <li>
          <strong>Simple</strong> cuando el problema es que el original es
          ilegible: frases más cortas, menos subordinación.
        </li>
        <li>
          <strong>Fluido</strong> y <strong>creativo</strong> para divulgación y
          marketing, donde el tono puede alejarse del original.
        </li>
      </ul>
      <p>
        Un aviso sobre el modo creativo en contextos académicos: cuanto más se
        aleja del original, más fácil es que se lleve por delante un matiz. Si
        el texto va a ser evaluado, revisa la salida frase a frase.
      </p>

      <h2>Los tres errores que vemos siempre</h2>
      <ul>
        <li>
          <strong>Parafrasear y no citar.</strong> Es plagio, aunque el texto
          sea irreconocible.
        </li>
        <li>
          <strong>Parafrasear un resumen ajeno.</strong> Si reformulas el
          resumen que otro hizo de un estudio, estás citando a quien resumió, no
          al estudio. Ve a la fuente.
        </li>
        <li>
          <strong>Encadenar herramientas.</strong> Parafrasear una paráfrasis
          suele producir frases que ya no dicen nada exacto. Una pasada y
          revisión humana.
        </li>
      </ul>
      <p>
        Si además quieres que el resultado no suene a máquina, eso es otra
        tarea:{" "}
        <Link
          href={{
            pathname: "/blog/[slug]",
            params: { slug: "como-humanizar-un-texto-de-ia" },
          }}
        >
          cómo humanizar un texto de IA
        </Link>
        . Y si lo que te preocupa es lo que dirá un detector, empieza por{" "}
        <Link
          href={{
            pathname: "/blog/[slug]",
            params: { slug: "que-detectan-los-detectores-de-ia" },
          }}
        >
          qué detectan realmente
        </Link>
        .
      </p>
    </Prose>
  );
}

export const post: Post = {
  slug: "parafrasear-sin-plagiar",
  locale: "es",
  title: "Parafrasear sin plagiar: dónde está la línea",
  description:
    "Cambiar sinónimos no es parafrasear: es plagio de mosaico. Qué exige una paráfrasis correcta, cuándo hay que citar literalmente y qué modo usar en cada caso.",
  published: "2026-09-24",
  tool: "paraphrase",
  Body,
};
