import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/reseller/"],
    },
    sitemap: "https://ooustream.com/sitemap.xml",
  };
}
