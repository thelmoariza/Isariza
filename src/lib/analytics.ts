"use client";

/**
 * Tagging GA4 — eventos de ecommerce recomendados por Google:
 * https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
 *
 * view_item_list · select_item · view_item · add_to_cart · remove_from_cart ·
 * view_cart · begin_checkout · add_shipping_info · add_payment_info · purchase
 * + eventos propios de omnicanalidad: click_instagram, click_whatsapp, share.
 */

import { brand } from "@/data/brand";

export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export interface GaItem {
  item_id: string; // SKU
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity?: number;
  index?: number;
  item_list_name?: string;
}

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") console.debug("[ga4]", event, params);
  window.gtag?.("event", event, params);
}

export function ecommerce(event: string, items: GaItem[], extra: Record<string, unknown> = {}) {
  const value = items.reduce((a, i) => a + i.price * (i.quantity ?? 1), 0);
  track(event, {
    currency: brand.currency,
    value,
    items: items.map((i) => ({ item_brand: brand.name, ...i })),
    ...extra,
  });
}

/** Obtiene el client_id de GA4 para atar el pedido (Measurement Protocol / BI). */
export function getGaClientId(): Promise<string | undefined> {
  return new Promise((resolve) => {
    if (!GA_ID || !window.gtag) return resolve(undefined);
    const t = setTimeout(() => resolve(undefined), 800);
    window.gtag("get", GA_ID, "client_id", (id: string) => {
      clearTimeout(t);
      resolve(id);
    });
  });
}
