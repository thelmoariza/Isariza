import { brand } from "@/data/brand";
import { HeartIcon } from "./Icons";

/** Mensaje artesanal obligatorio en toda ficha de producto (actual o futuro). */
export function ArtisanNote({ compact }: { compact?: boolean }) {
  return (
    <div className={`flex gap-3 rounded-xl border border-dashed border-oliva/50 bg-oliva-100/60 ${compact ? "p-3" : "p-4"}`}>
      <HeartIcon className="mt-0.5 h-5 w-5 shrink-0 text-aji" />
      <div>
        <p className="font-script text-xl leading-none text-oliva-700">Hecho a mano, frasco por frasco</p>
        {!compact && <p className="mt-1 text-sm text-cacao/80">{brand.artisanStatement}</p>}
      </div>
    </div>
  );
}
