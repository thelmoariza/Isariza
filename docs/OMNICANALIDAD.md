# Omnicanalidad Tienda ↔ Instagram ↔ WhatsApp

**Principio:** el cliente ve el mismo producto, el mismo nombre, la misma foto, el mismo precio y el mismo mensaje artesanal en Instagram (@isariza.sabores), en la tienda y en WhatsApp (301 431 2088). La fuente única es `src/data/brand.ts` + `src/data/catalog.ts`.

## 1. Mensajes de marca (usar textual en todos los canales)

| Uso | Texto |
|---|---|
| Promesa | **Sabor natural y artesanal** |
| Titular | Encurtidos, salsas y sabores que realzan tus momentos |
| Cierre / firma | Sabores que cuentan historias |
| Caja Especial | El regalo perfecto para los amantes de los sabores auténticos |
| Valores | Ingredientes naturales · Hecho artesanalmente · Sin conservantes artificiales |
| Hashtag | #SaboresQueCuentanHistorias |
| Mensaje artesanal (todo SKU nuevo) | Preparado a mano, en lotes pequeños… puede haber ligeras variaciones entre lotes: es la huella de lo hecho artesanalmente. |

**Frases por producto** (idénticas en caption de Instagram y ficha):
- Chimichurri — El sabor perfecto para tus carnes, parrillas y recetas favoritas.
- Pepinos encurtidos — Crujientes, frescos y con el toque ideal de especias.
- Ají Picante — El picante justo para darle vida a tus platos.
- Cebolla y Ají encurtidos — El equilibrio perfecto entre lo fresco y lo picante.

**Lanzamiento de un SKU nuevo:** se crea primero en `catalog.ts` (nombre, tagline, foto, precio) → se despliega → el feed actualiza Instagram Shopping → se publica el post/reel usando exactamente el `tagline` y etiquetando el producto.

## 2. Instagram Shopping (catálogo sincronizado)
1. Convierte @isariza.sabores en cuenta **profesional** vinculada a una página de Facebook.
2. En **Meta Commerce Manager** crea un catálogo → *Fuentes de datos* → **Feed programado** → URL: `https://<tu-dominio>/api/feed/meta` (diario).
3. Verifica el dominio de la tienda en Meta Business y solicita la revisión de Shopping.
4. Activa **etiquetas de productos** en posts, reels e historias. Cada etiqueta lleva a la ficha con `utm_source=instagram&utm_medium=shopping&utm_content=<SKU>`.

El feed publica por SKU: id, grupo (sabor), título, descripción con el mensaje artesanal, precio COP, precio tachado de la Caja, foto, disponibilidad y etiquetas `artesanal` + categoría.

## 3. Convención de enlaces (UTMs)
`https://<dominio>/<ruta>?utm_source=instagram&utm_medium=<medio>&utm_campaign=<campaña>&utm_content=<pieza>`

| Lugar | utm_medium | Enlace sugerido |
|---|---|---|
| Link en bio | `bio` | `/?utm_source=instagram&utm_medium=bio&utm_campaign=siempre` |
| Historia con sticker de enlace | `story` | `/producto/caja-especial?utm_source=instagram&utm_medium=story&utm_campaign=regalos` |
| Reel / post (en caption o etiqueta) | `reel` / `post` | `/producto/aji-picante?utm_source=instagram&utm_medium=reel&utm_campaign=recetas&utm_content=reel-empanadas-01` |
| Respuesta por DM | `dm` | `/tienda?utm_source=instagram&utm_medium=dm&utm_campaign=atencion` |

Helper en código: `instagramLink(path, medium, campaign, content)` en `src/lib/omnichannel.ts`.

## 4. Puntos de contacto implementados en la tienda
- Ícono de Instagram en header y footer; sección **Comunidad** en home con invitación a etiquetar y usar el hashtag.
- Ficha de producto: “Mira recetas con este producto en @isariza.sabores”.
- Confirmación de compra: invitación a compartir el plato en Instagram (genera contenido UGC).
- **WhatsApp**: botón flotante, “¿Prefieres pedir por WhatsApp?” en cada ficha (mensaje prellenado con producto y tamaño), y “Enviar pedido por WhatsApp” en el carrito con el resumen completo — mismo número del flyer (301 431 2088).
- Panel `/admin/pedidos`: origen de cada pedido y botón para escribir al cliente por WhatsApp.
- Metadatos Open Graph para que los enlaces compartidos en Instagram/WhatsApp muestren foto y texto de marca.

## 5. Destacadas sugeridas en el perfil
`Tienda` (link y cómo comprar) · `Caja Especial` · `Recetas` (por sabor) · `Proceso` (hecho a mano) · `Envíos` (tarifas y tiempos iguales a /politicas) · `Clientes` (UGC con #SaboresQueCuentanHistorias).

## 6. Calendario base
| Día | Formato | Contenido | Enlace |
|---|---|---|---|
| Lunes | Reel | Receta corta con un sabor | ficha del sabor, `reel` |
| Miércoles | Carrusel | Proceso artesanal / lote de la semana | `/nosotros`, `post` |
| Viernes | Historia | “Para el asado del finde”: Chimichurri + Cebolla y Ají | `/tienda`, `story` |
| Domingo | Historia | Repost de clientes (UGC) | `/`, `story` |
| Fechas especiales | Post + Historia | Caja Especial como regalo | `/producto/caja-especial` |
