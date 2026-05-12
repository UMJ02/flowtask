'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type AuthRedirectCountdownProps = {
  seconds?: number;
  href?: string;
};

export function AuthRedirectCountdown({ seconds = 5, href = '/login' }: AuthRedirectCountdownProps) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemaining((current) => Math.max(current - 1, 0));
    }, 1000);

    const timeout = window.setTimeout(() => {
      router.replace(href);
      router.refresh();
    }, seconds * 1000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [href, router, seconds]);

  return (
    <div className="space-y-4 text-center">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
        Redirigiendo al inicio de sesión en <span className="font-bold">{remaining}</span>s.
      </div>
      <Button className="h-10 w-full rounded-2xl bg-[#16C784] text-slate-950 hover:bg-[#12b876]" onClick={() => router.replace(href)} type="button">
        Ir al login ahora
      </Button>
    </div>
  );
}
