'use client';

import { cn } from '@/lib/utils/classnames';
import { LottieLoader } from '@/components/ui/lottie-loader';

export function BrandLoader({ className, label = 'Cargando FlowTask' }: { className?: string; label?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)} aria-label={label} role="status">
      <LottieLoader size={220} />
      <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</span>
    </div>
  );
}
