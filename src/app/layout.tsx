import type { Metadata, Viewport } from "next";
import "./globals.css";
import { brand } from "@/data/brand";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { WhatsappFloat } from "@/components/WhatsappFloat";
import { Analytics } from "@/components/Analytics";
import { gaInitSnippet } from "@/lib/ga-snippet";
import { siteUrl } from "@/lib/site";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${brand.name} · ${brand.promise}`, template: `%s · ${brand.name}` },
  description: `${brand.headline}. Chimichurri, ají picante, pepinos y cebolla encurtida hechos a mano, sin conservantes artificiales. Compra en línea con envío a toda Colombia.`,
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: brand.name,
    images: [{ url: "/img/flyer-isariza.jpg", width: 843, height: 1264, alt: brand.name }],
  },
  other: { "instagram:site": `@${brand.contact.instagramHandle}` },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#56663A" };

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: brand.name,
  url: siteUrl,
  logo: `${siteUrl}/img/products/logo.jpg`,
  slogan: brand.promise,
  sameAs: [brand.contact.instagramUrl],
  contactPoint: { "@type": "ContactPoint", telephone: `+${brand.contact.whatsapp}`, contactType: "sales", areaServed: "CO", availableLanguage: "es" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Cormorant+Garamond:wght@500;600;700&family=Lato:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {GA_ID && <script dangerouslySetInnerHTML={{ __html: gaInitSnippet(GA_ID) }} />}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </head>
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsappFloat />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
