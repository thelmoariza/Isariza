import { NextResponse } from "next/server";
import { verifyEventChecksum, type WompiEvent } from "@/lib/wompi";
import { applyTransaction } from "@/lib/payment-sync";

export const dynamic = "force-dynamic";

/**
 * URL de eventos de Wompi. Configúrala en comercios.wompi.co →
 * Desarrolladores → "URL de Eventos": https://<tu-dominio>/api/webhooks/wompi
 */
export async function POST(req: Request) {
  let evt: WompiEvent;
  try {
    evt = (await req.json()) as WompiEvent;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!verifyEventChecksum(evt)) {
    console.warn("[wompi] checksum inválido");
    return NextResponse.json({ ok: false, error: "invalid checksum" }, { status: 401 });
  }

  if (evt.event === "transaction.updated" && evt.data?.transaction) {
    const order = await applyTransaction(evt.data.transaction);
    console.info("[wompi] transacción", evt.data.transaction.reference, evt.data.transaction.status, order ? "ok" : "pedido no encontrado");
  }
  // Wompi espera 200 para no reintentar
  return NextResponse.json({ ok: true });
}
