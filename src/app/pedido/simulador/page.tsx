import { notFound } from "next/navigation";
import { orders } from "@/lib/orders";
import { formatCOP } from "@/lib/format";
import { simulatorEnabled } from "@/lib/wompi";

export const dynamic = "force-dynamic";

/** Página SOLO de desarrollo: reemplaza a Wompi cuando no hay llaves de sandbox. */
export default async function Simulador({ searchParams }: { searchParams: { ref?: string } }) {
  if (!simulatorEnabled()) notFound();
  const order = searchParams.ref ? await orders().get(searchParams.ref) : null;
  if (!order) notFound();
  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <div className="rounded-2xl border-2 border-dashed border-aji/50 bg-white p-8">
        <p className="eyebrow text-aji">Modo desarrollo · simulador de pago</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Pedido {order.reference}</h1>
        <p className="mt-2 text-cacao/70">
          Total {formatCOP(order.total)}. Configura <code>WOMPI_PUBLIC_KEY</code> y <code>WOMPI_INTEGRITY_SECRET</code> de sandbox para usar el checkout real de Wompi.
        </p>
        <form action="/api/dev/simulate" method="post" className="mt-6 grid gap-3">
          <input type="hidden" name="ref" value={order.reference} />
          <button name="status" value="APPROVED" className="btn-primary" data-testid="sim-approve">Simular pago APROBADO</button>
          <button name="status" value="DECLINED" className="btn-secondary">Simular pago RECHAZADO</button>
          <button name="status" value="PENDING" className="btn-secondary">Simular pago PENDIENTE</button>
        </form>
      </div>
    </div>
  );
}
