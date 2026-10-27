import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { activeProducts, findVariant, getProduct } from "@/data/catalog";
import { brand } from "@/data/brand";
import { ProductDetail } from "@/components/ProductDetail";
import { ProductCard } from "@/components/ProductCard";
import { siteUrl } from "@/lib/site";

export function generateStaticParams() {
  return activeProducts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getProduct(params.slug);
  if (!p) return {};
  return {
    title: `${p.name} artesanal`,
    description: `${p.tagline} ${p.description}`.slice(0, 160),
    openGraph: { images: [{ url: p.variants[0].image, alt: p.name }] },
    alternates: { canonical: `/producto/${p.slug}` },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const p = getProduct(params.slug);
  if (!p || !p.variants.some((v) => v.active)) notFound();
  const site = siteUrl;

  const components = (p.components ?? []).map((c) => {
    const f = findVariant(c.sku);
    return f ? { name: f.product.name, size: f.variant.size, qty: c.qty, slug: f.product.slug } : null;
  }).filter(Boolean) as { name: string; size: string; qty: number; slug: string }[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    name: p.name,
    description: p.description,
    brand: { "@type": "Brand", name: brand.name },
    productGroupID: p.slug,
    variesBy: ["https://schema.org/size"],
    hasVariant: p.variants.filter((v) => v.active).map((v) => ({
      "@type": "Product",
      sku: v.sku,
      name: `${p.name} ${v.size}`,
      size: v.size,
      image: `${site}${v.image}`,
      offers: {
        "@type": "Offer",
        url: `${site}/producto/${p.slug}?v=${v.sku}`,
        priceCurrency: "COP",
        price: v.price,
        availability: v.stock === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
      },
    })),
  };

  const related = activeProducts().filter((x) => x.slug !== p.slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Suspense fallback={<div className="h-[600px]" />}>
        <ProductDetail product={p} components={components} />
      </Suspense>

      <section className="mt-20">
        <h2 className="font-display text-3xl font-bold">También te puede gustar</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {related.map((r, i) => (
            <ProductCard key={r.slug} product={r} listName="Relacionados" index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
