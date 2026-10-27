/** Inicialización de gtag: se inserta en <head> y corre antes de la hidratación. */
export function gaInitSnippet(id: string) {
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
gtag('js',new Date());gtag('config','${id.replace(/[^A-Z0-9-]/gi, "")}',{send_page_view:false,currency:'COP'});`;
}
