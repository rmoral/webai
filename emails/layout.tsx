import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { HTML_LANG, type Locale } from "./translator";

// The chrome every email shares.
//
// Constraints that are not style choices: system fonts, because a webfont
// is unreliable in a mail client and Geist will simply not arrive; no
// images, so nothing breaks when a client blocks them; inline styles on
// tables, which is the only layout Outlook renders the same way twice.
//
// Dark mode is done twice over, because no client agrees on how to ask
// for it: a media query for Apple Mail and Gmail on iOS, `[data-ogsc]`
// for Outlook, and a `.vx-dark` class for anything that flips it upstream.
// Every critical colour stays inline as well, for the clients that drop
// the style block entirely -- Gmail's web app among them.

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const INK = "#252525";
const MUTED = "#6b6b6b";
const BRAND = "#2b45c4";
const LINE = "#ebebeb";

const DARK = `
.vx-bg{background:#121212!important}
.vx-card{background:#1c1c1c!important;border-color:#2e2e2e!important}
.vx-ink{color:#ededed!important}
.vx-mut{color:#a3a3a3!important}
.vx-line{border-color:#2e2e2e!important}
.vx-blk{background:#1b2050!important;border-color:#2f3873!important}
.vx-blk-ink{color:#c8d0fb!important}
.vx-x{color:#8b9cf3!important}
.vx-link{color:#9aa9f5!important}
`;

const STYLE = `
@media (max-width:600px){
  .vx-h1{font-size:22px!important;line-height:1.3!important}
  .vx-pad{padding:24px 20px!important}
  .vx-btn,.vx-btn a{display:block!important;text-align:center!important}
  .vx-kv td{display:block!important;width:100%!important;text-align:left!important;padding-top:2px!important}
  .vx-kv td:first-child{padding-top:12px!important}
}
@media (prefers-color-scheme:dark){${DARK}}
${DARK.trim()
  .split("\n")
  .map((rule) => `[data-ogsc] ${rule}`)
  .join("")}
${DARK.trim()
  .split("\n")
  .map((rule) => `.vx-dark ${rule}`)
  .join("")}
`;

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
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{STYLE}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body
        className="vx-bg"
        style={{ fontFamily: FONT, backgroundColor: "#f4f4f5", color: INK }}
      >
        <Container style={{ padding: "32px 12px", maxWidth: "600px" }}>
          {/* Outside the card, as a wordmark rather than an image: a
              logo that a client refuses to load is a broken email. */}
          <Text
            className="vx-ink"
            style={{
              margin: "0 0 18px",
              padding: "0 4px",
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: INK,
            }}
          >
            Verbaly
            <span className="vx-x" style={{ color: BRAND }}>
              x
            </span>
          </Text>

          <Section
            className="vx-card vx-pad"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e7e7e7",
              borderRadius: "12px",
              padding: "36px 36px 32px",
            }}
          >
            {children}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text
      className="vx-h1 vx-ink"
      style={{
        fontSize: "26px",
        fontWeight: 600,
        margin: "0 0 14px",
        lineHeight: 1.25,
        letterSpacing: "-0.01em",
        color: INK,
      }}
    >
      {children}
    </Text>
  );
}

export function EmailBody({
  muted = false,
  children,
}: {
  /** Secondary notes -- conditions, expiry, what to do if it was not you. */
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Text
      className={muted ? "vx-mut" : "vx-ink"}
      style={{
        fontSize: muted ? "14px" : "16px",
        lineHeight: 1.6,
        margin: "0 0 14px",
        color: muted ? MUTED : INK,
      }}
    >
      {children}
    </Text>
  );
}

/**
 * The date and the amount, at 26px on a tinted panel.
 *
 * This is the whole point of the billing emails. Put in a footnote it does
 * not get read, and the charge three days later arrives as a surprise --
 * which is what a chargeback is.
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
  const ink = { color: "#1b2a76" };
  return (
    <Section
      className="vx-blk"
      style={{
        backgroundColor: "#eef1fd",
        border: "1px solid #c6cef4",
        borderRadius: "12px",
        padding: "20px 24px",
        margin: "22px 0",
        textAlign: "center" as const,
      }}
    >
      <Text
        className="vx-blk-ink"
        style={{ margin: 0, fontSize: "14px", fontWeight: 500, ...ink }}
      >
        {label}
      </Text>
      <Text
        className="vx-blk-ink"
        style={{
          margin: "6px 0 0",
          fontSize: "26px",
          fontWeight: 600,
          lineHeight: 1.2,
          ...ink,
        }}
      >
        {date}
      </Text>
      <Text
        className="vx-blk-ink"
        style={{ margin: "4px 0 0", fontSize: "16px", ...ink }}
      >
        {amount}
      </Text>
    </Section>
  );
}

export interface DataRow {
  key: string;
  value: React.ReactNode;
  /** Renders the value as a link. Kept here so callers need no JSX. */
  href?: string;
  /** The one figure the email is about. Larger, and heavier. */
  lead?: boolean;
}

