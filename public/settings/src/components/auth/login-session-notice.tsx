'use client';

import { useEffect, useState } from 'react';

export function LoginSessionNotice({ reason }: { reason?: string }) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (reason === 'idle') {
      setMessage('Sesión cerrada por inactividad por seguridad.');
      window.sessionStorage.removeItem('flowtask.session.message');
      return;
    }
    if (reason === 'account-delete') {
      setMessage('La solicitud de eliminación de cuenta fue registrada.');
      return;
    }
    const stored = window.sessionStorage.getItem('flowtask.session.message');
    if (stored) {
      setMessage(stored);
      window.sessionStorage.removeItem('flowtask.session.message');
    }
  }, [reason]);

  if (!message) return null;

  return (
    <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
      {message}
    </div>
  );
}
