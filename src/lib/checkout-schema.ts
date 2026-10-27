import { z } from "zod";

import { departamentos } from "./departamentos";
export { departamentos };

export const checkoutSchema = z.object({
  items: z.array(z.object({ sku: z.string().min(3).max(40), qty: z.number().int().min(1).max(24) })).min(1, "El carrito está vacío"),
  customer: z.object({
    fullName: z.string().trim().min(3, "Escribe tu nombre completo").max(120),
    email: z.string().trim().email("Correo no válido").max(160),
    phone: z.string().trim().regex(/^3\d{9}$/, "Celular colombiano de 10 dígitos (ej. 3001234567)"),
    legalIdType: z.enum(["CC", "CE", "NIT", "PP"]),
    legalId: z.string().trim().regex(/^[0-9A-Za-z-]{5,15}$/, "Documento no válido"),
  }),
  shippingAddress: z.object({
    address: z.string().trim().min(5, "Escribe la dirección").max(200),
    city: z.string().trim().min(2, "Escribe la ciudad").max(80),
    department: z.enum(departamentos, { errorMap: () => ({ message: "Selecciona el departamento" }) }),
    notes: z.string().trim().max(300).optional(),
  }),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "Debes aceptar la política de datos y términos" }) }),
  attribution: z
    .object({ source: z.string().max(60).optional(), medium: z.string().max(60).optional(), campaign: z.string().max(100).optional(), content: z.string().max(100).optional() })
    .optional(),
  gaClientId: z.string().max(60).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
