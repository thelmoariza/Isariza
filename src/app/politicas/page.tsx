import type { Metadata } from "next";
import { brand } from "@/data/brand";
import { shipping } from "@/data/catalog";
import { formatCOP } from "@/lib/format";

export const metadata: Metadata = { title: "Envíos, cambios y datos personales" };

// ⚠️ Plantilla base. Debe ser revisada por un asesor legal antes de publicar.
export default function Politicas() {
  return (
    <article className="prose-isariza mx-auto max-w-3xl space-y-8 px-4 py-14">
      <h1 className="h-section">Políticas de la tienda</h1>

      <section id="envios">
        <h2 className="font-display text-3xl font-bold">Envíos</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-cacao/85">
          <li>Enviamos a toda Colombia. Tarifa nacional: {formatCOP(shipping.flatRate)}; {shipping.originCity}: {formatCOP(shipping.localRate)}.</li>
          <li>Envío gratis en pedidos desde {formatCOP(shipping.freeFrom)}.</li>
          <li>Como preparamos en lotes pequeños, despachamos en 1 a 3 días hábiles tras la aprobación del pago. La entrega toma de 2 a 5 días hábiles según la ciudad.</li>
        </ul>
      </section>

      <section id="cambios">
        <h2 className="font-display text-3xl font-bold">Cambios y devoluciones</h2>
        <p className="mt-3 text-cacao/85">
          Por tratarse de alimentos, no aceptamos devoluciones de frascos abiertos. Si tu pedido llega con un frasco roto, sellado
          comprometido o un producto equivocado, escríbenos por WhatsApp ({brand.contact.phoneDisplay}) dentro de las 48 horas
          siguientes con una foto y lo reponemos sin costo. Aplica el derecho de retracto (art. 47, Ley 1480 de 2011) en los términos de ley
          para productos sellados.
        </p>
      </section>

      <section id="datos">
        <h2 className="font-display text-3xl font-bold">Tratamiento de datos personales</h2>
        <p className="mt-3 text-cacao/85">
          En cumplimiento de la Ley 1581 de 2012, {brand.name} trata tus datos (nombre, documento, correo, celular y dirección) solo
          para gestionar tu pedido, el envío, la facturación y, si lo autorizas, enviarte novedades. Puedes conocer, actualizar,
          rectificar o suprimir tus datos escribiendo a {brand.contact.email}. Los pagos los procesa Wompi; nunca almacenamos datos de tarjetas.
        </p>
        <p className="mt-3 text-cacao/85">
          Usamos Google Analytics 4 para entender cómo se usa la tienda y mejorar la experiencia.
        </p>
      </section>

      <section id="artesanal">
        <h2 className="font-display text-3xl font-bold">Sobre nuestros productos artesanales</h2>
        <p className="mt-3 text-cacao/85">{brand.artisanStatement}</p>
      </section>
    </article>
  );
}
