import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { HTML_LANG, type Locale } from "./translator";

// The chrome both billing emails share.
//
// Constraints that are not style choices: system fonts, because a webfont
// is unreliable in a mail client and Geist will simply not arrive; no
// images, so nothing breaks when a client blocks them; inline styles on
// tables, which is the only layout Outlook renders the same way twice.

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const INK = "#252525";
const MUTED = "#6b6b6b";

export function EmailShell({
  locale,
  preview,
  children,
}: {
  locale: Locale;
  /** The line shown next to the subject. Carries the figure and the date. */
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html lang={HTML_LANG[locale]}>
      <Head>
        <style>{`
          @media (max-width: 600px) {
            .vx-h1 { font-size: 22px !important; }
            .vx-btn { display: block !important; width: 100% !important; }
          }
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{ fontFamily: FONT, backgroundColor: "#fafafa", color: INK }}
      >
        <Container style={{ padding: "32px 24px", maxWidth: "600px" }}>
          {children}
        </Container>
      </Body>
    </Html>
  );
}

export function EmailHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text
      className="vx-h1"
      style={{
        fontSize: "26px",
        fontWeight: 600,
        margin: "0 0 16px",
        lineHeight: 1.25,
      }}
    >
      {children}
    </Text>
  );
}

/**
 * The date and the amount, at 26px on a tinted panel.
 *
 * This is the whole point of both emails. Put in a footnote it does not
 * get read, and the charge three days later arrives as a surprise -- which
 * is what a chargeback is.
 */
export function ChargeBlock({
  label,
  date,
  amount,
}: {
  label: string;
  date: string;
  amount: string;
}) {
  return (
    <Section
      style={{
        backgroundColor: "#eef1fd",
        border: "1px solid #c6cef4",
        borderRadius: "12px",
        padding: "20px 24px",
        margin: "20px 0",
        textAlign: "center" as const,
      }}
    >
      <Text
        style={{
          margin: 0,
          fontSize: "14px",
          color: "#1b2a76",
          fontWeight: 500,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          margin: "6px 0 0",
          fontSize: "26px",
          fontWeight: 600,
          color: "#1b2a76",
          lineHeight: 1.2,
        }}
      >
        {date}
      </Text>
      <Text style={{ margin: "4px 0 0", fontSize: "16px", color: "#1b2a76" }}>
        {amount}
      </Text>
    </Section>
  );
}

export function EmailButton({
  href,
  variant = "primary",
  children,
}: {
  href: string;
  variant?: "primary" | "outline";
  children: React.ReactNode;
}) {
  const primary = variant === "primary";
  return (
    <Button
      className="vx-btn"
      href={href}
      style={{
        display: "inline-block",
        padding: "12px 20px",
        borderRadius: "8px",
        fontSize: "15px",
        fontWeight: 500,
        textDecoration: "none",
        textAlign: "center" as const,
        marginRight: "8px",
        backgroundColor: primary ? "#2b45c4" : "#ffffff",
        color: primary ? "#ffffff" : INK,
        border: primary ? "1px solid #2b45c4" : "1px solid #ebebeb",
      }}
    >
      {children}
    </Button>
  );
}

export function EmailBody({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontSize: "15px", lineHeight: 1.6, margin: "0 0 14px" }}>
      {children}
    </Text>
  );
}

/**
 * Identifies the company and states what kind of message this is.
 *
 * "A billing notice, not marketing" is not a nicety: it is what keeps a
 * transactional message out of the marketing rules and out of the
 * unsubscribe requirement that would let someone opt out of being told
 * they are about to be charged.
 */
export function EmailFooter({ lines }: { lines: [string, string] }) {
  return (
    <Section
      style={{
        borderTop: "1px solid #ebebeb",
        marginTop: "28px",
        paddingTop: "16px",
      }}
    >
      <Text style={{ fontSize: "12px", color: MUTED, margin: "0 0 4px" }}>
        {lines[0]}
      </Text>
      <Text style={{ fontSize: "12px", color: MUTED, margin: 0 }}>
        {lines[1]}
      </Text>
    </Section>
  );
}
