'use client';

import { Clock3 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { AuthCooldown } from '@/lib/auth-rate-limit';

type AuthCooldownNoticeProps = {
  cooldown: AuthCooldown | null;
  label?: string;
  onDone?: () => void;
};

function formatRemaining(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function AuthCooldownNotice({ cooldown, label = 'correo', onDone }: AuthCooldownNoticeProps) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!cooldown) {
      setRemaining(0);
      return;
    }
    const update = () => {
      const next = Math.max(Math.ceil((cooldown.until - Date.now()) / 1000), 0);
      setRemaining(next);
      if (next <= 0) onDone?.();
    };
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [cooldown, onDone]);

  const message = useMemo(() => {
    if (!cooldown) return '';
    const attemptText = cooldown.attempts === 1 ? '1 vez' : `${cooldown.attempts} veces`;
    return `Has intentado usar este ${label} ${attemptText}. Esperá ${formatRemaining(remaining)} antes de volver a intentarlo.`;
  }, [cooldown, label, remaining]);

  if (!cooldown || remaining <= 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-amber-700 shadow-sm">
          <Clock3 className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="font-bold">Demasiados intentos por seguridad</p>
          <p className="mt-1 leading-5">{message}</p>
        </div>
      </div>
    </div>
  );
}
