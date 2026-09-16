// Calibration corpus for Phase 1. Kept beside the engine rather than inside
// the test file because the weights in weights.ts are tuned by hand against
// exactly these texts, and a person turning a weight needs to read them.
//
// Read the names as REGISTERS, not as verified provenance. These texts were
// written for this file; none of them is a provenance-verified human sample
// or a provenance-verified model output, and Phase 1 does not measure
// authorship -- it measures register and rhythm. "HUMANO_*" means "written
// in a register people write in"; GENERADO_SIN_EDITAR means "written in the
// assistant register, with the artefacts a paste from a chat carries".
// Claiming more than that in a fixture name would be claiming more than the
// engine can deliver.
//
// Every sample is above the 200-word floor on purpose: below it the engine
// answers "gris" and measures nothing, which tests the threshold rather than
// the signals.

/** Copy-pasted from a chat, untouched: Markdown, em dashes and all. */
export const GENERADO_SIN_EDITAR = `**La transformación digital en las organizaciones**

La inteligencia artificial ha transformado profundamente la manera en que las organizaciones abordan sus procesos internos. En la actualidad, resulta fundamental comprender cómo estas herramientas pueden integrarse de forma efectiva en los flujos de trabajo existentes. Las empresas que han iniciado este camino reportan mejoras sustanciales en su productividad operativa.

Por otro lado, es importante destacar que la adopción tecnológica no depende únicamente de la infraestructura disponible. En este sentido, la formación del personal desempeña un papel crucial en el éxito de cualquier iniciativa. Además, cabe señalar que las empresas que invierten en capacitación obtienen mejores resultados a largo plazo. Este hallazgo se repite en los principales estudios sectoriales de los últimos años.

Asimismo, la cultura organizacional influye de manera significativa en la aceptación de nuevas herramientas. Es esencial que los responsables comprendan las expectativas de sus equipos antes de iniciar cualquier despliegue. Por lo tanto, la comunicación interna se convierte en un aspecto clave del proceso de adopción tecnológica. Resulta igualmente relevante establecer indicadores claros desde el primer momento.

Cabe destacar que la resistencia al cambio constituye uno de los obstáculos más frecuentes. Las organizaciones deben abordar esta cuestión con estrategias específicas de acompañamiento. De esta manera, se facilita una transición ordenada hacia los nuevos modelos de trabajo. La experiencia demuestra que los proyectos acompañados obtienen tasas de adopción notablemente superiores.

En conclusión, la transformación digital requiere un enfoque integral que combine tecnología, personas y procesos de manera equilibrada. Las organizaciones que lo entiendan así obtendrán una ventaja competitiva sostenible en el tiempo — y esa ventaja será difícil de replicar por parte de sus competidores directos.`;

/**
 * The maximum false-positive risk: formal academic Spanish, dense with
 * subordination and semicolons, of the kind a careful person writes.
 *
 * This exact text was pinned in the previous engine's suite as a sample it
 * could not see. Phase 1 also puts it in verde, and that is the decision,
 * not the bug: at 254 words, rhythm cannot separate this register from a
 * generated block (see the note on AGGREGATION in weights.ts), and of the
 * two possible errors only one puts an accusation on a student's desk.
 */
export const HUMANO_ACADEMICO = `El debate sobre la periodización del Renacimiento español ha estado condicionado por una tensión historiográfica persistente. Menéndez Pelayo situó su inicio en la década de 1520, vinculándolo a la difusión del erasmismo; Bataillon, medio siglo después, matizó esa lectura al mostrar que la recepción de Erasmo fue más tardía y más conflictiva de lo supuesto.

La discusión no es meramente cronológica. Aceptar una u otra fecha implica asumir qué se considera "renacentista": ¿la circulación de textos clásicos, la reforma de la piedad, un determinado gusto formal? Los estudios recientes sobre bibliotecas privadas sevillanas complican aún más el cuadro, pues documentan la presencia de autores italianos décadas antes de lo que admitía el consenso.

Quizá el problema resida en la propia categoría, heredada de una tradición crítica que buscaba en España un reflejo del modelo italiano. Si abandonamos esa expectativa, la pregunta por la fecha pierde buena parte de su urgencia. Lo que queda es una historia de recepciones desiguales, de lecturas parciales, de apropiaciones locales que no se dejan ordenar en un esquema único. Así lo han señalado, con matices distintos, Rico y Gómez Moreno.

Conviene añadir una cautela. La documentación conservada privilegia a los lectores acomodados, que son quienes dejaban inventarios; de la lectura popular sabemos poco y lo poco que sabemos procede de fuentes indirectas, casi siempre judiciales. Cualquier periodización construida sobre ese material hereda ese sesgo. No es un argumento para renunciar a periodizar, pero sí para hacerlo con menos confianza de la que suele exhibirse en los manuales al uso.`;

