import { cn } from '@/lib/utils/classnames';

export function BrandLoader({ className, label = 'Cargando FlowTask' }: { className?: string; label?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2.5', className)} aria-label={label} role="status">
      <div className="relative h-[72px] w-[72px] overflow-hidden rounded-[24px] border border-emerald-100 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.06)]">
        <div className="absolute inset-3 rounded-[18px] bg-emerald-50" />
        <div className="absolute left-4 top-4 h-3 w-9 rounded-full bg-emerald-100" />
        <div className="absolute left-4 top-9 h-2.5 w-7 rounded-full bg-slate-100" />
        <div className="absolute bottom-4 right-4 h-4 w-4 rounded-full bg-[#16C784]/25" />
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-700/90">{label}</span>
    </div>
  );
}
