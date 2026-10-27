import { NextResponse } from "next/server";
import { quote } from "@/lib/pricing";

export const dynamic = "force-dynamic";

/** Cotización (subtotal, envío y total) calculada en servidor para el resumen del checkout. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { items?: { sku: string; qty: number }[]; city?: string };
  const items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
  return NextResponse.json(quote(items, typeof body.city === "string" ? body.city : undefined));
}
