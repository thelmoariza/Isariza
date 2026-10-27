"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart, toGaItem } from "./CartProvider";
import { CloseIcon } from "./Icons";
import { formatCOP } from "@/lib/format";
import { ecommerce } from "@/lib/analytics";
import { shipping } from "@/data/catalog";
import { QtyStepper } from "./QtyStepper";

export function CartDrawer() {
  const { open, setOpen, items, subtotal, setQty, remove } = useCart();
  const missing = Math.max(0, shipping.freeFrom - subtotal);

  useEffect(() => {
    if (open && items.length) ecommerce("view_cart", items.map((i) => toGaItem(i, i.qty)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-cacao/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
      <aside
        role="dialog"
        aria-label="Carrito de compras"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-crema-50 shadow-2xl transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-cacao/10 px-5 py-4">
          <h2 className="font-display text-2xl font-bold text-cacao">Tu canasta</h2>
          <button onClick={() => setOpen(false)} aria-label="Cerrar carrito">
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="grid flex-1 place-items-center p-8 text-center">
            <div>
              <p className="font-script text-3xl text-oliva">Tu canasta está vacía</p>
              <p className="mt-2 text-sm text-cacao/70">Descubre nuestros sabores hechos a mano.</p>
              <Link href="/tienda" onClick={() => setOpen(false)} className="btn-primary mt-6 inline-block">
                Ir a la tienda
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-cacao/10 bg-oliva-100 px-5 py-2 text-xs text-oliva-700">
              {missing > 0 ? (
                <>Te faltan <b>{formatCOP(missing)}</b> para el envío gratis.</>
              ) : (
                <>¡Tu pedido tiene <b>envío gratis</b>!</>
              )}
            </div>
            <ul className="flex-1 divide-y divide-cacao/10 overflow-y-auto px-5">
              {items.map((i) => (
                <li key={i.sku} className="flex gap-3 py-4">
                  <Image src={i.image} alt={`${i.name} ${i.size}`} width={72} height={72} className="h-[72px] w-[72px] rounded-md object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold text-cacao">{i.name}</p>
                    <p className="text-xs text-cacao/60">{i.size} · {formatCOP(i.unitPrice)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <QtyStepper value={i.qty} onChange={(q) => setQty(i.sku, q)} small />
                      <button onClick={() => remove(i.sku)} className="text-xs text-cacao/60 underline">
                        Quitar
                      </button>
                    </div>
                  </div>
                  <p className="font-semibold text-cacao">{formatCOP(i.qty * i.unitPrice)}</p>
                </li>
              ))}
            </ul>
            <div className="border-t border-cacao/10 p-5">
              <div className="flex justify-between text-lg font-bold text-cacao">
                <span>Subtotal</span>
                <span data-testid="cart-subtotal">{formatCOP(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-cacao/60">El envío se calcula en el checkout.</p>
              <Link href="/checkout" onClick={() => setOpen(false)} className="btn-primary mt-4 block text-center" data-testid="go-checkout">
                Finalizar compra
              </Link>
              <Link href="/carrito" onClick={() => setOpen(false)} className="mt-2 block text-center text-sm text-cacao underline">
                Ver carrito
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
