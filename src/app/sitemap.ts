export const dynamic = "force-dynamic";
import type { MetadataRoute } from "next";
import { activeProducts } from "@/data/catalog";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl;
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, priority: 1 },
    { url: `${base}/tienda`, lastModified: now, priority: 0.9 },
    { url: `${base}/nosotros`, lastModified: now, priority: 0.5 },
    { url: `${base}/politicas`, lastModified: now, priority: 0.3 },
    ...activeProducts().map((p) => ({ url: `${base}/producto/${p.slug}`, lastModified: now, priority: 0.8 })),
  ];
}
