import Image from 'next/image';
import { cn } from '@/lib/utils/classnames';

export function BrandLoader({ className, label = 'Cargando FlowTask' }: { className?: string; label?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)} aria-label={label} role="status">
      <div className="relative grid h-[76px] w-[76px] place-items-center rounded-[18px] border border-slate-200/80 bg-white">
        <span className="absolute inset-0 rounded-[18px] bg-[radial-gradient(circle_at_30%_20%,rgba(22,199,132,0.12),transparent_52%)]" aria-hidden />
        <Image src="/icons/icon.png" alt="" width={46} height={46} className="relative h-[46px] w-[46px] object-contain" priority />
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</span>
    </div>
  );
}
