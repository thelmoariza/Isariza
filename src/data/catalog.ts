/**
 * CATÁLOGO DE PRODUCTOS
 * ---------------------------------------------------------------------------
 * Para crear un nuevo SKU:
 *   1. Si es un sabor nuevo, agrega un objeto a `products` con sus `variants`.
 *   2. Si es una presentación nueva de un sabor existente, agrega una entrada
 *      a `variants` de ese producto (SKU único, ej. ISZ-CHI-500).
 *   3. Coloca la foto en /public/img/products/ y referencia la ruta.
 *   4. Para combos, usa `kind: "bundle"` y lista los SKUs en `components`.
 *
 * Todos los productos son artesanales: `handmade` es obligatorio (literal true)
 * y la ficha muestra siempre el mensaje artesanal de marca. Los textos cortos
 * (`tagline`) son los mismos del material de Instagram para mantener coherencia.
 *
 * PRECIOS: en pesos colombianos (COP), IVA incluido.
 * Precios confirmados: 250 gr = $15.000 · Caja 4 × 110 gr = $30.000.
 * ⚠️ PENDIENTE confirmar el precio del frasco individual de 110 gr (hoy $8.000).
 */

export type Category = "salsas" | "encurtidos" | "combos";
export type Heat = 0 | 1 | 2 | 3;

export interface Variant {
  sku: string;
  size: string; // etiqueta visible: "250 gr"
  grams: number;
  price: number; // COP
  compareAtPrice?: number;
  image: string;
  /** null = sin control de inventario (producción bajo pedido) */
  stock: number | null;
  active: boolean;
}

export interface Product {
  slug: string;
  name: string;
  kind: "single" | "bundle";
  category: Category;
  tagline: string; // frase corta del flyer / Instagram
  description: string;
  pairings: string[]; // "Ideal con…"
  ingredients: string;
  heat: Heat; // 0 = sin picante … 3 = muy picante
  handmade: true;
  shelfLife: string;
  storage: string;
  badges?: string[];
  components?: { sku: string; qty: number }[];
  variants: Variant[];
  featured?: boolean;
  instagramHashtags?: string[];
}

const commonStorage = "Consérvese en lugar fresco y seco. Una vez abierto, refrigérese y consúmase en máximo 30 días.";
const commonShelf = "6 meses cerrado";