/**
 * The receipt.
 *
 * Every row is read off Stripe rather than computed here: an amount we
 * worked out ourselves that disagrees with the invoice is worse than no
 * receipt at all. On a phone the pairs stack instead of shrinking.
 */
export function DataRows({ rows }: { rows: DataRow[] }) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{ margin: "6px 0 20px", borderCollapse: "collapse" }}
    >
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="vx-kv">
            <td
              className="vx-mut vx-line"
              style={{
                padding: "11px 16px 11px 0",
                borderTop: `1px solid ${LINE}`,
                fontSize: "14px",
                lineHeight: 1.45,
                color: MUTED,
                verticalAlign: "top",
                width: "42%",
              }}
            >
              {row.key}
            </td>
            <td
              className="vx-ink vx-line"
              style={{
                padding: "11px 0",
                borderTop: `1px solid ${LINE}`,
                fontSize: row.lead ? "16px" : "15px",
                lineHeight: 1.45,
                color: INK,
                fontWeight: row.lead ? 600 : 500,
                textAlign: "right" as const,
                verticalAlign: "top",
              }}
            >
              {row.href ? (
                <Link
                  className="vx-link"
                  href={row.href}
                  style={{ color: BRAND, textDecoration: "underline" }}
                >
                  {row.value}
                </Link>
              ) : (
                row.value
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * The one button. There is never a second: two calls to action in an email
 * is a decision the reader has to make before they have read anything.
 */
export function EmailButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      className="vx-btn"
      style={{ margin: "24px 0 16px" }}
    >
      <tbody>
        <tr>
          {/* `bgcolor` is what Outlook actually paints. React's types do
              not carry the attribute, which is a gap in the types rather
              than in the HTML. */}
          <td
            {...({
              bgcolor: BRAND,
            } as React.TdHTMLAttributes<HTMLTableCellElement>)}
            style={{ borderRadius: "8px", background: BRAND }}
          >
            <a
              href={href}
              style={{
                display: "inline-block",
                padding: "14px 24px",
                fontSize: "16px",
                fontWeight: 600,
                lineHeight: 1.2,
                color: "#ffffff",
                textDecoration: "none",
                borderRadius: "8px",
              }}
            >
              {children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/**
 * The way out, in the body and never in the footer.
 *
 * A cancellation link buried under the legal lines is a cancellation link
 * nobody finds, and "cancel in two clicks" stops being true the moment it
 * takes a search to start.
 */
export function CancelLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      className="vx-link"
      href={href}
      style={{
        color: BRAND,
        textDecoration: "underline",
        fontWeight: 600,
      }}
    >
      {children}
    </Link>
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
export function EmailFooter({
  notice,
  company,
  privacyHref,
  privacyLabel,
}: {
  /** Why this particular email arrived. Different for each one. */
  notice: string;
  company: string;
  privacyHref: string;
  privacyLabel: string;
}) {
  const line = {
    fontSize: "13px",
    lineHeight: 1.55,
    color: MUTED,
  };
  const quiet = { color: MUTED, textDecoration: "underline" };
  return (
    <Section style={{ padding: "20px 4px 0" }}>
      <Text className="vx-mut" style={{ ...line, margin: "0 0 6px" }}>
        {notice}
      </Text>
      <Text className="vx-mut" style={{ ...line, margin: 0 }}>
        {company} ·{" "}
        <Link className="vx-link" href={privacyHref} style={quiet}>
          {privacyLabel}
        </Link>{" "}
        ·{" "}
        <Link className="vx-link" href="mailto:hola@verbalyx.ai" style={quiet}>
          hola@verbalyx.ai
        </Link>
      </Text>
    </Section>
  );
}
