import Link from "next/link";

import { ToolTabs } from "@/components/navigation/tool-tabs";
import { Button } from "@/components/ui/button";
import { TOOLS } from "@/lib/ai/tools";

// Footer groups are SEO infrastructure, not decoration: every entry must
// resolve to a page that exists. Tools that are not live yet are listed
// without a link rather than pointing at a 404.
const FOOTER_GROUPS = [
  {
    title: "Herramientas",
    links: Object.values(TOOLS).map((tool) => ({
      href: tool.landing ? tool.path : null,
      label: tool.name,
    })),
  },
  {
    title: "Producto",
    links: [
      { href: "/precios", label: "Precios" },
      { href: "/login", label: "Crear cuenta gratis" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/aviso-legal", label: "Aviso legal" },
      { href: "/legal/terminos", label: "Términos" },
      { href: "/legal/privacidad", label: "Privacidad" },
      { href: "/legal/cookies", label: "Cookies" },
    ],
  },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="bg-background/90 sticky top-0 z-20 border-b backdrop-blur">
        <div className="mx-auto max-w-[65rem] px-6">
          <div className="flex h-14 items-center gap-6">
            <Link href="/" className="text-base font-bold tracking-tight">
              Verbaly<span className="text-brand">x</span>
            </Link>
            <nav className="text-muted-foreground hidden gap-5 text-sm sm:flex">
              <Link href="/precios" className="hover:text-foreground">
                Precios
              </Link>
            </nav>
            <span className="ml-auto flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/login">Crear cuenta gratis</Link>
              </Button>
            </span>
          </div>
          <ToolTabs />
        </div>
      </header>

      {children}

      <footer className="bg-muted mt-16 border-t">
        <div className="mx-auto max-w-[65rem] px-6 py-10">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
                  {group.title}
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {group.links.map(({ href, label }) =>
                    href ? (
                      <Link
                        key={label}
                        href={href}
                        className="text-muted-foreground hover:text-foreground text-sm"
                      >
                        {label}
                      </Link>
                    ) : (
                      <span
                        key={label}
                        className="text-muted-foreground/60 text-sm"
                      >
                        {label} · muy pronto
                      </span>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="text-muted-foreground mt-10 flex flex-wrap gap-4 border-t pt-6 text-xs">
            <span>© {new Date().getFullYear()} Verbalyx</span>
            <span>Español de España y LATAM</span>
            <span className="sm:ml-auto">
              No guardamos los textos de los planes gratuitos.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