export const products: Product[] = [
  {
    slug: "chimichurri",
    name: "Chimichurri",
    kind: "single",
    category: "salsas",
    tagline: "El sabor perfecto para tus carnes, parrillas y recetas favoritas.",
    description:
      "Perejil, ajo, orégano y ají picados a mano, macerados en aceite y vinagre. Aroma, sabor y tradición en cada cucharada.",
    pairings: ["Carnes a la parrilla", "Choripán", "Papas al horno", "Pan artesanal"],
    ingredients: "Perejil, ajo, orégano, ají, aceite vegetal, vinagre, sal y especias.",
    heat: 1,
    handmade: true,
    shelfLife: commonShelf,
    storage: commonStorage,
    featured: true,
    instagramHashtags: ["#chimichurri", "#parrilla"],
    variants: [
      { sku: "ISZ-CHI-250", size: "250 gr", grams: 250, price: 15000, image: "/img/products/chimichurri-250.jpg", stock: null, active: true },
      { sku: "ISZ-CHI-110", size: "110 gr", grams: 110, price: 8000, image: "/img/products/chimichurri-110.jpg", stock: null, active: true },
    ],
  },
  {
    slug: "pepinos-encurtidos",
    name: "Pepinos encurtidos",
    kind: "single",
    category: "encurtidos",
    tagline: "Crujientes, frescos y con el toque ideal de especias.",
    description:
      "Pepinos seleccionados, encurtidos en salmuera de vinagre con eneldo, mostaza en grano y pimienta. El mismo sabor natural en dos formatos.",
    pairings: ["Hamburguesas", "Sándwiches", "Tablas de quesos", "Ensaladas"],
    ingredients: "Pepino, vinagre, agua, sal, eneldo, mostaza en grano, pimienta y ajo.",
    heat: 0,
    handmade: true,
    shelfLife: commonShelf,
    storage: commonStorage,
    featured: true,
    instagramHashtags: ["#pickles", "#encurtidos"],
    variants: [
      { sku: "ISZ-PEP-250", size: "250 gr", grams: 250, price: 15000, image: "/img/products/pepinos-250.jpg", stock: null, active: true },
      { sku: "ISZ-PEP-110", size: "110 gr", grams: 110, price: 8000, image: "/img/products/pepinos-110.jpg", stock: null, active: true },
    ],
  },
  {
    slug: "aji-picante",
    name: "Ají Picante",
    kind: "single",
    category: "salsas",
    tagline: "El picante justo para darle vida a tus platos.",
    description:
      "Ajíes rojos frescos, cebolla y cilantro en un balance de picante y acidez pensado para la mesa colombiana.",
    pairings: ["Empanadas", "Sopas y sancochos", "Arepas", "Huevos"],
    ingredients: "Ají rojo, cebolla, pimentón, vinagre, sal, ajo y especias.",
    heat: 3,
    handmade: true,
    shelfLife: commonShelf,
    storage: commonStorage,
    featured: true,
    instagramHashtags: ["#ajipicante", "#picante"],
    variants: [
      { sku: "ISZ-AJI-250", size: "250 gr", grams: 250, price: 15000, image: "/img/products/aji-250.jpg", stock: null, active: true },
      { sku: "ISZ-AJI-110", size: "110 gr", grams: 110, price: 8000, image: "/img/products/aji-110.jpg", stock: null, active: true },
    ],
  },
  {
    slug: "cebolla-y-aji-encurtidos",
    name: "Cebolla y Ají encurtidos",
    kind: "single",
    category: "encurtidos",
    tagline: "El equilibrio perfecto entre lo fresco y lo picante.",
    description:
      "Cebolla morada en julianas y ají en rodajas, encurtidos en vinagre con especias. Intenso, fresco y delicioso.",
    pairings: ["Tacos y arepas", "Ceviches", "Carnes", "Bowls"],
    ingredients: "Cebolla morada, ají, vinagre, agua, sal, azúcar y especias.",
    heat: 2,
    handmade: true,
    shelfLife: commonShelf,
    storage: commonStorage,
    featured: true,
    instagramHashtags: ["#cebollaencurtida"],
    variants: [
      { sku: "ISZ-CEB-250", size: "250 gr", grams: 250, price: 15000, image: "/img/products/cebolla-aji-250.jpg", stock: null, active: true },
      { sku: "ISZ-CEB-110", size: "110 gr", grams: 110, price: 8000, image: "/img/products/cebolla-aji-110.jpg", stock: null, active: true },
    ],
  },
  {
    slug: "caja-especial",
    name: "Caja Especial · 4 sabores",
    kind: "bundle",
    category: "combos",
    tagline: "El regalo perfecto para los amantes de los sabores auténticos.",
    description:
      "4 frascos de 110 gr en caja kraft de regalo: Cebolla y Ají, Pepinos, Ají Picante y Chimichurri. Ideal para regalar o para descubrir todos nuestros sabores.",
    pairings: ["Regalo corporativo", "Anfitriones", "Asados en familia", "Amantes del picante"],
    ingredients: "Ver la ficha de cada sabor incluido.",
    heat: 2,
    handmade: true,
    shelfLife: commonShelf,
    storage: commonStorage,
    badges: ["Ideal para regalar"],
    featured: true,
    components: [
      { sku: "ISZ-CEB-110", qty: 1 },
      { sku: "ISZ-PEP-110", qty: 1 },
      { sku: "ISZ-AJI-110", qty: 1 },
      { sku: "ISZ-CHI-110", qty: 1 },
    ],
    instagramHashtags: ["#regalosartesanales"],
    variants: [
      { sku: "ISZ-BOX-4x110", size: "4 × 110 gr", grams: 440, price: 30000, compareAtPrice: 32000, image: "/img/products/caja-especial.jpg", stock: null, active: true },
    ],
  },
];

export const categories: { id: Category; label: string }[] = [
  { id: "salsas", label: "Salsas" },
  { id: "encurtidos", label: "Encurtidos" },
  { id: "combos", label: "Cajas y combos" },
];

/** Envío: tarifa plana nacional y envío gratis desde un umbral (COP). */
export const shipping = {
  flatRate: 12000,
  localRate: 7000, // ciudad de origen
  originCity: "Barranquilla", // TODO: ajustar a la ciudad de despacho real
  freeFrom: 60000,
};

// ---------- helpers ----------
export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function findVariant(sku: string): { product: Product; variant: Variant } | undefined {
  for (const product of products) {
    const variant = product.variants.find((v) => v.sku === sku);
    if (variant) return { product, variant };
  }
  return undefined;
}

export function activeProducts() {
  return products.filter((p) => p.variants.some((v) => v.active));
}

export function minPrice(p: Product) {
  return Math.min(...p.variants.filter((v) => v.active).map((v) => v.price));
}

export const heatLabel: Record<Heat, string> = {
  0: "Sin picante",
  1: "Suave",
  2: "Medio",
  3: "Picante",
};
