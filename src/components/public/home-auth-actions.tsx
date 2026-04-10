'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function HomeAuthActions() {
  const router = useRouter();
  const [target, setTarget] = useState<'login' | 'register' | null>(null);

  const navigate = (path: '/login' | '/register', next: 'login' | 'register') => {
    setTarget(next);
    router.push(path);
  };

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Button className="rounded-2xl px-5 py-3" loading={target === 'login'} onClick={() => navigate('/login', 'login')}>
        {target === 'login' ? 'Abriendo...' : 'Iniciar sesión'}
      </Button>
      <Button variant="secondary" className="rounded-2xl bg-white/88 px-5 py-3" loading={target === 'register'} onClick={() => navigate('/register', 'register')}>
        {target === 'register' ? 'Preparando...' : 'Crear cuenta'}
      </Button>
    </div>
  );
}
