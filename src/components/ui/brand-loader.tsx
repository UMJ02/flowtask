'use client';

import { cn } from '@/lib/utils/classnames';

export function BrandLoader({ className, label = 'Cargando FlowTask' }: { className?: string; label?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)} aria-label={label} role="status">
      <div className="brand-loader relative h-20 w-20">
        <span className="brand-loader__orbit brand-loader__orbit--emerald" />
        <span className="brand-loader__orbit brand-loader__orbit--lime" />
        <span className="brand-loader__face">
          <span className="brand-loader__eye brand-loader__eye--left" />
          <span className="brand-loader__eye brand-loader__eye--right" />
          <span className="brand-loader__mouth" />
        </span>
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700/90">{label}</span>
    </div>
  );
}
