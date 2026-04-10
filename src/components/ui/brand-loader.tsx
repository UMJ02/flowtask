'use client';

import { cn } from '@/lib/utils/classnames';

export function BrandLoader({ className, label = 'Cargando FlowTask' }: { className?: string; label?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)} aria-label={label} role="status">
      <div className="brand-loader relative h-[116px] w-[116px]" aria-hidden="true">
        <div className="brand-loader__halo brand-loader__halo--teal" />
        <div className="brand-loader__halo brand-loader__halo--violet" />
        <div className="brand-loader__surface">
          <div className="brand-loader__orbit brand-loader__orbit--left" />
          <div className="brand-loader__orbit brand-loader__orbit--right" />
          <div className="brand-loader__smile">
            <span className="brand-loader__spark brand-loader__spark--left" />
            <span className="brand-loader__spark brand-loader__spark--right" />
          </div>
        </div>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-700/90">{label}</span>
    </div>
  );
}
