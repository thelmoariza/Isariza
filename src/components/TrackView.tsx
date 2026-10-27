"use client";

import { useEffect, useRef } from "react";
import { ecommerce, type GaItem } from "@/lib/analytics";

/** Dispara un evento GA4 de ecommerce una sola vez al montar (view_item, view_item_list…). */
export function TrackView({ event, items, extra }: { event: string; items: GaItem[]; extra?: Record<string, unknown> }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    ecommerce(event, items, extra);
  }, [event, items, extra]);
  return null;
}
