import { heatLabel, type Heat } from "@/data/catalog";
import { ChiliIcon } from "./Icons";

export function HeatMeter({ heat }: { heat: Heat }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-cacao/70" title={`Nivel de picante: ${heatLabel[heat]}`}>
      {[1, 2, 3].map((n) => (
        <ChiliIcon key={n} filled={n <= heat} className={`h-4 w-4 ${n <= heat ? "text-aji" : "text-cacao/25"}`} />
      ))}
      <span className="ml-1">{heatLabel[heat]}</span>
    </span>
  );
}
