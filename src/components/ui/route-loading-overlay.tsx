'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LoadingState } from '@/components/ui/loading-state';

const MIN_VISIBLE_MS = 6000;
const FADE_OUT_MS = 360;

export function RouteLoadingOverlay() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (fadeRef.current) clearTimeout(fadeRef.current);

    setVisible(true);
    setLeaving(false);

    timeoutRef.current = setTimeout(() => {
      setLeaving(true);
      fadeRef.current = setTimeout(() => {
        setVisible(false);
      }, FADE_OUT_MS);
    }, mountedRef.current ? MIN_VISIBLE_MS : MIN_VISIBLE_MS);

    mountedRef.current = true;

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (fadeRef.current) clearTimeout(fadeRef.current);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className={leaving ? 'route-loader-leaving' : ''}>
      <LoadingState
        title="Preparando tu espacio…"
        description="Cargando tarjetas, listas y accesos rápidos para que todo aparezca de una forma más fluida."
        cards={3}
      />
    </div>
  );
}
