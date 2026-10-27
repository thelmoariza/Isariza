"use client";

import { brand } from "@/data/brand";
import { whatsappLink } from "@/lib/omnichannel";
import { track } from "@/lib/analytics";
import { WhatsappIcon } from "./Icons";

export function WhatsappFloat() {
  return (
    <a
      href={whatsappLink(`¡Hola ${brand.name}! Vengo de la tienda en línea y tengo una pregunta.`)}
      target="_blank"
      rel="noopener"
      onClick={() => track("click_whatsapp", { location: "float" })}
      className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105"
      aria-label="Escríbenos por WhatsApp"
    >
      <WhatsappIcon className="h-7 w-7" />
    </a>
  );
}
