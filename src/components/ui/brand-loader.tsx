'use client';

import React from 'react';
import Script from 'next/script';
import { cn } from '@/lib/utils/classnames';

const DOT_LOTTIE_URL = 'https://lottie.host/44112b9f-b4cc-4e20-9b1e-c51024c6cb86/uKPykOaSqS.lottie';
const PLAYER_SCRIPT = 'https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs';

export function BrandLoader({ className, label = 'Cargando FlowTask' }: { className?: string; label?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2.5', className)} aria-label={label} role="status">
      <Script src={PLAYER_SCRIPT} type="module" strategy="afterInteractive" />
      <div className="brand-loader relative h-[88px] w-[88px] overflow-hidden rounded-[28px] border border-emerald-100/80 bg-white/92 shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
        {React.createElement('dotlottie-player' as any, {
          src: DOT_LOTTIE_URL,
          autoplay: true,
          loop: true,
          style: { width: '100%', height: '100%' },
          speed: '1',
          renderer: 'svg',
          'aria-hidden': 'true',
        })}
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-700/90">{label}</span>
    </div>
  );
}
