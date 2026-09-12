import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/precios", label: "Precios" },
  { href: "/legal/aviso-legal", label: "Aviso legal" },
  { href: "/legal/terminos", label: "Términos" },
  { href: "/legal/privacidad", label: "Privacidad" },
  { href: "/legal/cookies", label: "Cookies" },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <footer className="text-muted-foreground mx-auto flex max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-10 text-xs">
        <span>© {new Date().getFullYear()} Verbalyx</span>
        {FOOTER_LINKS.map(({ href, label }) => (
          <Link key={href} href={href} className="hover:underline">
            {label}
          </Link>
        ))}
      </footer>
    </>
  );
}
