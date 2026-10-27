"use client";

import { useCart } from "./CartProvider";

export function AddToCartButton({ sku, qty = 1, listName, label = "Agregar al carrito", className = "btn-primary" }: { sku: string; qty?: number; listName?: string; label?: string; className?: string }) {
  const { add } = useCart();
  return (
    <button className={className} onClick={() => add(sku, qty, listName)} data-testid={`add-${sku}`}>
      {label}
    </button>
  );
}
