// Prueba E2E del flujo de compra (requiere el servidor corriendo).
// Requisitos (una vez): npm i -D playwright && npx playwright install chromium
// Uso: BASE_URL=http://localhost:3000 node tests/e2e.mjs
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SHOTS = process.env.SHOTS_DIR;
const events = [];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.exposeFunction("__ga", (e) => events.push(e));
await page.addInitScript(() => {
  const w = window;
  w.dataLayer = w.dataLayer || [];
  const orig = w.dataLayer.push.bind(w.dataLayer);
  w.dataLayer.push = (...a) => {
    for (const x of a) if (x && x[0] === "event") w.__ga({ name: x[1], value: x[2]?.value, n: x[2]?.items?.length, tid: x[2]?.transaction_id });
    return orig(...a);
  };
});
const shot = async (n, full = true) => SHOTS && page.screenshot({ path: `${SHOTS}/${n}.png`, fullPage: full });

// 1. Llega desde Instagram
await page.goto(`${BASE}/?utm_source=instagram&utm_medium=bio&utm_campaign=lanzamiento`);
await page.waitForLoadState("networkidle");
await shot("01-home");

// 2. Ficha de la caja especial y agregar
await page.goto(`${BASE}/producto/caja-especial`);
await page.getByTestId("pdp-add").click();
await page.waitForTimeout(400);
await shot("02-pdp-drawer", false);
await page.keyboard.press("Escape");

// 3. Chimichurri 250 gr x2 desde la ficha
await page.goto(`${BASE}/producto/chimichurri?v=ISZ-CHI-250`);
await page.getByRole("button", { name: "Aumentar cantidad" }).first().click();
await page.getByTestId("pdp-add").click();
await page.waitForTimeout(300);
const subtotal = await page.getByTestId("cart-subtotal").textContent();
console.log("Subtotal carrito:", subtotal);

// 4. Checkout
await page.goto(`${BASE}/checkout`);
await page.getByTestId("pay").click(); // sin datos → validación
await page.waitForTimeout(400);
const errs = await page.locator("p.text-aji, span.text-aji").count();
console.log("Errores de validación mostrados:", errs);
await page.fill("#fullName", "María Pérez");
await page.fill("#email", "maria@example.com");
await page.fill("#phone", "3001234567");
await page.fill("#legalId", "1020304050");
await page.fill("#address", "Calle 10 # 20-30 Apto 401");
await page.fill("#city", "Medellín");
await page.selectOption("#department", "Antioquia");
await page.check('input[name="acceptTerms"]');
await page.waitForTimeout(600);
console.log("Envío:", await page.getByTestId("shipping").textContent(), "Total:", await page.getByTestId("total").textContent());
await shot("03-checkout");
await page.getByTestId("pay").click();

// 5. Wompi (simulador en local sin llaves) → aprobado
await page.waitForURL(/simulador|checkout\.wompi\.co/);
if (page.url().includes("simulador")) {
  await page.getByTestId("sim-approve").click();
  await page.waitForURL(/pedido\/resultado/);
  const status = await page.getByTestId("order-status").getAttribute("data-status");
  console.log("Estado del pedido:", status);
  await page.waitForTimeout(500);
  await shot("04-resultado");
} else {
  console.log("Redirigido a Wompi:", page.url().slice(0, 80) + "…");
}

console.log("Eventos GA4:", events.map((e) => e.name).join(", "));
const purchase = events.find((e) => e.name === "purchase");
console.log("purchase:", JSON.stringify(purchase));
await browser.close();
