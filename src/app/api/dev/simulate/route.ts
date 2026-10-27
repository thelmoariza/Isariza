import { NextResponse } from "next/server";
import { orders } from "@/lib/orders";
import { simulatorEnabled } from "@/lib/wompi";

export const dynamic = "force-dynamic";

/** SOLO desarrollo: simula la respuesta de Wompi cuando no hay llaves configuradas. */
export async function POST(req: Request) {
  if (!simulatorEnabled()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  const f = await req.formData();
  const ref = String(f.get("ref") ?? "");
  const status = String(f.get("status") ?? "");
  if (!["APPROVED", "DECLINED", "PENDING"].includes(status)) return NextResponse.json({ error: "estado inválido" }, { status: 400 });
  const o = await orders().update(ref, { status: status as "APPROVED", payment: { provider: "wompi", transactionId: `SIM-${Date.now()}`, method: "SIMULADO" } });
  if (!o) return NextResponse.json({ error: "pedido no encontrado" }, { status: 404 });
  return NextResponse.redirect(new URL(`/pedido/resultado?ref=${encodeURIComponent(ref)}`, req.url), 303);
}
