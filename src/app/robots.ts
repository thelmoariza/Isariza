export const dynamic = "force-dynamic";
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl;
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/checkout", "/pedido"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