/** A person writing loosely: short sentences, digressions, real numbers. */
export const HUMANO_INFORMAL = `Llevo seis años en esto y todavía no sé qué contestar cuando alguien me pregunta si la IA nos va a quitar el trabajo. Depende. La primera vez que vi a un compañero automatizar en veinte minutos algo que a mí me llevaba toda una mañana, me fastidió. Mucho.

Luego entendí que lo que había automatizado era la parte aburrida: copiar celdas de un sitio a otro, revisar que los totales cuadrasen, mandar el mismo correo a catorce personas. Lo otro -decidir qué se mide, discutirlo con el cliente, tragarte una reunión de dos horas para descubrir que nadie sabía lo que quería- eso sigue ahí.

¿Y por cuánto tiempo? Ni idea. Pero he dejado de hacer apuestas: en 2019 dije que los modelos de lenguaje nunca escribirían código decente, y ya ves. Ahora mismo tengo abierto un editor donde la mitad de lo que hay lo ha escrito una máquina, y no me parece mal. Me parece raro, que es distinto.

En la oficina hicimos una apuesta tonta en enero. Seis personas, veinte euros cada una, sobre cuántos de nosotros seguiríamos haciendo el mismo trabajo en diciembre. Ganó Marta, que dijo cinco. Vamos por noviembre y seguimos siendo seis, así que técnicamente perdió, pero le dimos el bote igual porque fue la única que se atrevió a decir un número. El resto pusimos cosas como "depende del sector". Cobardes.`;

/** Mexican Spanish. A detector trained on peninsular Spanish flags this. */
export const MEXICO = `La discusión sobre el agua en el Valle de México no es nueva, pero se ha vuelto insoportable. Hace un par de años, en la colonia donde vivía mi mamá, el agua llegaba tres veces por semana. Ahora llega una, si bien nos va.

Lo que más coraje da es que nadie parece hacerse responsable. El municipio dice que es cosa de la Conagua, la Conagua dice que las redes municipales tienen fugas del cuarenta por ciento, y mientras tanto la gente compra pipas a doscientos pesos. Doscientos pesos. Para lavar trastes.

Mi tío, que trabajó veinte años en el sistema de aguas, me explicó una vez que el problema de fondo es que seguimos bombeando desde el Cutzamala como si el acuífero no se estuviera hundiendo. La ciudad se hunde, literalmente, unos centímetros al año. Eso rompe tuberías, y las tuberías rotas pierden agua, y para compensar bombeamos más. Es un círculo que ya no sé si tiene salida.

El año pasado fui a una asamblea vecinal sobre el tema. Éramos como cuarenta. Duró tres horas y salimos con un acuerdo: juntar firmas. Ya van mil ochocientas. Nadie nos ha contestado. Una señora, doña Carmen, lleva yendo a la delegación cada martes desde febrero. Cada martes. A veces pienso que ella sola tiene más constancia que todo el resto de la colonia junto, y eso también dice algo de nosotros.`;

/** Rioplatense Spanish: voseo, local vocabulary, informal register. */
export const ARGENTINA = `Che, yo la verdad que con el tema de la inflación ya no sé qué pensar. Mi vieja dice que esto lo vivió en el ochenta y nueve y que aquello sí que era grave, pero a mí me parece que comparar no sirve de mucho.

Lo concreto es que en marzo el kilo de asado estaba tres mil pesos y ahora está en cinco mil doscientos. Andá a explicarle eso a alguien que cobra lo mismo que en enero. En el laburo hicimos la cuenta un día: entre cuatro compañeros, ninguno llegaba a fin de mes sin pedir adelanto.

¿Y qué hacés? Nada, te arreglás. Comprás en el chino de la esquina porque está diez por ciento más barato, dejás de pedir delivery, y cuando podés te vas a Once a comprar ropa. Es eso o volverte loco mirando el dólar todos los días. Yo dejé de mirarlo en agosto y te juro que dormí mejor.

Mi hermana se fue a Madrid en mayo. Dice que allá también está todo caro pero que al menos sabe cuánto va a costar el mes que viene. Puede ser. Yo no me iría, pero tampoco la juzgo. Cada uno aguanta lo que puede y durante el tiempo que puede, y el que diga que eso se decide con principios es porque nunca tuvo que decidirlo de verdad. Mi viejo, que nunca se fue, opina distinto. Discutimos cada domingo.`;

/** Written opening, generated close: the case averaging would hide. */
export const MIXTO = `Empecé a escribir esto en el tren, que es donde se me ocurren las cosas. No tenía un plan. Quería contar por qué dejé de usar hojas de cálculo para llevar las cuentas del taller y acabé con un cuaderno, que es ir para atrás, ya lo sé.

La razón es tonta: en la hoja todo cuadraba siempre y eso me daba una falsa tranquilidad. En el cuaderno los números no cuadran hasta que me siento a cuadrarlos, y ese rato de sentarme es cuando me entero de verdad de cómo va el mes. Con la hoja abierta nunca me enteraba. Miraba el total y ya.

En la actualidad, resulta fundamental comprender cómo las herramientas digitales pueden integrarse de forma efectiva en la gestión de pequeños negocios. Por otro lado, es importante destacar que la digitalización no depende únicamente del software disponible. En este sentido, los hábitos del propietario desempeñan un papel crucial en el éxito de cualquier sistema de control. Además, cabe señalar que los negocios que combinan ambos enfoques obtienen mejores resultados. Asimismo, la constancia en el registro influye de manera significativa en la calidad de la información obtenida. Por lo tanto, resulta esencial establecer una rutina periódica de revisión contable.`;

/** Below the floor. The engine must refuse to put a band on this. */
export const CORTO = `Un texto corto no da para mucho. Tiene cuatro frases. Ninguna medida estadística sirve aquí. Y decirlo es más honesto que inventarse un número.`;
