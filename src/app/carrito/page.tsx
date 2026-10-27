"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart, toGaItem } from "@/components/CartProvider";
import { QtyStepper } from "@/components/QtyStepper";
import { formatCOP } from "@/lib/format";
import { ecommerce, track } from "@/lib/analytics";
import { shipping } from "@/data/catalog";
import { whatsappLink, whatsappOrderText } from "@/lib/omnichannel";
import { WhatsappIcon } from "@/components/Icons";

export default function CarritoPage() {
  const { items, subtotal, setQty, remove, ready } = useCart();
  const sent = useRef(false);

  useEffect(() => {
    if (ready && !sent.current && items.length) {
      sent.current = true;
      ecommerce("view_cart", items.map((i) => toGaItem(i, i.qty)));
    }
  }, [ready, items]);

  if (!ready) return <div className="min-h-[50vh]" />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="h-section">Tu carrito</h1>
      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-white/70 p-10 text-center">
          <p className="font-script text-3xl text-oliva">Aún no has agregado sabores</p>
          <Link href="/tienda" className="btn-primary mt-6 inline-block">Ir a la tienda</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
          <ul className="divide-y divide-cacao/10 rounded-2xl bg-white/70 px-5 ring-1 ring-cacao/5">
            {items.map((i) => (
              <li key={i.sku} className="flex items-center gap-4 py-5">
                <Image src={i.image} alt={i.name} width={88} height={88} className="h-[88px] w-[88px] rounded-lg object-cover" />
                <div className="flex-1">
                  <Link href={`/producto/${i.slug}?v=${i.sku}`} className="font-display text-xl font-bold">{i.name}</Link>
                  <p className="text-sm text-cacao/60">{i.size} · {formatCOP(i.unitPrice)} c/u · SKU {i.sku}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <QtyStepper value={i.qty} onChange={(q) => setQty(i.sku, q)} small />
                    <button className="text-xs underline" onClick={() => remove(i.sku)}>Quitar</button>
                  </div>
                </div>
                <p className="font-bold">{formatCOP(i.qty * i.unitPrice)}</p>
              </li>
            ))}
          </ul>
          <aside className="h-fit rounded-2xl bg-white/70 p-5 ring-1 ring-cacao/5">
            <div className="flex justify-between font-semibold"><span>Subtotal</span><span>{formatCOP(subtotal)}</span></div>
            <p className="mt-2 text-xs text-cacao/60">
              Envío nacional {formatCOP(shipping.flatRate)} · gratis desde {formatCOP(shipping.freeFrom)}
            </p>
            <Link href="/checkout" className="btn-primary mt-5 block text-center">Pagar con Wompi</Link>
            <a
              href={whatsappLink(whatsappOrderText(items, subtotal))}
              target="_blank"
              rel="noopener"
              onClick={() => track("click_whatsapp", { location: "cart", value: subtotal, currency: "COP" })}
              className="mt-3 flex items-center justify-center gap-2 rounded-full border border-[#25D366] px-4 py-3 text-sm font-semibold text-[#128C4A]"
            >
              <WhatsappIcon /> Enviar pedido por WhatsApp
            </a>
            <p className="mt-4 text-center text-xs text-cacao/60">PSE · Tarjetas · Nequi · Bancolombia</p>
          </aside>
        </div>
      )}
    </div>
  );
}
