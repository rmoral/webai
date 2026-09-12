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

export function TrialEndingEmail({ appUrl }: { appUrl: string }) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Tu prueba de Verbalyx Pro termina mañana</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#fafafa" }}>
        <Container style={{ padding: "32px", maxWidth: "480px" }}>
          <Heading as="h2">Tu prueba termina mañana</Heading>
          <Text>
            Mañana finaliza tu periodo de prueba de Verbalyx Pro y se activará
            tu suscripción. Si quieres seguir, no tienes que hacer nada.
          </Text>
          <Text>
            Si prefieres cancelar, puedes hacerlo en un clic desde{" "}
            <Link href={`${appUrl}/app`}>tu cuenta</Link> y no se te cobrará
            nada.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
