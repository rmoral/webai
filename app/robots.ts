import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://verbalyx.ai";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The signed-in area, the admin panel and the auth hand-off have
      // nothing to index and would leak query parameters into search
      // results. The legal pages carry their own noindex.
      disallow: [
        "/api/",
        "/app",
        "/en/app",
        "/admin",
        "/en/admin",
        "/auth/",
        "/pago",
        "/en/checkout",
      ],
    },
    sitemap: new URL("/sitemap.xml", base).toString(),
  };
}
