import React from "react";
import { ToolEditor } from "../../components/tools/ToolEditor.jsx";

const FAQ = [
  {
    q: "¿Qué hace un humanizador de texto IA?",
    a: "Reescribe un texto generado por inteligencia artificial para que suene natural y humano: varía la estructura de las frases, elimina las muletillas típicas de la IA y ajusta el tono, sin cambiar el significado ni los datos.",
  },
  {
    q: "¿Es gratis?",
    a: "Sí. Puedes humanizar hasta 300 palabras al día sin registrarte, y 500 al día con una cuenta gratuita. El plan Pro amplía el límite a 10.000 palabras por petición.",
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
    a: "No. Los textos de usuarios anónimos y gratuitos no se almacenan: solo registramos métricas de uso. El historial es una función opcional del plan Pro.",
  },
];

const h2 = { margin: 0, fontSize: "var(--text-2xl)", fontWeight: "var(--font-semibold)" };
const p = { marginTop: "var(--space-3)", marginBottom: 0, color: "var(--muted-foreground)" };

export function HumanizerLanding({ onNavigate = () => {} }) {
  return (
    <main style={{ maxWidth: "65rem", margin: "0 auto", padding: "var(--pad-page-y) var(--gutter-page)" }}>
      <h1 style={{ margin: 0, fontSize: "var(--text-4xl)", fontWeight: "var(--font-bold)", letterSpacing: "var(--tracking-tight)" }}>
        Humanizador de texto IA en español
      </h1>
      <p style={{ marginTop: "var(--space-3)", marginBottom: 0, maxWidth: "42rem", fontSize: "var(--text-lg)", color: "var(--muted-foreground)" }}>
        Pega un texto generado por ChatGPT u otra IA y conviértelo en un texto natural, fluido y con tu registro: académico, neutro o informal. Gratis y sin registro.
      </p>

      <div style={{ marginTop: "var(--space-8)" }}>
        <ToolEditor
          name="Humanizador"
          wordsRemaining={300}
          initialText="Es importante destacar que la implementación de estas metodologías resulta fundamental para optimizar los resultados obtenidos."
          footer="Sin registro. No guardamos tu texto."
        />
      </div>

      <section style={{ marginTop: "var(--space-16)" }}>
        <h2 style={h2}>Cómo humanizar un texto de IA (bien)</h2>
        <p style={p}>
          Los textos generados por IA se reconocen por sus tics: frases de longitud uniforme, conectores repetidos («en resumen», «es importante destacar»), un tono impersonal y párrafos que dicen mucho sin decir nada. Humanizar un texto no es cambiar palabras por sinónimos: es reescribirlo como lo haría una persona, conservando el significado, los datos y la terminología.
        </p>
        <p style={p}>
          Nuestro humanizador está construido específicamente para el español — de España y de LATAM — y no es una traducción de una herramienta en inglés. Respeta las normas de la RAE en el registro académico, varía la estructura sintáctica de forma natural y nunca añade información que no estaba en el original.
        </p>
        <h2 style={{ ...h2, marginTop: "var(--space-8)" }}>Tres registros, un mismo significado</h2>
        <p style={p}>
          El registro «académico» mantiene la formalidad y los conectores propios de la escritura universitaria. El «neutro» produce un español claro y directo, válido a ambos lados del Atlántico. El «informal» acerca el tono a una conversación, ideal para redes sociales o newsletters.
        </p>
      </section>

      <section style={{ marginTop: "var(--space-16)" }}>
        <h2 style={h2}>Preguntas frecuentes</h2>
        <div style={{ marginTop: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {FAQ.map(({ q, a }) => (
            <div key={q}>
              <h3 style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: "var(--font-medium)" }}>{q}</h3>
              <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      <p style={{ marginTop: "var(--space-16)", marginBottom: 0, fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>
        ¿Necesitas más palabras o el registro académico a diario?{" "}
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate("precios"); }} style={{ textDecoration: "underline", color: "inherit" }}>
          Consulta el plan Pro
        </a>
        .
      </p>
    </main>
  );
}
