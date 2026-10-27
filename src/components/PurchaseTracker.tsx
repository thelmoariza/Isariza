"use client";

import { useEffect } from "react";
import { ecommerce, type GaItem } from "@/lib/analytics";
import { useCart } from "./CartProvider";

/** Envía `purchase` a GA4 una sola vez por referencia y vacía el carrito. */
export function PurchaseTracker({ reference, value, shipping, items }: { reference: string; value: number; shipping: number; items: GaItem[] }) {
  const { clear, ready } = useCart();
  useEffect(() => {
    if (!ready) return;
    const key = `isariza.purchase.${reference}`;
    let already = false;
    try {
      already = localStorage.getItem(key) === "1";
    } catch {}
    if (!already) {
      ecommerce("purchase", items, { transaction_id: reference, shipping, value, tax: 0 });
      try {
        localStorage.setItem(key, "1");
      } catch {}
    }
    clear();
  }, [ready, reference, value, shipping, items, clear]);
  return null;
}
