import { products } from "@/data/catalog";
import { brand } from "@/data/brand";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Feed de catálogo para Meta Commerce Manager (Instagram Shopping / Facebook Shop).
 * En Commerce Manager → Catálogo → Fuentes de datos → "Feed programado" usa:
 *   https://<tu-dominio>/api/feed/meta
 * Cada SKU de la tienda se publica como producto etiquetable en Instagram con
 * los mismos nombres, precios y fotos, y enlaza a la ficha con UTMs de Instagram.
 */
function csv(v: string | number) {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function GET() {
  const base = siteUrl;
  const header = ["id", "item_group_id", "title", "description", "availability", "condition", "price", "sale_price", "link", "image_link", "brand", "google_product_category", "size", "custom_label_0", "custom_label_1"];
  const rows = [header.join(",")];
  for (const p of products) {
    for (const v of p.variants) {
      if (!v.active) continue;
      const link = `${base}/producto/${p.slug}?v=${v.sku}&utm_source=instagram&utm_medium=shopping&utm_campaign=catalogo&utm_content=${v.sku}`;
      const regular = v.compareAtPrice ?? v.price;
      rows.push(
        [
          v.sku,
          p.slug,
          `${p.name} ${v.size} · ${brand.name}`,
          `${p.tagline} ${p.description} Hecho artesanalmente, sin conservantes artificiales.`,
          v.stock === 0 ? "out of stock" : "in stock",
          "new",
          `${regular} COP`,
          v.compareAtPrice ? `${v.price} COP` : "",
          link,
          `${base}${v.image}`,
          brand.name,
          "Food, Beverages & Tobacco > Food Items > Condiments & Sauces",
          v.size,
          "artesanal",
          p.category,
        ]
          .map(csv)
          .join(","),
      );
    }
  }
  return new Response(rows.join("\n"), { headers: { "content-type": "text/csv; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
