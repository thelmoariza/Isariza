import { findVariant, shipping } from "@/data/catalog";

export interface CartLineInput {
  sku: string;
  qty: number;
}

export interface PricedLine {
  sku: string;
  slug: string;
  name: string;
  size: string;
  image: string;
  unitPrice: number;
  qty: number;
  total: number;
}

export interface Quote {
  lines: PricedLine[];
  subtotal: number;
  shipping: number;
  total: number;
  errors: string[];
}

export const MAX_QTY_PER_LINE = 24;

function normalizeCity(c: string) {
  return c
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

export function shippingFor(subtotal: number, city?: string) {
  if (subtotal === 0) return 0;
  if (subtotal >= shipping.freeFrom) return 0;
  if (city && normalizeCity(city) === normalizeCity(shipping.originCity)) return shipping.localRate;
  return shipping.flatRate;
}

/**
 * Calcula el pedido SIEMPRE desde el catálogo del servidor. Nunca confiar en
 * precios enviados por el navegador.
 */
export function quote(items: CartLineInput[], city?: string): Quote {
  const errors: string[] = [];
  const merged = new Map<string, number>();
  for (const it of items) {
    const qty = Math.floor(Number(it.qty));
    if (!Number.isFinite(qty) || qty <= 0) continue;
    merged.set(it.sku, Math.min(MAX_QTY_PER_LINE, (merged.get(it.sku) ?? 0) + qty));
  }

  const lines: PricedLine[] = [];
  for (const [sku, qty] of merged) {
    const found = findVariant(sku);
    if (!found || !found.variant.active) {
      errors.push(`El producto ${sku} ya no está disponible.`);
      continue;
    }
    const { product, variant } = found;
    if (variant.stock !== null && variant.stock < qty) {
      errors.push(`Solo quedan ${variant.stock} unidades de ${product.name} ${variant.size}.`);
      continue;
    }
    lines.push({
      sku,
      slug: product.slug,
      name: product.name,
      size: variant.size,
      image: variant.image,
      unitPrice: variant.price,
      qty,
      total: variant.price * qty,
    });
  }
  const subtotal = lines.reduce((a, l) => a + l.total, 0);
  const ship = shippingFor(subtotal, city);
  return { lines, subtotal, shipping: ship, total: subtotal + ship, errors };
}
