'use client';

import React from 'react';
import Script from 'next/script';
import { cn } from '@/lib/utils/classnames';

const DOT_LOTTIE_URL = 'https://lottie.host/d330f33f-f9c7-4347-9c6b-8fb7f567a917/x5oDlXqni0.lottie';
const PLAYER_SCRIPT = 'https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.10/dist/dotlottie-wc.js';

export function BrandLoader({ className, label = 'Cargando FlowTask' }: { className?: string; label?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center', className)} aria-label={label} role="status">
      <Script src={PLAYER_SCRIPT} type="module" strategy="beforeInteractive" />
      <div className="brand-loader relative flex h-[110px] w-[110px] items-center justify-center md:h-[132px] md:w-[132px]">
        {React.createElement('dotlottie-wc' as any, {
          src: DOT_LOTTIE_URL,
          autoplay: true,
          loop: true,
          style: { width: '100%', height: '100%' },
          'aria-hidden': 'true',
        })}
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
