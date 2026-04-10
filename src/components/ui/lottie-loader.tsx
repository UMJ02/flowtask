'use client';

import { createElement } from 'react';
import { cn } from '@/lib/utils/classnames';

export function LottieLoader({
  className,
  size = 260,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <>
      <script type="module" src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.10/dist/dotlottie-wc.js" />
      <div className={cn('flex items-center justify-center', className)} aria-hidden="true">
        {createElement('dotlottie-wc' as any, {
          src: 'https://lottie.host/d330f33f-f9c7-4347-9c6b-8fb7f567a917/x5oDlXqni0.lottie',
          autoplay: true,
          loop: true,
          style: { width: `${size}px`, height: `${size}px` },
        })}
      </div>
    </>
  );
}
