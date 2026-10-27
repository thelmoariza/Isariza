"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart, toGaItem, getStoredAttribution } from "@/components/CartProvider";
import { departamentos } from "@/lib/departamentos";
import { formatCOP } from "@/lib/format";
import { ecommerce, getGaClientId } from "@/lib/analytics";
import { ArtisanNote } from "@/components/ArtisanNote";

type Errors = Record<string, string>;

export default function CheckoutPage() {
  const { items, subtotal, ready } = useCart();
  const [city, setCity] = useState("");
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const began = useRef(false);

  useEffect(() => {
    if (ready && items.length && !began.current) {
      began.current = true;
      ecommerce("begin_checkout", items.map((i) => toGaItem(i, i.qty)));
    }
  }, [ready, items]);

  // Cotiza envío en servidor cuando cambia la ciudad o el carrito
  useEffect(() => {
    if (!ready || !items.length) return;
    const t = setTimeout(async () => {
      const r = await fetch("/api/quote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ items: items.map(({ sku, qty }) => ({ sku, qty })), city }) });
      const q = await r.json();
      setShippingCost(q.shipping);
    }, 300);
    return () => clearTimeout(t);
  }, [city, items, ready]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setGlobalError("");
    const f = new FormData(e.currentTarget);
    const payload = {
      items: items.map(({ sku, qty }) => ({ sku, qty })),
      customer: {
        fullName: String(f.get("fullName") ?? ""),
        email: String(f.get("email") ?? ""),
        phone: String(f.get("phone") ?? "").replace(/\D/g, ""),
        legalIdType: String(f.get("legalIdType") ?? "CC"),
        legalId: String(f.get("legalId") ?? ""),
      },
      shippingAddress: {
        address: String(f.get("address") ?? ""),
        city: String(f.get("city") ?? ""),
        department: String(f.get("department") ?? ""),
        notes: String(f.get("notes") ?? "") || undefined,
      },
      acceptTerms: f.get("acceptTerms") === "on",
      attribution: getStoredAttribution(),
      gaClientId: undefined as string | undefined,
    };

    if (!validateClient(payload, setErrors)) {
      setGlobalError("Revisa los campos marcados.");
      return;
    }

    payload.gaClientId = await getGaClientId();
    const gaItems = items.map((i) => toGaItem(i, i.qty));
    ecommerce("add_shipping_info", gaItems, { shipping_tier: shippingCost === 0 ? "gratis" : "nacional" });

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) {
        setGlobalError(data.error ?? "No pudimos procesar el pedido.");
        if (res.status === 422) validateClient(payload, setErrors);
        setLoading(false);
        return;
      }
      ecommerce("add_payment_info", gaItems, { payment_type: "wompi", transaction_id: data.reference });
      try { sessionStorage.setItem("isariza.lastOrder", data.reference); } catch {}
      window.location.href = data.redirectUrl;
    } catch {
      setGlobalError("No pudimos conectar con el servidor. Intenta de nuevo.");
      setLoading(false);
    }
  }

  if (!ready) return <div className="min-h-[60vh]" />;
  if (!items.length)
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="font-script text-3xl text-oliva">Tu carrito está vacío</p>
        <Link href="/tienda" className="btn-primary mt-6 inline-block">Ir a la tienda</Link>
      </div>
    );

  const total = subtotal + (shippingCost ?? 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="h-section">Finalizar compra</h1>
      <form
        onSubmit={onSubmit}
        onChange={(e) => {
          const n = (e.target as HTMLInputElement).name;
          if (errors[n]) setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== n)));
        }}
        noValidate
        className="mt-8 grid gap-10 md:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <fieldset className="space-y-4">
            <legend className="mb-2 font-display text-2xl font-bold">Tus datos</legend>
            <Field name="fullName" label="Nombre completo" autoComplete="name" errors={errors} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="email" label="Correo electrónico" type="email" autoComplete="email" errors={errors} />
              <Field name="phone" label="Celular" type="tel" autoComplete="tel-national" placeholder="3001234567" errors={errors} />
            </div>
            <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
              <div>
                <label className="label" htmlFor="legalIdType">Tipo doc.</label>
                <select id="legalIdType" name="legalIdType" className="field" defaultValue="CC">
                  <option value="CC">CC</option>
                  <option value="CE">CE</option>
                  <option value="NIT">NIT</option>
                  <option value="PP">Pasaporte</option>
                </select>
              </div>
              <Field name="legalId" label="Número de documento" inputMode="numeric" errors={errors} />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-2 font-display text-2xl font-bold">Envío</legend>
            <Field name="address" label="Dirección" autoComplete="street-address" placeholder="Calle 00 # 00-00, apto…" errors={errors} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="city" label="Ciudad / municipio" autoComplete="address-level2" errors={errors} onChange={(e) => setCity(e.target.value)} />
              <div>
                <label className="label" htmlFor="department">Departamento</label>
                <select id="department" name="department" className="field" defaultValue="">
                  <option value="" disabled>Selecciona…</option>
                  {departamentos.map((d) => <option key={d}>{d}</option>)}
                </select>
                {errors.department && <p className="mt-1 text-xs text-aji">{errors.department}</p>}
              </div>
            </div>
            <div>
              <label className="label" htmlFor="notes">Notas para la entrega (opcional)</label>
              <textarea id="notes" name="notes" rows={2} className="field" placeholder="Ej. Es un regalo, entregar en portería" />
            </div>
          </fieldset>

          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="acceptTerms" className="mt-1 h-4 w-4 accent-oliva" />
            <span>
              Acepto los <Link href="/politicas" target="_blank" className="underline">términos y la política de tratamiento de datos personales</Link> (Ley 1581 de 2012).
              {errors.acceptTerms && <span className="block text-xs text-aji">{errors.acceptTerms}</span>}
            </span>
          </label>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl bg-white/70 p-5 ring-1 ring-cacao/5 md:sticky md:top-28">
          <h2 className="font-display text-2xl font-bold">Resumen</h2>
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.sku} className="flex items-center gap-3 text-sm">
                <span className="relative">
                  <Image src={i.image} alt="" width={52} height={52} className="h-[52px] w-[52px] rounded-md object-cover" />
                  <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-cacao text-[10px] text-crema">{i.qty}</span>
                </span>
                <span className="flex-1">{i.name} <span className="text-cacao/60">{i.size}</span></span>
                <span className="font-semibold">{formatCOP(i.qty * i.unitPrice)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 border-t border-cacao/10 pt-3 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCOP(subtotal)}</span></div>
            <div className="flex justify-between"><span>Envío</span><span data-testid="shipping">{shippingCost === null ? "…" : shippingCost === 0 ? "Gratis" : formatCOP(shippingCost)}</span></div>
            <div className="flex justify-between pt-2 text-lg font-bold"><span>Total</span><span data-testid="total">{formatCOP(total)}</span></div>
          </div>
          {globalError && <p className="rounded-lg bg-aji/10 p-3 text-sm text-aji-700" role="alert">{globalError}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full" data-testid="pay">
            {loading ? "Conectando con Wompi…" : `Pagar ${formatCOP(total)}`}
          </button>
          <p className="text-center text-xs text-cacao/60">Pago seguro con Wompi (Bancolombia): PSE, tarjetas, Nequi, botón Bancolombia.</p>
          <ArtisanNote compact />
        </aside>
      </form>
    </div>
  );
}

