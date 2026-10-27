import { brand } from "@/data/brand";
import { formatCOP } from "./format";
import { siteUrl } from "@/lib/site";

/**
 * Utilidades de omnicanalidad tienda ↔ Instagram ↔ WhatsApp.
 *
 * Convención de UTMs para TODO enlace publicado en Instagram (ver docs/OMNICANALIDAD.md):
 *   utm_source=instagram
 *   utm_medium=bio | story | post | reel | dm | shopping
 *   utm_campaign=<campaña>   (ej: caja-especial-navidad)
 *   utm_content=<pieza>      (ej: reel-chimichurri-01)
 */
export function instagramLink(pathname: string, medium: "bio" | "story" | "post" | "reel" | "dm" | "shopping", campaign: string, content?: string) {
  const base = siteUrl;
  const u = new URL(pathname, base);
  u.searchParams.set("utm_source", "instagram");
  u.searchParams.set("utm_medium", medium);
  u.searchParams.set("utm_campaign", campaign);
  if (content) u.searchParams.set("utm_content", content);
  return u.toString();
}

export function whatsappLink(text: string) {
  return `https://wa.me/${brand.contact.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function whatsappOrderText(lines: { name: string; size: string; qty: number; unitPrice: number }[], total: number) {
  const items = lines.map((l) => `• ${l.qty} × ${l.name} ${l.size} (${formatCOP(l.unitPrice)})`).join("\n");
  return `¡Hola ${brand.name}! 👋 Quiero hacer este pedido:\n\n${items}\n\nTotal productos: ${formatCOP(total)}\n\nVengo de la tienda en línea.`;
}

export function whatsappProductText(name: string, size: string) {
  return `¡Hola ${brand.name}! Me interesa el ${name} de ${size}. ¿Me ayudas con mi pedido?`;
}
