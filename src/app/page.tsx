import Image from "next/image";
import Link from "next/link";
import { brand } from "@/data/brand";
import { activeProducts, getProduct, products } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";
import { ValueIcon, InstagramIcon } from "@/components/Icons";
import { TrackView } from "@/components/TrackView";
import { formatCOP } from "@/lib/format";
import { AddToCartButton } from "@/components/AddToCartButton";

export default function Home() {
  const singles = activeProducts().filter((p) => p.kind === "single");
  const box = getProduct("caja-especial")!;
  const boxV = box.variants[0];
  const listItems = singles.map((p, i) => ({
    item_id: p.variants[0].sku,
    item_name: p.name,
    item_variant: p.variants[0].size,
    item_category: p.category,
    price: p.variants[0].price,
    index: i,
  }));

  return (
    <>
      <TrackView event="view_item_list" items={listItems} extra={{ item_list_id: "home_destacados", item_list_name: "Home destacados" }} />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-12 pt-10 md:grid-cols-2 md:pt-16">
          <div>
            <p className="eyebrow">{brand.promise}</p>
            <h1 className="mt-3 font-display text-5xl font-bold leading-[1.05] text-cacao md:text-6xl">
              Encurtidos, salsas y sabores <span className="font-script font-bold text-aji">que realzan</span> tus momentos
            </h1>
            <p className="mt-5 max-w-md text-lg text-cacao/80">
              Preparados a mano en lotes pequeños, con ingredientes naturales y sin conservantes artificiales.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/tienda" className="btn-primary">
                Comprar ahora
              </Link>
              <Link href="/producto/caja-especial" className="btn-secondary">
                Ver Caja Especial
              </Link>
            </div>
            <ul className="mt-10 grid grid-cols-3 gap-3">
              {brand.values.map((v) => (
                <li key={v.title} className="flex flex-col items-start gap-2 text-xs font-semibold uppercase tracking-wide text-cacao/80">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-cacao/30">
                    <ValueIcon name={v.icon} className="h-5 w-5" />
                  </span>
                  {v.title}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              {singles.map((p, i) => (
                <div key={p.slug} className={`relative aspect-[4/5] overflow-hidden rounded-2xl shadow-frasco ${i % 2 ? "translate-y-6" : ""}`}>
                  <Image src={p.variants[0].image} alt={`${p.name} Isariza`} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover" priority={i < 2} />
                </div>
              ))}
            </div>
            <p className="absolute -bottom-4 left-1/2 -translate-x-1/2 -rotate-2 whitespace-nowrap rounded-full bg-crema px-5 py-1 font-script text-2xl text-oliva shadow">
              {brand.closing}
            </p>
          </div>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="mx-auto max-w-6xl px-4 py-16" id="productos">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Nuestros sabores</p>
            <h2 className="h-section">Cuatro recetas, dos tamaños</h2>
            <p className="mt-2 text-cacao/70">Elige 250 gr para la alacena o 110 gr para probar todos.</p>
          </div>
          <Link href="/tienda" className="text-sm font-semibold underline">
            Ver toda la tienda →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {singles.map((p, i) => (
            <ProductCard key={p.slug} product={p} listName="Home destacados" index={i} />
          ))}
        </div>
      </section>

      {/* CAJA ESPECIAL */}
      <section className="bg-kraft-300/40">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-frasco">
            <Image src={boxV.image} alt="Caja Especial Isariza con 4 frascos de 110 gr" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <span className="brush">Caja Especial</span>
            <h2 className="mt-5 font-display text-4xl font-bold text-cacao">4 frascos de 110 gr cada uno</h2>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-cacao/70">
              Cebolla y Ají · Pepinos · Ají Picante · Chimichurri
            </p>
            <p className="mt-4 font-script text-3xl text-oliva-700">{brand.giftLine}</p>
            <div className="mt-6 flex items-center gap-4">
              <p className="text-3xl font-bold text-cacao">{formatCOP(boxV.price)}</p>
              {boxV.compareAtPrice && (
                <p className="text-cacao/50">
                  <span className="line-through">{formatCOP(boxV.compareAtPrice)}</span> por separado
                </p>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <AddToCartButton sku={boxV.sku} listName="Home caja especial" label="Agregar la caja" />
              <Link href="/producto/caja-especial" className="btn-secondary">
                Detalles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ARTESANAL */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Hecho artesanalmente</p>
          <h2 className="h-section mt-2">Lo que hay detrás de cada frasco</h2>
          <p className="mt-4 text-lg text-cacao/80">{brand.artisanStatement}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {brand.values.map((v) => (
            <div key={v.title} className="rounded-2xl bg-white/70 p-6 text-center ring-1 ring-cacao/5">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-oliva-100 text-oliva-700">
                <ValueIcon name={v.icon} className="h-7 w-7" />
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold">{v.title}</h3>
              <p className="mt-2 text-sm text-cacao/70">{v.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center">
          <Link href="/nosotros" className="font-semibold underline">
            Conoce nuestro proceso →
          </Link>
        </p>
      </section>

      {/* INSTAGRAM */}
      <section id="instagram" className="bg-oliva text-crema">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.3em] text-crema/70">Comunidad</p>
            <h2 className="mt-2 font-display text-4xl font-bold">Síguenos en @{brand.contact.instagramHandle}</h2>
            <p className="mt-4 text-crema/80">
              Recetas, maridajes, nuevos lotes y lanzamientos primero en Instagram. Comparte tu plato con{" "}
              <b>{brand.hashtag}</b> y etiquétanos.
            </p>
            <a
              href={brand.contact.instagramUrl}
              target="_blank"
              rel="noopener"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-crema px-6 py-3 font-semibold text-oliva-700"
              data-ga="click_instagram"
            >
              <InstagramIcon /> Seguir en Instagram
            </a>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {products.flatMap((p) => p.variants).slice(0, 9).map((v, i) => (
              <a key={v.sku} href={brand.contact.instagramUrl} target="_blank" rel="noopener" className="relative aspect-square overflow-hidden rounded-lg">
                <Image src={v.image} alt="Publicación de Instagram de Isariza Sabores" fill sizes="20vw" className="object-cover transition hover:scale-105" />
                {i === 4 && (
                  <span className="absolute inset-0 grid place-items-center bg-cacao/50 font-script text-3xl">@{brand.contact.instagramHandle}</span>
                )}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
