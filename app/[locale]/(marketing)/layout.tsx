import { getLocale, getTranslations } from "next-intl/server";

import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { HeaderAuth } from "@/components/marketing/header-auth";
import { ToolTabs } from "@/components/navigation/tool-tabs";
import { TOOLS } from "@/lib/ai/tools";
import { Link } from "@/lib/i18n/navigation";
import { LEGAL_DOCS, LEGAL_SLUGS } from "@/lib/i18n/legal";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations();
  const locale = await getLocale();

  // Footer groups are SEO infrastructure, not decoration: every entry must
  // resolve to a page that exists in this language. Tools that are not live
  // yet are listed without a link rather than pointing at a 404.
  const groups = [
    {
      title: t("footer.tools"),
      links: Object.values(TOOLS).map((tool) => ({
        href: tool.landing ? tool.path : null,
        label: t(`tools.${tool.id}.name`),
      })),
    },
    {
      title: t("footer.product"),
      links: [
        { href: "/pricing" as const, label: t("nav.pricing") },
        { href: "/signup" as const, label: t("nav.signup") },
      ],
    },
    {
      title: t("footer.legal"),
      // The slug is localised, not the route: see lib/i18n/legal.ts.
      links: LEGAL_DOCS.map((doc) => ({
        href: {
          pathname: "/legal/[slug]" as const,
          params: { slug: LEGAL_SLUGS[locale][doc] },
        },
        label: t(`footer.${doc}`),
      })),
    },
  ];

  return (
    <>
      <header className="bg-background/90 sticky top-0 z-20 border-b backdrop-blur">
        <div className="mx-auto max-w-[65rem] px-6">
          <div className="flex h-14 items-center gap-6">
            <Link href="/" className="text-base font-bold tracking-tight">
              Verbaly<span className="text-brand">x</span>
            </Link>
            <nav className="text-muted-foreground hidden gap-5 text-sm sm:flex">
              <Link href="/pricing" className="hover:text-foreground">
                {t("nav.pricing")}
              </Link>
            </nav>
            <span className="ml-auto flex items-center gap-2">
              <LanguageSwitcher />
              <HeaderAuth />
            </span>
          </div>
          <ToolTabs />
        </div>
      </header>

      {children}

      <footer className="bg-muted mt-16 border-t">
        <div className="mx-auto max-w-[65rem] px-6 py-10">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {groups.map((group) => (
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
                        {label} · {t("footer.soon")}
                      </span>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="text-muted-foreground mt-10 flex flex-wrap gap-4 border-t pt-6 text-xs">
            <span>
              {t("footer.rights", { year: new Date().getFullYear() })}
            </span>
            <span>{t("footer.market")}</span>
            <span className="sm:ml-auto">{t("footer.privacyNote")}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
