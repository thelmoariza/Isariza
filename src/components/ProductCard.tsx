"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/data/catalog";
import { formatCOP } from "@/lib/format";
import { useCart } from "./CartProvider";
import { HeatMeter } from "./HeatMeter";
import { track } from "@/lib/analytics";

export function ProductCard({ product, listName, index }: { product: Product; listName: string; index: number }) {
  const variants = product.variants.filter((v) => v.active);
  const [sku, setSku] = useState(variants[0]?.sku);
  const v = variants.find((x) => x.sku === sku) ?? variants[0];
  const { add } = useCart();
  if (!v) return null;

  const onSelect = () =>
    track("select_item", {
      item_list_name: listName,
      items: [{ item_id: v.sku, item_name: product.name, item_variant: v.size, price: v.price, index }],
    });

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white/70 shadow-frasco ring-1 ring-cacao/5" data-testid={`card-${product.slug}`}>
      <Link href={`/producto/${product.slug}?v=${v.sku}`} onClick={onSelect} className="relative block aspect-square overflow-hidden bg-crema-200">
        <Image
          src={v.image}
          alt={`${product.name} ${v.size} — Isariza Sabores, hecho artesanalmente`}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {product.badges?.map((b) => (
          <span key={b} className="absolute left-3 top-3 rounded-full bg-aji px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            {b}
          </span>
        ))}
        <span className="absolute bottom-3 left-3 rounded-full bg-crema/90 px-2.5 py-1 text-[11px] font-semibold text-oliva-700">Hecho a mano</span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-2xl font-bold leading-tight text-cacao">
          <Link href={`/producto/${product.slug}?v=${v.sku}`} onClick={onSelect}>
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-cacao/70">{product.tagline}</p>
        <div className="mt-2">
          <HeatMeter heat={product.heat} />
        </div>

        {variants.length > 1 && (
          <div className="mt-3 flex gap-2" role="radiogroup" aria-label="Presentación">
            {variants.map((x) => (
              <button
                key={x.sku}
                role="radio"
                aria-checked={x.sku === v.sku}
                onClick={() => setSku(x.sku)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  x.sku === v.sku ? "border-cacao bg-cacao text-crema" : "border-cacao/25 text-cacao hover:border-cacao"
                }`}
              >
                {x.size}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            {v.compareAtPrice && <p className="text-xs text-cacao/50 line-through">{formatCOP(v.compareAtPrice)}</p>}
            <p className="text-xl font-bold text-cacao">{formatCOP(v.price)}</p>
            {variants.length === 1 && <p className="text-xs text-cacao/60">{v.size}</p>}
          </div>
          <button onClick={() => add(v.sku, 1, listName)} className="btn-primary px-4 py-2 text-sm" data-testid={`add-${v.sku}`}>
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
