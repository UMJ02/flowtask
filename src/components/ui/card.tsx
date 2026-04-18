import { cn } from "@/lib/utils/classnames";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-[20px] border border-slate-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.98))] p-3 shadow-[0_14px_34px_rgba(15,23,42,0.05)] ring-1 ring-white/90 backdrop-blur md:p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
