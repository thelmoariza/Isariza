"use client";

import Link from "next/link";
import { useState } from "react";
import { brand } from "@/data/brand";
import { useCart } from "./CartProvider";
import { BagIcon, InstagramIcon, CloseIcon } from "./Icons";
import { track } from "@/lib/analytics";

const nav = [
  { href: "/tienda", label: "Tienda" },
  { href: "/producto/caja-especial", label: "Caja Especial" },
  { href: "/nosotros", label: "Hecho a mano" },
  { href: "/#instagram", label: "Comunidad" },
];

export function Header() {
  const { count, setOpen, ready } = useCart();
  const [menu, setMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-cacao/10 bg-crema/90 backdrop-blur">
      <div className="bg-oliva text-center text-xs tracking-wide text-crema">
        <p className="mx-auto max-w-6xl px-4 py-1.5">
          Hecho a mano en lotes pequeños · Envío gratis desde $60.000 · Pedidos también por WhatsApp {brand.contact.phoneDisplay}
        </p>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <button className="md:hidden" aria-label="Abrir menú" onClick={() => setMenu(true)}>
          <span className="block h-0.5 w-6 bg-cacao" />
          <span className="mt-1.5 block h-0.5 w-6 bg-cacao" />
          <span className="mt-1.5 block h-0.5 w-6 bg-cacao" />
        </button>

        <Link href="/" className="flex items-center gap-2" aria-label={`${brand.name} — inicio`}>
          <span className="font-display text-3xl font-bold leading-none tracking-tight text-cacao">ISARIZA</span>
          <span className="hidden border-l border-cacao/30 pl-2 text-[10px] uppercase leading-tight tracking-[.25em] text-cacao/70 sm:block">
            Sabores
            <br />
            artesanales
          </span>
        </Link>

        <nav className="hidden gap-7 text-sm font-semibold text-cacao md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-aji">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={brand.contact.instagramUrl}
            target="_blank"
            rel="noopener"
            aria-label="Instagram @isariza.sabores"
            className="hidden text-cacao hover:text-aji sm:block"
            onClick={() => track("click_instagram", { location: "header" })}
          >
            <InstagramIcon />
          </a>
          <button
            onClick={() => setOpen(true)}
            className="relative rounded-full p-2 text-cacao hover:bg-cacao/5"
            aria-label={`Abrir carrito (${count} productos)`}
            data-testid="cart-button"
          >
            <BagIcon />
            {ready && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-aji px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {menu && (
        <div className="fixed inset-0 z-50 bg-cacao/40 md:hidden" onClick={() => setMenu(false)}>
          <div className="h-full w-72 bg-crema p-6" onClick={(e) => e.stopPropagation()}>
            <button aria-label="Cerrar menú" onClick={() => setMenu(false)} className="mb-6">
              <CloseIcon />
            </button>
            <ul className="space-y-4 font-display text-2xl text-cacao">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} onClick={() => setMenu(false)}>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
