import Link from "next/link";
import { brand } from "@/data/brand";
import { InstagramIcon, WhatsappIcon } from "./Icons";
import { whatsappLink } from "@/lib/omnichannel";

export function Footer() {
  return (
    <footer className="mt-24 bg-cacao text-crema">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-4xl font-bold">ISARIZA</p>
          <p className="text-xs uppercase tracking-[.3em] text-crema/70">Sabores · {brand.promise}</p>
          <p className="mt-4 max-w-sm font-script text-2xl text-kraft-300">{brand.closing}</p>
          <p className="mt-3 max-w-md text-sm text-crema/70">{brand.artisanStatement}</p>
        </div>
        <div>
          <p className="mb-3 font-semibold">Tienda</p>
          <ul className="space-y-2 text-sm text-crema/80">
            <li><Link href="/tienda">Todos los productos</Link></li>
            <li><Link href="/tienda?c=salsas">Salsas</Link></li>
            <li><Link href="/tienda?c=encurtidos">Encurtidos</Link></li>
            <li><Link href="/producto/caja-especial">Caja Especial</Link></li>
            <li><Link href="/politicas">Envíos, cambios y datos</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold">Pedidos y comunidad</p>
          <ul className="space-y-3 text-sm text-crema/80">
            <li>
              <a href={whatsappLink(`¡Hola ${brand.name}! Quiero hacer un pedido.`)} target="_blank" rel="noopener" className="flex items-center gap-2">
                <WhatsappIcon /> {brand.contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={brand.contact.instagramUrl} target="_blank" rel="noopener" className="flex items-center gap-2">
                <InstagramIcon /> @{brand.contact.instagramHandle}
              </a>
            </li>
            <li className="text-crema/60">{brand.hashtag}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-crema/10 py-5 text-center text-xs text-crema/50">
        © {new Date().getFullYear()} {brand.name}. Productos artesanales elaborados en Colombia. Pagos seguros con Wompi.
      </div>
    </footer>
  );
}
