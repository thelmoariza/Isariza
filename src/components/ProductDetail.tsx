"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Product } from "@/data/catalog";
import { brand } from "@/data/brand";
import { formatCOP } from "@/lib/format";
import { ecommerce, track } from "@/lib/analytics";
import { whatsappLink, whatsappProductText } from "@/lib/omnichannel";
import { useCart } from "./CartProvider";
import { QtyStepper } from "./QtyStepper";
import { HeatMeter } from "./HeatMeter";
import { ArtisanNote } from "./ArtisanNote";
import { WhatsappIcon, InstagramIcon } from "./Icons";

export function ProductDetail({ product: p, components }: { product: Product; components: { name: string; size: string; qty: number; slug: string }[] }) {
  const variants = p.variants.filter((v) => v.active);
  const search = useSearchParams();
  const initial = variants.find((v) => v.sku === search.get("v")) ?? variants[0];
  const [sku, setSku] = useState(initial.sku);
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const v = variants.find((x) => x.sku === sku) ?? variants[0];

  useEffect(() => {
    ecommerce("view_item", [{ item_id: v.sku, item_name: p.name, item_variant: v.size, item_category: p.category, price: v.price }]);
  }, [v.sku, v.size, v.price, p.name, p.category]);

  const soldOut = v.stock === 0;

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-crema-200 shadow-frasco">
          <Image src={v.image} alt={`${p.name} ${v.size} Isariza Sabores`} fill priority sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
          <span className="absolute left-4 top-4 rounded-full bg-crema/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-oliva-700">
            Hecho a mano · Lote pequeño
          </span>
        </div>
        {variants.length > 1 && (
          <div className="mt-3 flex gap-3">
            {variants.map((x) => (
              <button key={x.sku} onClick={() => setSku(x.sku)} className={`relative h-20 w-20 overflow-hidden rounded-xl ring-2 ${x.sku === v.sku ? "ring-aji" : "ring-transparent"}`} aria-label={`Ver ${x.size}`}>
                <Image src={x.image} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <nav className="text-xs text-cacao/60">
          <Link href="/tienda">Tienda</Link> / <span className="capitalize">{p.category}</span>
        </nav>
        <h1 className="mt-2 font-display text-5xl font-bold leading-tight text-cacao">{p.name}</h1>
        <p className="mt-2 font-script text-3xl leading-tight text-oliva-700">{p.tagline}</p>
        <div className="mt-3">
          <HeatMeter heat={p.heat} />
        </div>

        <div className="mt-6 flex items-baseline gap-3">
          <p className="text-4xl font-bold text-cacao" data-testid="pdp-price">{formatCOP(v.price)}</p>
          {v.compareAtPrice && <p className="text-lg text-cacao/50 line-through">{formatCOP(v.compareAtPrice)}</p>}
          <p className="text-sm text-cacao/60">IVA incluido</p>
        </div>

        {variants.length > 1 && (
          <fieldset className="mt-6">
            <legend className="label">Presentación</legend>
            <div className="flex gap-2">
              {variants.map((x) => (
                <button
                  key={x.sku}
                  onClick={() => setSku(x.sku)}
                  aria-pressed={x.sku === v.sku}
                  className={`rounded-xl border px-5 py-3 text-left ${x.sku === v.sku ? "border-cacao bg-cacao text-crema" : "border-cacao/25 bg-white hover:border-cacao"}`}
                >
                  <span className="block font-semibold">{x.size}</span>
                  <span className="text-xs opacity-80">{formatCOP(x.price)}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <QtyStepper value={qty} onChange={(q) => setQty(Math.max(1, Math.min(24, q)))} />
          <button disabled={soldOut} onClick={() => add(v.sku, qty, "Ficha de producto")} className="btn-primary flex-1" data-testid="pdp-add">
            {soldOut ? "Agotado · nuevo lote pronto" : "Agregar al carrito"}
          </button>
        </div>
        <a
          href={whatsappLink(whatsappProductText(p.name, v.size))}
          target="_blank"
          rel="noopener"
          onClick={() => track("click_whatsapp", { location: "pdp", item_id: v.sku })}
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-oliva-700 underline"
        >
          <WhatsappIcon /> ¿Prefieres pedir por WhatsApp?
        </a>

        <p className="mt-8 text-cacao/85">{p.description}</p>

        {components.length > 0 && (
          <div className="mt-6">
            <p className="label">Incluye</p>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {components.map((c) => (
                <li key={c.slug} className="rounded-lg bg-white/70 px-3 py-2 ring-1 ring-cacao/10">
                  {c.qty} × <Link href={`/producto/${c.slug}`} className="underline">{c.name}</Link> {c.size}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <ArtisanNote />
        </div>

        <dl className="mt-6 divide-y divide-cacao/10 rounded-xl bg-white/60 text-sm ring-1 ring-cacao/10">
          <div className="grid grid-cols-3 gap-2 p-3"><dt className="font-semibold">Ideal con</dt><dd className="col-span-2">{p.pairings.join(" · ")}</dd></div>
          <div className="grid grid-cols-3 gap-2 p-3"><dt className="font-semibold">Ingredientes</dt><dd className="col-span-2">{p.ingredients}</dd></div>
          <div className="grid grid-cols-3 gap-2 p-3"><dt className="font-semibold">Vida útil</dt><dd className="col-span-2">{p.shelfLife}</dd></div>
          <div className="grid grid-cols-3 gap-2 p-3"><dt className="font-semibold">Conservación</dt><dd className="col-span-2">{p.storage}</dd></div>
        </dl>

        <p className="mt-6 flex items-center gap-2 text-sm text-cacao/70">
          <InstagramIcon /> Mira recetas con este producto en{" "}
          <a href={brand.contact.instagramUrl} target="_blank" rel="noopener" className="font-semibold underline" data-ga="click_instagram" data-ga-location="pdp">
            @{brand.contact.instagramHandle}
          </a>
        </p>
      </div>
    </div>
  );
}
