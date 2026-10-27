# Plan de medición GA4 · Isariza Sabores

## Configuración
1. Crea una propiedad GA4 (zona horaria **Bogotá**, moneda **COP**) y un flujo web con la URL de la tienda.
2. Copia el ID `G-XXXXXXXXXX` en `NEXT_PUBLIC_GA_MEASUREMENT_ID` (local: `.env.local`; AWS: variable de GitHub `GA_MEASUREMENT_ID`).
3. En **Medición mejorada** desactiva “Cambios del historial de navegación” (la tienda envía `page_view` manual en cada navegación para no duplicar).
4. Marca como **eventos clave**: `purchase`, `begin_checkout`, `click_whatsapp`.
5. Crea dimensiones personalizadas (ámbito evento): `location`, `item_list_name`, `payment_type`, `shipping_tier`.
6. Enlaza GA4 con **Google Ads** y **Search Console** si los usas.
7. Verifica en **DebugView** (extensión *Google Analytics Debugger*). En `npm run dev` cada evento también se imprime en la consola como `[ga4]`.

## Eventos implementados

| Evento | Dónde se dispara | Parámetros clave |
|---|---|---|
| `page_view` | Cada navegación | page_path, page_location |
| `view_item_list` | Home, tienda (por categoría) | item_list_name, items |
| `select_item` | Clic en tarjeta de producto | item_list_name, items |
| `view_item` | Ficha de producto (y al cambiar tamaño) | items[sku, size, price] |
| `add_to_cart` | Botones “Agregar”, +1 en carrito | items, value |
| `remove_from_cart` | −1 / Quitar | items, value |
| `view_cart` | Abrir canasta o /carrito | items, value |
| `begin_checkout` | Entrar a /checkout | items, value |
| `add_shipping_info` | Formulario válido enviado | shipping_tier |
| `add_payment_info` | Pedido creado, antes de ir a Wompi | payment_type=wompi, transaction_id |
| `purchase` | /pedido/resultado con pago **APPROVED**, una sola vez por referencia | transaction_id (ref. ISZ-…), value, shipping, items |
| `click_instagram` | Header, ficha, sección comunidad, confirmación | location |
| `click_whatsapp` | Botón flotante, ficha, carrito, confirmación | location, item_id/value |

`item_id` = **SKU** (ej. `ISZ-CHI-250`), igual al `id` del catálogo de Instagram, para poder cruzar ventas por canal y producto.

## Atribución Instagram
- Los enlaces publicados en Instagram llevan UTMs (`utm_source=instagram&utm_medium=bio|story|reel|post|dm|shopping`). GA4 los toma automáticamente.
- Además, la tienda guarda la primera atribución en el navegador y la **adjunta al pedido** (campo `attribution`), y el `client_id` de GA4 (`gaClientId`). En `/admin/pedidos` ves el % de ventas aprobadas que vienen de Instagram, aun si GA4 está bloqueado por el navegador.

## Reportes sugeridos
- **Explorar → Embudo**: view_item → add_to_cart → begin_checkout → add_payment_info → purchase, desglosado por `session_source_medium`.
- **Monetización → Compras de comercio electrónico** por `item_id` / `item_variant` (250 vs 110 gr vs Caja).
- Comparativo `instagram / reel` vs `instagram / story` vs `instagram / bio` en ingresos.
