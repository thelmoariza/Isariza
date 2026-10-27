import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { brand } from "@/data/brand";
import { ValueIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Hecho a mano",
  description: "Así preparamos cada frasco de Isariza Sabores: ingredientes naturales, lotes pequeños y sin conservantes artificiales.",
};

const steps = [
  { n: "01", t: "Seleccionamos", d: "Compramos vegetales frescos y especias enteras en pequeñas cantidades, para cada lote." },
  { n: "02", t: "Cortamos a mano", d: "Cebolla en julianas, pepinos en rodajas, hierbas picadas a cuchillo. Sin procesos industriales." },
  { n: "03", t: "Encurtimos y maceramos", d: "Vinagre, sal y especias hacen el trabajo, con el tiempo que cada receta necesita." },
  { n: "04", t: "Envasamos al vacío", d: "Frasco por frasco, etiquetado y con número de lote, listo para tu mesa." },
];

export default function Nosotros() {
  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
        <div>
          <p className="eyebrow">Nuestra historia</p>
          <h1 className="h-section mt-2">{brand.closing}</h1>
          <p className="mt-5 text-lg text-cacao/80">
            Isariza nace en una cocina familiar, con recetas que se compartían en cada asado y cada almuerzo de domingo.
            Hoy las preparamos igual: a mano, en lotes pequeños y con ingredientes que puedes reconocer.
          </p>
          <p className="mt-4 text-cacao/80">{brand.artisanStatement}</p>
          {/* TODO: reemplazar con la historia real de la marca */}
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-full bg-crema-200 shadow-frasco">
          <Image src="/img/products/logo.jpg" alt="Logo Isariza Sabores" fill sizes="400px" className="object-cover" />
        </div>
      </section>

      <section className="bg-white/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="h-section text-center">Nuestro proceso artesanal</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-4">
            {steps.map((s) => (
              <li key={s.n} className="rounded-2xl bg-crema p-6 ring-1 ring-cacao/5">
                <span className="font-script text-4xl text-aji">{s.n}</span>
                <h3 className="mt-2 font-display text-2xl font-bold">{s.t}</h3>
                <p className="mt-2 text-sm text-cacao/75">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {brand.values.map((v) => (
            <div key={v.title} className="text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-cacao/30">
                <ValueIcon name={v.icon} className="h-7 w-7" />
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold">{v.title}</h3>
              <p className="mt-1 text-sm text-cacao/70">{v.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-dashed border-oliva/50 p-6 text-center">
          <p className="font-script text-3xl text-oliva-700">¿Por qué un frasco no es idéntico a otro?</p>
          <p className="mx-auto mt-2 max-w-2xl text-cacao/80">
            Porque cada lote se prepara a mano. El color de la cebolla, el tamaño del corte o la intensidad del ají pueden variar
            ligeramente según la cosecha. Es una característica de lo artesanal, no un defecto.
          </p>
          <Link href="/tienda" className="btn-primary mt-6 inline-block">Probar nuestros sabores</Link>
        </div>
      </section>
    </div>
  );
}
