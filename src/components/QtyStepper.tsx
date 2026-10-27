"use client";

export function QtyStepper({ value, onChange, small }: { value: number; onChange: (v: number) => void; small?: boolean }) {
  const s = small ? "h-7 w-7 text-sm" : "h-10 w-10";
  return (
    <div className="inline-flex items-center rounded-full border border-cacao/20 bg-white">
      <button type="button" className={`${s} rounded-full text-cacao hover:bg-cacao/5`} onClick={() => onChange(value - 1)} aria-label="Disminuir cantidad">
        −
      </button>
      <span className={`${small ? "w-6 text-sm" : "w-8"} text-center font-semibold tabular-nums`} aria-live="polite">
        {value}
      </span>
      <button type="button" className={`${s} rounded-full text-cacao hover:bg-cacao/5`} onClick={() => onChange(value + 1)} aria-label="Aumentar cantidad">
        +
      </button>
    </div>
  );
}
