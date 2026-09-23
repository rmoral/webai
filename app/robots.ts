import type { MetadataRoute } from "next";

import { SITE_ORIGIN } from "@/lib/i18n/routing";

export default function robots(): MetadataRoute.Robots {
  const base = SITE_ORIGIN;

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
        "/registro",
        "/en/signup",
        "/login",
        "/en/login",
      ],
    },
    sitemap: new URL("/sitemap.xml", base).toString(),
  };
}
