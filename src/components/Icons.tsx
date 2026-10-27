type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const LeafIcon = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden>
    <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z" />
    <path d="M5 19 13 11" />
  </svg>
);
export const HeartIcon = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
  </svg>
);
export const JarIcon = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden>
    <rect x="7" y="3" width="10" height="3" rx="1" />
    <path d="M7.5 6h9c1 1.2 1.5 2.5 1.5 4v8a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-8c0-1.5.5-2.8 1.5-4Z" />
    <path d="M10 13.5c.6-.9 2-.9 2 .2 0-1.1 1.4-1.1 2-.2.5.9-2 2.5-2 2.5s-2.5-1.6-2-2.5Z" />
  </svg>
);
export const BagIcon = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);
export const InstagramIcon = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" />
  </svg>
);
export const WhatsappIcon = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden>
    <path d="M4 20l1.3-3.8A8 8 0 1 1 8 19l-4 1Z" />
    <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8c-1-.4-1.9-1.3-2.3-2.3l.8-1-1-2L9 9.5Z" />
  </svg>
);
export const CloseIcon = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const ChiliIcon = ({ className = "h-4 w-4", filled }: P & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" className={className} {...base} fill={filled ? "currentColor" : "none"} aria-hidden>
    <path d="M7 9c-2 5 1 11 9 11 2 0 3-1 1-2-5-2-6-6-6-9H7Z" />
    <path d="M9 9V6c0-1 1-2 3-2" />
  </svg>
);
export const ValueIcon = ({ name, className }: { name: string; className?: string }) =>
  name === "leaf" ? <LeafIcon className={className} /> : name === "heart" ? <HeartIcon className={className} /> : <JarIcon className={className} />;
