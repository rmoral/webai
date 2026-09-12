import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

export function WelcomeEmail({ appUrl }: { appUrl: string }) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Tu prueba de Verbalyx Pro ya está activa</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#fafafa" }}>
        <Container style={{ padding: "32px", maxWidth: "480px" }}>
          <Heading as="h2">¡Bienvenido a Verbalyx Pro!</Heading>
          <Text>
            Tu periodo de prueba de 3 días ya está activo. Desde ahora puedes
            usar todas las herramientas sin límite diario y con hasta 10.000
            palabras por petición.
          </Text>
          <Text>
            <Link href={`${appUrl}/app`}>Ir a mis herramientas →</Link>
          </Text>
          <Text style={{ color: "#666", fontSize: "12px" }}>
            Puedes cancelar en cualquier momento desde tu cuenta. Si cancelas
            antes de que termine la prueba, no se te cobrará nada.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
