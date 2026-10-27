"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { findVariant } from "@/data/catalog";
import { ecommerce, type GaItem } from "@/lib/analytics";

export interface CartItem {
  sku: string;
  qty: number;
}

export interface CartLine extends CartItem {
  slug: string;
  name: string;
  size: string;
  image: string;
  unitPrice: number;
  category: string;
}

interface CartCtx {
  items: CartLine[];
  count: number;
  subtotal: number;
  ready: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (sku: string, qty?: number, listName?: string) => void;
  setQty: (sku: string, qty: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "isariza.cart.v1";
const UTM_KEY = "isariza.utm.v1";

export function toGaItem(l: Pick<CartLine, "sku" | "name" | "size" | "unitPrice" | "category">, qty = 1): GaItem {
  return { item_id: l.sku, item_name: l.name, item_variant: l.size, item_category: l.category, price: l.unitPrice, quantity: qty };
}

function hydrate(raw: CartItem[]): CartLine[] {
  const out: CartLine[] = [];
  for (const it of raw) {
    const f = findVariant(it.sku);
    if (!f || !f.variant.active) continue;
    out.push({
      sku: it.sku,
      qty: Math.max(1, Math.min(24, Math.floor(it.qty))),
      slug: f.product.slug,
      name: f.product.name,
      size: f.variant.size,
      image: f.variant.image,
      unitPrice: f.variant.price,
      category: f.product.category,
    });
  }
  return out;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [raw, setRaw] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s) setRaw(JSON.parse(s));
    } catch {}
    // Guarda la atribución de la primera visita (ej. llegó desde Instagram)
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get("utm_source")) {
        const utm = {
          source: p.get("utm_source") ?? undefined,
          medium: p.get("utm_medium") ?? undefined,
          campaign: p.get("utm_campaign") ?? undefined,
          content: p.get("utm_content") ?? undefined,
        };
        localStorage.setItem(UTM_KEY, JSON.stringify(utm));
      } else if (!localStorage.getItem(UTM_KEY) && /instagram\.com/.test(document.referrer)) {
        localStorage.setItem(UTM_KEY, JSON.stringify({ source: "instagram", medium: "referral" }));
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(raw));
    } catch {}
  }, [raw, ready]);

  const items = useMemo(() => hydrate(raw), [raw]);

  const add = useCallback((sku: string, qty = 1, listName?: string) => {
    const f = findVariant(sku);
    if (!f) return;
    setRaw((prev) => {
      const ex = prev.find((p) => p.sku === sku);
      if (ex) return prev.map((p) => (p.sku === sku ? { ...p, qty: Math.min(24, p.qty + qty) } : p));
      return [...prev, { sku, qty }];
    });
    ecommerce("add_to_cart", [
      {
        ...toGaItem({ sku, name: f.product.name, size: f.variant.size, unitPrice: f.variant.price, category: f.product.category }, qty),
        ...(listName ? { item_list_name: listName } : {}),
      },
    ]);
    setOpen(true);
  }, []);

  const setQty = useCallback(
    (sku: string, qty: number) => {
      const line = items.find((i) => i.sku === sku);
      if (!line) return;
      const next = Math.max(0, Math.min(24, qty));
      const diff = next - line.qty;
      if (diff > 0) ecommerce("add_to_cart", [toGaItem(line, diff)]);
      if (diff < 0) ecommerce("remove_from_cart", [toGaItem(line, -diff)]);
      setRaw((prev) => (next === 0 ? prev.filter((p) => p.sku !== sku) : prev.map((p) => (p.sku === sku ? { ...p, qty: next } : p))));
    },
    [items],
  );

  const remove = useCallback((sku: string) => setQty(sku, 0), [setQty]);
  const clear = useCallback(() => setRaw([]), []);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      ready,
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
      count: items.reduce((a, i) => a + i.qty, 0),
      subtotal: items.reduce((a, i) => a + i.qty * i.unitPrice, 0),
    }),
    [items, ready, open, add, setQty, remove, clear],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return c;
}

export function getStoredAttribution() {
  try {
    return JSON.parse(localStorage.getItem(UTM_KEY) ?? "null") ?? undefined;
  } catch {
    return undefined;
  }
}
