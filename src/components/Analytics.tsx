"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { GA_ID } from "@/lib/analytics";

function PageViews() {
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    if (!GA_ID || !window.gtag) return;
    const qs = search?.toString();
    window.gtag("event", "page_view", {
      page_path: pathname + (qs ? `?${qs}` : ""),
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, search]);
  return null;
}

/** Delegación: cualquier elemento con data-ga="evento" (y data-ga-location) envía ese evento. */
function ClickTracking() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-ga]");
      if (!el || !window.gtag) return;
      window.gtag("event", el.dataset.ga, { location: el.dataset.gaLocation ?? window.location.pathname, link_url: (el as HTMLAnchorElement).href });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}

/**
 * Carga gtag.js (Consent Mode v2: analítica concedida, publicidad denegada por
 * defecto — ajústalo a tu política). page_view se envía en cada navegación.
 */
export function Analytics() {
  if (!GA_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <ClickTracking />
      <Suspense fallback={null}>
        <PageViews />
      </Suspense>
    </>
  );
}