function Field({ name, label, errors, ...rest }: { name: string; label: string; errors: Errors } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} className="field" aria-invalid={!!errors[name]} {...rest} />
      {errors[name] && <p className="mt-1 text-xs text-aji">{errors[name]}</p>}
    </div>
  );
}

/** Validación en el navegador (el servidor vuelve a validar con zod). */
function validateClient(p: { customer: Record<string, string>; shippingAddress: Record<string, string | undefined>; acceptTerms: boolean }, set: (e: Errors) => void): boolean {
  const e: Errors = {};
  if (p.customer.fullName.trim().length < 3) e.fullName = "Escribe tu nombre completo";
  if (!/^\S+@\S+\.\S+$/.test(p.customer.email)) e.email = "Correo no válido";
  if (!/^3\d{9}$/.test(p.customer.phone)) e.phone = "Celular de 10 dígitos (ej. 3001234567)";
  if (!/^[0-9A-Za-z-]{5,15}$/.test(p.customer.legalId)) e.legalId = "Documento no válido";
  if ((p.shippingAddress.address ?? "").trim().length < 5) e.address = "Escribe la dirección";
  if ((p.shippingAddress.city ?? "").trim().length < 2) e.city = "Escribe la ciudad";
  if (!p.shippingAddress.department) e.department = "Selecciona el departamento";
  if (!p.acceptTerms) e.acceptTerms = "Debes aceptar la política de datos y términos";
  set(e);
  return Object.keys(e).length === 0;
}
