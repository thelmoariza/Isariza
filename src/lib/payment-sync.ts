import "server-only";
import { orders, type Order, type OrderStatus } from "./orders";
import type { WompiTransaction } from "./wompi";

/**
 * Aplica el estado de una transacción de Wompi al pedido, validando que
 * referencia, monto y moneda coincidan (evita manipulación del redirect).
 */
export async function applyTransaction(tx: WompiTransaction): Promise<Order | null> {
  const order = await orders().get(tx.reference);
  if (!order) return null;
  if (tx.currency !== "COP" || tx.amount_in_cents !== order.total * 100) {
    console.error("[wompi] monto/moneda no coinciden", { ref: tx.reference, tx: tx.amount_in_cents, order: order.total * 100 });
    return orders().update(order.reference, { status: "ERROR", payment: { provider: "wompi", transactionId: tx.id, statusMessage: "Monto no coincide" } });
  }
  // No degradar un pedido ya aprobado por un evento tardío
  if (order.status === "APPROVED" && tx.status !== "VOIDED") return order;
  return orders().update(order.reference, {
    status: tx.status as OrderStatus,
    payment: { provider: "wompi", transactionId: tx.id, method: tx.payment_method_type, statusMessage: tx.status_message ?? null },
  });
}
