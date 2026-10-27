import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/data/brand";
import { fetchTransaction } from "@/lib/wompi";
import { applyTransaction } from "@/lib/payment-sync";
import { orders, type Order } from "@/lib/orders";
import { formatCOP } from "@/lib/format";
import { PurchaseTracker } from "@/components/PurchaseTracker";
import { whatsappLink } from "@/lib/omnichannel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Estado de tu pedido", robots: { index: false } };

const copy: Record<string, { title: string; text: string; tone: string }> = {
  APPROVED: { title: "¡Gracias por tu compra!", text: "Tu pago fue aprobado. Ya estamos preparando tus frascos a mano; te avisaremos por WhatsApp cuando salgan a despacho.", tone: "text-oliva-700" },
  PENDING: { title: "Tu pago está en proceso", text: "Wompi aún está confirmando el pago (PSE puede tardar unos minutos). Te avisaremos apenas se apruebe.", tone: "text-kraft" },
  DECLINED: { title: "El pago no fue aprobado", text: "Tu banco rechazó la transacción. Puedes intentarlo de nuevo con otro medio de pago.", tone: "text-aji" },
  VOIDED: { title: "La transacción fue anulada", text: "Si crees que es un error, escríbenos por WhatsApp.", tone: "text-aji" },
  ERROR: { title: "Hubo un problema con el pago", text: "No pudimos confirmar tu pago. Escríbenos por WhatsApp y lo revisamos contigo.", tone: "text-aji" },
};

export default async function Resultado({ searchParams }: { searchParams: { id?: string; ref?: string } }) {
  let order: Order | null = null;
  if (searchParams.id) {
    const tx = await fetchTransaction(searchParams.id);
    if (tx) order = await applyTransaction(tx);
  } else if (searchParams.ref) {
    order = await orders().get(searchParams.ref);
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="h-section">No encontramos tu pedido</h1>
        <p className="mt-4 text-cacao/70">Si realizaste un pago, escríbenos por WhatsApp con tu correo y lo verificamos.</p>
        <Link href="/" className="btn-primary mt-8 inline-block">Volver al inicio</Link>
      </div>
    );
  }

  const c = copy[order.status] ?? copy.ERROR;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      {order.status === "APPROVED" && (
        <PurchaseTracker
          reference={order.reference}
          value={order.subtotal}
          shipping={order.shipping}
          items={order.lines.map((l) => ({ item_id: l.sku, item_name: l.name, item_variant: l.size, price: l.unitPrice, quantity: l.qty }))}
        />
      )}
      <p className="eyebrow">Pedido {order.reference}</p>
      <h1 className={`mt-2 font-display text-5xl font-bold ${c.tone}`} data-testid="order-status" data-status={order.status}>{c.title}</h1>
      <p className="mt-4 text-lg text-cacao/80">{c.text}</p>

      <div className="mt-8 rounded-2xl bg-white/70 p-6 ring-1 ring-cacao/5">
        <ul className="space-y-2 text-sm">
          {order.lines.map((l) => (
            <li key={l.sku} className="flex justify-between"><span>{l.qty} × {l.name} {l.size}</span><span>{formatCOP(l.total)}</span></li>
          ))}
          <li className="flex justify-between text-cacao/70"><span>Envío</span><span>{order.shipping ? formatCOP(order.shipping) : "Gratis"}</span></li>
          <li className="flex justify-between border-t border-cacao/10 pt-2 text-lg font-bold"><span>Total</span><span>{formatCOP(order.total)}</span></li>
        </ul>
        <p className="mt-4 text-sm text-cacao/70">Envío a: {order.shippingAddress.address}, {order.shippingAddress.city} ({order.shippingAddress.department})</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {order.status === "DECLINED" || order.status === "ERROR" ? (
          <Link href="/checkout" className="btn-primary">Intentar de nuevo</Link>
        ) : (
          <Link href="/tienda" className="btn-primary">Seguir comprando</Link>
        )}
        <a href={whatsappLink(`Hola ${brand.name}, tengo una consulta sobre mi pedido ${order.reference}.`)} target="_blank" rel="noopener" className="btn-secondary" data-ga="click_whatsapp" data-ga-location="order_result">
          Escribir por WhatsApp
        </a>
      </div>

      {order.status === "APPROVED" && (
        <div className="mt-12 rounded-2xl bg-oliva p-6 text-crema">
          <p className="font-script text-3xl">¡Cuéntanos cómo los disfrutas!</p>
          <p className="mt-2 text-sm text-crema/85">
            Comparte tu plato en Instagram etiquetando a <b>@{brand.contact.instagramHandle}</b> con {brand.hashtag}. Publicamos nuestras recetas favoritas de la comunidad.
          </p>
          <a href={brand.contact.instagramUrl} target="_blank" rel="noopener" className="mt-4 inline-block rounded-full bg-crema px-5 py-2 font-semibold text-oliva-700" data-ga="click_instagram" data-ga-location="order_result">
            Ir a Instagram
          </a>
        </div>
      )}
    </div>
  );
}
