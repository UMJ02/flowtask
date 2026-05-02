'use client';

import { FormEvent, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ResendStatus = 'idle' | 'loading' | 'success' | 'error';

function mapResendError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('rate limit') || normalized.includes('too many')) {
    return 'Por seguridad, espera unos minutos antes de solicitar otro correo.';
  }

  if (normalized.includes('email')) {
    return 'Revisa que el correo esté escrito correctamente.';
  }

  return 'No pudimos reenviar el correo en este momento. Intenta de nuevo más tarde.';
}

export function ResendConfirmationForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<ResendStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setStatus('error');
      setMessage('Escribe el correo con el que creaste tu cuenta.');
      return;
    }

    setStatus('loading');
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error) {
      setStatus('error');
      setMessage(mapResendError(error.message));
      return;
    }

    setStatus('success');
    setMessage('Listo. Te enviamos un nuevo correo de confirmación.');
  };

  return (
    <form className="space-y-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_42px_rgba(15,23,42,0.06)]" onSubmit={handleSubmit}>
      <div className="space-y-2 text-left">
        <label className="text-sm font-semibold text-slate-700">Reenviar correo de confirmación</label>
        <Input
          className="h-12 bg-white"
          inputMode="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="correo@empresa.com"
          type="email"
          value={email}
        />
      </div>

      {message ? (
        <div
          className={
            status === 'success'
              ? 'rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800'
              : 'rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700'
          }
        >
          {message}
        </div>
      ) : null}

      <Button className="h-12 w-full rounded-2xl" loading={status === 'loading'} type="submit">
        {status === 'loading' ? 'Reenviando...' : 'Reenviar correo'}
      </Button>
    </form>
  );
}
