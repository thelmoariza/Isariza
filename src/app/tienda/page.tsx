import type { Metadata } from "next";
import Link from "next/link";
import { activeProducts, categories, type Category } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";
import { TrackView } from "@/components/TrackView";
import { ArtisanNote } from "@/components/ArtisanNote";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Compra en línea chimichurri, ají picante, pepinos encurtidos, cebolla y ají encurtidos y la Caja Especial de Isariza Sabores. Hechos a mano.",
};

export default function Tienda({ searchParams }: { searchParams: { c?: string } }) {
  const c = categories.find((x) => x.id === searchParams.c)?.id as Category | undefined;
  const list = activeProducts().filter((p) => !c || p.category === c);
  const listName = c ? `Tienda ${c}` : "Tienda todos";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <TrackView
        event="view_item_list"
        items={list.map((p, i) => ({ item_id: p.variants[0].sku, item_name: p.name, item_variant: p.variants[0].size, item_category: p.category, price: p.variants[0].price, index: i }))}
        extra={{ item_list_name: listName }}
      />
      <p className="eyebrow">Tienda</p>
      <h1 className="h-section">Sabores hechos a mano</h1>
      <div className="mt-6 max-w-2xl">
        <ArtisanNote compact />
      </div>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Categorías">
        <Link href="/tienda" className={`rounded-full px-4 py-2 text-sm font-semibold ${!c ? "bg-cacao text-crema" : "bg-white/70 text-cacao ring-1 ring-cacao/10"}`}>
          Todos
        </Link>
        {categories.map((x) => (
          <Link
            key={x.id}
            href={`/tienda?c=${x.id}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${c === x.id ? "bg-cacao text-crema" : "bg-white/70 text-cacao ring-1 ring-cacao/10"}`}
          >
            {x.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p, i) => (
          <ProductCard key={p.slug} product={p} listName={listName} index={i} />
        ))}
      </div>
    </div>
  );
}
