import type { Metadata } from "next";
import { orders } from "@/lib/orders";
import { formatCOP } from "@/lib/format";
import { whatsappLink } from "@/lib/omnichannel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pedidos", robots: { index: false, follow: false } };

const color: Record<string, string> = {
  APPROVED: "bg-oliva text-crema",
  PENDING: "bg-kraft-300 text-cacao",
  DECLINED: "bg-aji/15 text-aji-700",
  VOIDED: "bg-cacao/10",
  ERROR: "bg-aji text-white",
};

export default async function AdminPedidos() {
  const list = await orders().list(200);
  const approved = list.filter((o) => o.status === "APPROVED");
  const revenue = approved.reduce((a, o) => a + o.total, 0);
  const fromIg = approved.filter((o) => o.attribution?.source === "instagram").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="h-section">Pedidos</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Kpi label="Pedidos aprobados" value={String(approved.length)} />
        <Kpi label="Ventas aprobadas" value={formatCOP(revenue)} />
        <Kpi label="Aprobados desde Instagram" value={`${fromIg} (${approved.length ? Math.round((fromIg / approved.length) * 100) : 0}%)`} />
      </div>
      <div className="mt-8 overflow-x-auto rounded-2xl bg-white/80 ring-1 ring-cacao/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-cacao/5 text-xs uppercase tracking-wide">
            <tr>
              <th className="p-3">Referencia</th><th className="p-3">Fecha</th><th className="p-3">Estado</th><th className="p-3">Cliente</th>
              <th className="p-3">Productos</th><th className="p-3">Destino</th><th className="p-3">Total</th><th className="p-3">Origen</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cacao/10">
            {list.map((o) => (
              <tr key={o.reference} className="align-top">
                <td className="p-3 font-mono text-xs">{o.reference}</td>
                <td className="p-3 whitespace-nowrap">{new Date(o.createdAt).toLocaleString("es-CO", { timeZone: "America/Bogota" })}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${color[o.status]}`}>{o.status}</span></td>
                <td className="p-3">{o.customer.fullName}<br /><span className="text-xs text-cacao/60">{o.customer.email} · {o.customer.phone}</span></td>
                <td className="p-3">{o.lines.map((l) => <div key={l.sku}>{l.qty}× {l.sku}</div>)}</td>
                <td className="p-3">{o.shippingAddress.address}<br /><span className="text-xs">{o.shippingAddress.city}, {o.shippingAddress.department}</span>{o.shippingAddress.notes && <div className="text-xs italic">“{o.shippingAddress.notes}”</div>}</td>
                <td className="p-3 font-semibold">{formatCOP(o.total)}</td>
                <td className="p-3 text-xs">{o.attribution ? [o.attribution.source, o.attribution.medium, o.attribution.campaign].filter(Boolean).join(" / ") : "directo"}</td>
                <td className="p-3"><a className="text-xs underline" target="_blank" rel="noopener" href={whatsappLink(`Hola ${o.customer.fullName.split(" ")[0]}, te escribimos de Isariza Sabores sobre tu pedido ${o.reference}.`).replace(/wa\.me\/\d+/, `wa.me/57${o.customer.phone}`)}>WhatsApp</a></td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={9} className="p-6 text-center text-cacao/60">Aún no hay pedidos.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/80 p-5 ring-1 ring-cacao/10">
      <p className="text-xs uppercase tracking-wide text-cacao/60">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
