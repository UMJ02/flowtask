'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const IDLE_LIMIT_MS = 15 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const;

export function IdleSessionGuard() {
  const router = useRouter();
  const timeoutRef = useRef<number | null>(null);
  const signingOutRef = useRef(false);
  const [warningVisible, setWarningVisible] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const clearTimer = () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const signOutForInactivity = async () => {
      if (signingOutRef.current) return;
      signingOutRef.current = true;
      setWarningVisible(true);
      try {
        window.sessionStorage.setItem('flowtask.session.message', 'Sesión cerrada por inactividad.');
        await supabase.auth.signOut();
      } finally {
        router.replace('/login?reason=idle');
        router.refresh();
      }
    };

    const schedule = () => {
      clearTimer();
      timeoutRef.current = window.setTimeout(() => {
        void signOutForInactivity();
      }, IDLE_LIMIT_MS);
    };

    const onActivity = () => {
      if (signingOutRef.current) return;
      schedule();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') schedule();
    };

    ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, onActivity, { passive: true }));
    document.addEventListener('visibilitychange', onVisibilityChange);
    schedule();

    return () => {
      clearTimer();
      ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, onActivity));
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [router]);

  if (!warningVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[90] max-w-sm rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 shadow-[var(--ft-shadow-float)]">
      Sesión cerrada por inactividad. Redirigiendo al login…
    </div>
  );
}
