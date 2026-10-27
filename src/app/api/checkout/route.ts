import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/checkout-schema";
import { quote } from "@/lib/pricing";
import { newReference, orders, type Order } from "@/lib/orders";
import { buildCheckoutUrl, simulatorEnabled, wompiConfigured } from "@/lib/wompi";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisa los datos del formulario", fields: parsed.error.flatten() }, { status: 422 });
  }
  const input = parsed.data;

  // Precios recalculados en servidor desde el catálogo
  const q = quote(input.items, input.shippingAddress.city);
  if (q.errors.length || q.lines.length === 0) {
    return NextResponse.json({ error: q.errors.join(" ") || "El carrito está vacío" }, { status: 409 });
  }

  const now = new Date().toISOString();
  const order: Order = {
    reference: newReference(),
    createdAt: now,
    updatedAt: now,
    status: "PENDING",
    customer: input.customer,
    shippingAddress: input.shippingAddress,
    lines: q.lines,
    subtotal: q.subtotal,
    shipping: q.shipping,
    total: q.total,
    currency: "COP",
    attribution: input.attribution,
    gaClientId: input.gaClientId,
    payment: { provider: "wompi" },
  };
  await orders().create(order);

  const site = process.env.SITE_URL ?? new URL(req.url).origin;

  if (!wompiConfigured()) {
    if (!simulatorEnabled()) {
      return NextResponse.json({ error: "La pasarela de pagos no está configurada." }, { status: 503 });
    }
    // Modo local sin llaves: simulador de pago para pruebas de punta a punta
    return NextResponse.json({ reference: order.reference, total: order.total, redirectUrl: `${site}/pedido/simulador?ref=${order.reference}` });
  }

  const redirectUrl = buildCheckoutUrl({
    reference: order.reference,
    amountInCents: order.total * 100,
    redirectUrl: `${site}/pedido/resultado`,
    customer: { email: input.customer.email, fullName: input.customer.fullName, phone: input.customer.phone, legalId: input.customer.legalId, legalIdType: input.customer.legalIdType },
    shipping: { addressLine1: input.shippingAddress.address, city: input.shippingAddress.city, region: input.shippingAddress.department, phone: input.customer.phone },
  });

  return NextResponse.json({ reference: order.reference, total: order.total, shipping: order.shipping, redirectUrl });
}
