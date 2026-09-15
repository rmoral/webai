import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Minimal legal templates for a Florida LLC selling to Spanish-speaking
// consumers. Governing law is Florida, but the service is directed at Spain
// and LATAM, so EU/EEA/UK consumers keep their mandatory rights and the GDPR
// applies to them extraterritorially — hence the dedicated sections.
//
// PENDING before going live: a US consumer-law review of the subscription
// flow, a registered DMCA agent, and a decision on binding arbitration
// (deliberately not included here). See PLAN_DESARROLLO_WRITE_AI.md §6.

const COMPANY = {
  name: "YBB SOLUTIONS, LLC",
  jurisdiction:
    "sociedad de responsabilidad limitada constituida en el estado de Florida (Estados Unidos)",
  address:
    "7345 W Sand Lake Road, Ste 210, Office 1877, Orlando, Florida, Estados Unidos",
  legalEmail: "legal@verbalyx.ai",
  contactEmail: "contact@verbalyx.ai",
};

interface LegalPage {
  title: string;
  sections: { heading: string; body: string }[];
}

const PAGES: Record<string, LegalPage> = {
  // Slug kept from the previous Spanish-jurisdiction version so existing
  // links do not break; the content is no longer an LSSI notice.
  "aviso-legal": {
    title: "Información legal",
    sections: [
      {
        heading: "Titular del servicio",
        body: `verbalyx.ai es un servicio operado por ${COMPANY.name}, ${COMPANY.jurisdiction}, con domicilio en ${COMPANY.address}. Para cualquier asunto legal puedes escribir a ${COMPANY.legalEmail}; para consultas generales y soporte, a ${COMPANY.contactEmail}.`,
      },
      {
        heading: "Objeto",
        body: "Verbalyx es un servicio de asistencia a la escritura mediante inteligencia artificial: humanización, detección, paráfrasis y corrección de textos en español. Se presta en línea, bajo suscripción o en modalidad gratuita con límites de uso.",
      },
      {
        heading: "Propiedad intelectual",
        body: "El diseño, el código, la marca y los contenidos del sitio pertenecen a la empresa titular. Los textos que introduces y los resultados generados a partir de ellos son tuyos: no reclamamos ningún derecho sobre ellos.",
      },
      {
        heading: "Reclamaciones por derechos de autor",
        body: `Si consideras que un contenido accesible a través del servicio infringe tus derechos de autor, envía una notificación a ${COMPANY.legalEmail} identificando la obra, el material presuntamente infractor y tus datos de contacto, con una declaración de buena fe y de exactitud bajo pena de perjurio, conforme a la Digital Millennium Copyright Act (17 U.S.C. § 512).`,
      },
    ],
  },
  terminos: {
    title: "Términos del servicio",
    sections: [
      {
        heading: "Quién presta el servicio",
        body: `El servicio lo presta ${COMPANY.name}, ${COMPANY.jurisdiction}, con domicilio en ${COMPANY.address}. Al crear una cuenta o contratar una suscripción aceptas estos términos.`,
      },
      {
        heading: "El servicio",
        body: "Verbalyx ofrece herramientas de escritura con IA en modalidad gratuita, con límites diarios, y mediante suscripción de pago. Los límites vigentes de cada plan se muestran siempre en la página de precios y pueden cambiar con aviso previo razonable.",
      },
      {
        heading: "Cuenta y edad mínima",
        body: "Debes tener al menos 18 años para contratar una suscripción. Si tienes entre 13 y 17 años puedes usar la modalidad gratuita con el consentimiento de tu madre, padre o tutor. Eres responsable de la seguridad de tus credenciales.",
      },
      {
        heading: "Suscripción, prueba gratuita y renovación automática",
        body: "Los pagos se procesan a través de Stripe. El plan Ilimitado incluye un periodo de prueba de 3 días que requiere método de pago. Antes de introducir tus datos de pago te mostramos, de forma clara y destacada, que hoy no se te cobra nada, la fecha exacta del primer cargo y su importe. Si no cancelas antes de que termine la prueba, la suscripción se activa y se cobra el plan elegido. Todas las suscripciones se renuevan automáticamente por periodos equivalentes al contratado hasta que las canceles.",
      },
      {
        heading: "Cancelación",
        body: "Puedes cancelar en cualquier momento y en línea, desde «Mi cuenta», sin llamar por teléfono, sin escribir un correo y sin pasos adicionales: el mismo número de clics con el que contrataste. La cancelación surte efecto al final del periodo ya pagado y conservas el acceso hasta esa fecha. No se aplican penalizaciones por cancelar.",
      },
      {
        heading: "Reembolsos",
        body: `Los importes ya cobrados por un periodo en curso no son reembolsables, salvo que la ley aplicable exija otra cosa o que el servicio no haya estado disponible por causas que nos sean imputables. Si crees que se te ha cobrado por error, escríbenos a ${COMPANY.contactEmail} dentro de los 30 días siguientes al cargo y lo revisamos.`,
      },
      {
        heading: "Precios e impuestos",
        body: "Los precios se expresan en dólares estadounidenses y no incluyen impuestos. Los impuestos aplicables —incluido el impuesto sobre ventas de los estados de EE. UU. que lo exijan, o el IVA/IGV de tu país cuando corresponda— se calculan y se muestran en el momento del pago.",
      },
      {
        heading: "Consumidores en la UE, el EEE y Reino Unido",
        body: "Dirigimos el servicio a países de habla hispana, incluida España. Si eres consumidor y resides en la Unión Europea, el EEE o Reino Unido, nada en estos términos te priva de los derechos imperativos que te otorgue la ley de tu país de residencia. En particular: al contratar consientes expresamente el acceso inmediato al contenido digital y reconoces que, una vez iniciada la prestación, decae el derecho de desistimiento de 14 días, sin perjuicio del periodo de prueba gratuito y de tu derecho a cancelar en cualquier momento.",
      },
      {
        heading: "Uso aceptable",
        body: "No está permitido usar el servicio para actividades ilícitas, para infringir derechos de terceros, para generar contenido engañoso o difamatorio, ni para eludir sistemas de evaluación académica cuando ello contravenga las normas de tu centro. El detector de IA ofrece resultados orientativos, de naturaleza estadística, y no debe usarse como prueba única para acusar a nadie.",
      },
      {
        heading: "Garantías",
        body: "Los resultados se generan mediante modelos de inteligencia artificial y pueden contener errores, imprecisiones u omisiones; revísalos antes de usarlos. El servicio se presta «tal cual» y «según disponibilidad», sin garantías de ningún tipo, expresas o implícitas, incluidas las de comerciabilidad, idoneidad para un fin concreto y no infracción, en la máxima medida permitida por la ley. No garantizamos que el texto producido supere ningún detector de IA de terceros.",
      },
      {
        heading: "Limitación de responsabilidad",
        body: "En la máxima medida permitida por la ley, la responsabilidad total de la empresa frente a ti por cualquier reclamación relacionada con el servicio no excederá el importe que hayas pagado en los doce meses anteriores al hecho que la origine. No respondemos de daños indirectos, incidentales, especiales o consecuenciales, ni de lucro cesante o pérdida de datos. Algunas jurisdicciones no permiten estas exclusiones; en ese caso, se aplican en la medida en que la ley lo permita.",
      },
      {
        heading: "Ley aplicable y jurisdicción",
        body: "Estos términos se rigen por las leyes del estado de Florida (Estados Unidos), sin atender a sus normas de conflicto de leyes. Los tribunales estatales y federales situados en el condado de Orange (Florida) serán competentes, salvo que seas consumidor y la ley de tu país de residencia te reconozca el derecho a acudir a los tribunales de tu domicilio, en cuyo caso ese derecho prevalece.",
      },
      {
        heading: "Cambios y contacto",
        body: `Podemos modificar estos términos; si el cambio es sustancial te avisaremos por correo electrónico o dentro del servicio antes de que surta efecto, y podrás cancelar si no lo aceptas. Para cualquier cuestión sobre estos términos: ${COMPANY.legalEmail}.`,
      },
    ],
  },
  privacidad: {
    title: "Política de privacidad",
    sections: [
      {
        heading: "Responsable del tratamiento",
        body: `${COMPANY.name}, ${COMPANY.jurisdiction}, con domicilio en ${COMPANY.address}. Para ejercer tus derechos o preguntar cualquier cosa sobre esta política: ${COMPANY.legalEmail}.`,
      },
      {
        heading: "Dónde se tratan tus datos",
        body: "La empresa está establecida en Estados Unidos y tus datos se tratan principalmente allí, así como en la infraestructura de nuestros proveedores. Si resides fuera de EE. UU., esto implica una transferencia internacional de datos; más abajo explicamos las garantías que aplicamos.",
      },
      {
        heading: "Qué datos tratamos y para qué",
        body: "Datos de cuenta (correo electrónico y, si lo facilitas, nombre) para prestarte el servicio. Datos de facturación, gestionados íntegramente por Stripe: no almacenamos números de tarjeta. Métricas de uso (recuentos de palabras y de peticiones) para aplicar los límites de tu plan y detectar abuso; las direcciones IP se almacenan siempre seudonimizadas mediante hash con clave, nunca en claro. Analítica de producto con PostHog, que funciona sin cookies hasta que consientas.",
      },
      {
        heading: "Tus textos",
        body: "Los textos de usuarios anónimos y del plan gratuito no se almacenan: solo guardamos el recuento de palabras. Para generar el resultado, el texto se envía a nuestro proveedor de IA (Anthropic) a través de su API y no se utiliza para entrenar modelos. El historial de documentos es una función opcional de los planes de pago y se guarda cifrado con AES-256-GCM; puedes desactivarlo o borrarlo cuando quieras.",
      },
      {
        heading: "Proveedores",
        body: "Trabajamos con encargados de tratamiento sujetos a contrato: Supabase (base de datos y autenticación), Vercel (alojamiento), Stripe (pagos), Anthropic (procesamiento de IA), Resend (correo transaccional), PostHog (analítica) y Sentry (registro de errores). No vendemos tus datos personales ni los compartimos con terceros con fines publicitarios.",
      },
      {
        heading: "Conservación",
        body: "Conservamos los datos de tu cuenta mientras esta exista. Al eliminar tu cuenta borramos tus datos personales y tus documentos; mantenemos únicamente los registros de facturación durante el plazo que exige la normativa fiscal y contable estadounidense, y métricas agregadas que no permiten identificarte.",
      },
      {
        heading: "Tus derechos",
        body: `Puedes acceder a tus datos, corregirlos, exportarlos y eliminarlos. La forma más rápida es desde «Mi cuenta», que incluye la opción de eliminar tu cuenta y tus datos. También puedes escribirnos a ${COMPANY.legalEmail}; responderemos en un plazo máximo de 30 días.`,
      },
      {
        heading: "Si resides en la UE, el EEE o Reino Unido",
        body: `Te aplica el RGPD. Las bases legales de nuestro tratamiento son: la ejecución del contrato (cuenta, prestación del servicio, límites de plan y facturación), el interés legítimo (seguridad y prevención del abuso) y tu consentimiento (analítica con cookies y comunicaciones comerciales). Tienes derecho de acceso, rectificación, supresión, oposición, limitación y portabilidad, y a retirar tu consentimiento en cualquier momento. Las transferencias de datos a Estados Unidos se amparan en las cláusulas contractuales tipo de la Comisión Europea suscritas con nuestros proveedores. Puedes presentar una reclamación ante la autoridad de control de tu país —en España, la Agencia Española de Protección de Datos (aepd.es)—. Para ejercer cualquiera de estos derechos: ${COMPANY.legalEmail}.`,
      },
      {
        heading: "Si resides en California",
        body: `Te aplica la CCPA, modificada por la CPRA. Tienes derecho a saber qué categorías de información personal recogemos y con qué fin, a solicitar su eliminación, a corregirla, a limitar el uso de información personal sensible y a no sufrir trato discriminatorio por ejercer estos derechos. No vendemos ni compartimos tu información personal en el sentido que la CCPA da a esos términos, tampoco la de menores de 16 años. Para ejercer tus derechos: ${COMPANY.legalEmail}.`,
      },
      {
        heading: "Menores",
        body: "El servicio no está dirigido a menores de 13 años y no recogemos conscientemente sus datos. Si detectamos una cuenta de un menor de 13 años, la eliminamos junto con sus datos. Si crees que un menor a tu cargo nos ha facilitado datos, escríbenos y lo resolvemos.",
      },
      {
        heading: "Cambios",
        body: "Si modificamos esta política de forma sustancial te lo notificaremos por correo electrónico o dentro del servicio antes de que el cambio surta efecto.",
      },
    ],
  },
  cookies: {
    title: "Política de cookies",
    sections: [
      {
        heading: "Cookies que usamos",
        body: "Cookies técnicas imprescindibles: sesión de autenticación (Supabase) y preferencias de la interfaz. Sin ellas el servicio no puede funcionar. Analítica (PostHog): funciona en modo sin cookies hasta que das tu consentimiento a través del banner; si consientes, se usan cookies de analítica. Publicidad (Google): solo con tu consentimiento, mediante Consent Mode v2.",
      },
      {
        heading: "Cómo gestionar el consentimiento",
        body: "Puedes aceptar, rechazar o cambiar tu elección en cualquier momento desde el banner de cookies o desde la configuración de tu navegador. Rechazar la analítica y la publicidad no afecta al funcionamiento del servicio ni a los límites de tu plan.",
      },
      {
        heading: "No vendemos ni compartimos tu información",
        body: `No usamos cookies para vender ni compartir información personal con fines de publicidad conductual entre contextos, en el sentido que la CCPA da a esos términos. Si resides en California y quieres ejercer tus derechos, escríbenos a ${COMPANY.legalEmail}.`,
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
        Última actualización: 15 de septiembre de 2026.
      </p>
    </main>
  );
}
