import type { MetadataRoute } from "next";

import { runtimeConfig } from "@/config/runtime";

export default function robots(): MetadataRoute.Robots {
  const base = runtimeConfig.siteUrl.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/member", "/member/", "/login", "/signup", "/forgot-password", "/reset-password"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
