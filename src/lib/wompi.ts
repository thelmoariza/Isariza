import crypto from "node:crypto";

/**
 * Integración con Wompi (Bancolombia) — Web Checkout por redirección.
 * Docs: https://docs.wompi.co/docs/colombia/widget-checkout-web/
 *
 * Flujo:
 *  1. Creamos el pedido (PENDING) y una referencia única.
 *  2. Firmamos: SHA256(referencia + montoEnCentavos + moneda + secretoIntegridad).
 *  3. Redirigimos a checkout.wompi.co con la firma.
 *  4. Wompi vuelve a /pedido/resultado?id=<transactionId>; consultamos el estado
 *     al API de Wompi (fuente de verdad) y actualizamos el pedido.
 *  5. Además, Wompi notifica por webhook (/api/webhooks/wompi) — validamos el
 *     checksum con el secreto de eventos.
 */

export type WompiStatus = "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";

function cfg() {
  const env = process.env.WOMPI_ENV === "production" ? "production" : "sandbox";
  return {
    env,
    apiBase: env === "production" ? "https://production.wompi.co/v1" : "https://sandbox.wompi.co/v1",
    checkoutUrl: "https://checkout.wompi.co/p/",
    publicKey: process.env.WOMPI_PUBLIC_KEY ?? "",
    integritySecret: process.env.WOMPI_INTEGRITY_SECRET ?? "",
    eventsSecret: process.env.WOMPI_EVENTS_SECRET ?? "",
  };
}

export function wompiConfigured() {
  const c = cfg();
  return Boolean(c.publicKey && c.integritySecret && !c.publicKey.includes("xxxx"));
}

export function integritySignature(reference: string, amountInCents: number, currency: string, secret: string) {
  return crypto
    .createHash("sha256")
    .update(`${reference}${amountInCents}${currency}${secret}`)
    .digest("hex");
}

export interface CheckoutParams {
  reference: string;
  amountInCents: number;
  redirectUrl: string;
  customer: { email: string; fullName: string; phone: string; legalId?: string; legalIdType?: string };
  shipping: { addressLine1: string; city: string; region: string; phone: string };
}

export function buildCheckoutUrl(p: CheckoutParams) {
  const c = cfg();
  const currency = "COP";
  const sig = integritySignature(p.reference, p.amountInCents, currency, c.integritySecret);
  const q = new URLSearchParams({
    "public-key": c.publicKey,
    currency,
    "amount-in-cents": String(p.amountInCents),
    reference: p.reference,
    "signature:integrity": sig,
    "redirect-url": p.redirectUrl,
    "customer-data:email": p.customer.email,
    "customer-data:full-name": p.customer.fullName,
    "customer-data:phone-number": p.customer.phone,
    "customer-data:phone-number-prefix": "+57",
    "shipping-address:address-line-1": p.shipping.addressLine1,
    "shipping-address:country": "CO",
    "shipping-address:city": p.shipping.city,
    "shipping-address:region": p.shipping.region,
    "shipping-address:phone-number": p.shipping.phone,
  });
  if (p.customer.legalId) {
    q.set("customer-data:legal-id", p.customer.legalId);
    q.set("customer-data:legal-id-type", p.customer.legalIdType ?? "CC");
  }
  return `${c.checkoutUrl}?${q.toString()}`;
}

export interface WompiTransaction {
  id: string;
  status: WompiStatus;
  reference: string;
  amount_in_cents: number;
  currency: string;
  payment_method_type?: string;
  status_message?: string | null;
}

/** Consulta el estado real de una transacción (no se requiere llave privada). */
export async function fetchTransaction(id: string): Promise<WompiTransaction | null> {
  if (!/^[\w-]{4,80}$/.test(id)) return null;
  const res = await fetch(`${cfg().apiBase}/transactions/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: WompiTransaction };
  return json.data ?? null;
}

/**
 * Verificación del checksum de eventos de Wompi.
 * checksum = SHA256( valores de signature.properties concatenados + timestamp + secretoEventos )
 */
export interface WompiEvent {
  event: string;
  data: { transaction: WompiTransaction & Record<string, unknown> };
  signature: { properties: string[]; checksum: string };
  timestamp: number;
  environment?: string;
}

function readPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), obj);
}

export function verifyEventChecksum(evt: WompiEvent, secret = cfg().eventsSecret) {
  if (!secret || !evt?.signature?.properties || !evt.signature.checksum) return false;
  const values = evt.signature.properties.map((p) => String(readPath(evt.data, p) ?? "")).join("");
  const expected = crypto
    .createHash("sha256")
    .update(`${values}${evt.timestamp}${secret}`)
    .digest("hex");
  const a = Buffer.from(expected.toLowerCase());
  const b = Buffer.from(String(evt.signature.checksum).toLowerCase());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Simulador de pagos: activo en `npm run dev`, o con PAYMENT_SIMULATOR=true (docker compose). Nunca en AWS. */
export function simulatorEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.PAYMENT_SIMULATOR === "true";
}
