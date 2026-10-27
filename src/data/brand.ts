/**
 * Fuente única de verdad de la marca. Todo texto de marca que aparezca en la
 * tienda, en metadatos, en el feed de Instagram/Meta o en mensajes de WhatsApp
 * sale de aquí, para mantener coherencia omnicanal con @isariza.sabores.
 */
export const brand = {
  name: "Isariza Sabores",
  shortName: "Isariza",
  promise: "Sabor natural y artesanal",
  headline: "Encurtidos, salsas y sabores que realzan tus momentos",
  closing: "Sabores que cuentan historias",
  giftLine: "El regalo perfecto para los amantes de los sabores auténticos",
  /** Mensaje artesanal que acompaña TODO producto, actual o futuro. */
  artisanStatement:
    "Cada frasco Isariza se prepara a mano, en lotes pequeños, con ingredientes naturales y sin conservantes artificiales. Por eso puede haber ligeras variaciones de color, corte o intensidad entre un lote y otro: es la huella de lo hecho artesanalmente.",
  values: [
    { icon: "leaf", title: "Ingredientes naturales", text: "Vegetales frescos, especias y vinagre. Nada que no reconozcas." },
    { icon: "heart", title: "Hecho artesanalmente", text: "Preparado a mano, en lotes pequeños, frasco por frasco." },
    { icon: "jar", title: "Sin conservantes artificiales", text: "La conservación la hacen el vinagre, la sal y el envasado al vacío." },
  ],
  contact: {
    whatsapp: "573014312088", // formato internacional sin "+"
    phoneDisplay: "301 431 2088",
    instagramHandle: "isariza.sabores",
    instagramUrl: "https://www.instagram.com/isariza.sabores/",
    email: "pedidos@isarizasabores.com", // TODO: reemplazar por el correo real
  },
  hashtag: "#SaboresQueCuentanHistorias",
  currency: "COP",
  country: "CO",
} as const;

export type Brand = typeof brand;
