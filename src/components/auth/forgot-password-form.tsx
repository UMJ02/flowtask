'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/lib/validations/auth';
import { AuthFeedbackModal } from '@/components/auth/auth-feedback-modal';
import { ActionFeedback } from '@/components/ui/action-feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function mapForgotError(message: string) {
  const value = message.toLowerCase();
  if (value.includes('for security purposes')) return 'Si el correo existe, te enviaremos un enlace seguro para restablecer tu contraseña.';
  return 'No pudimos procesar tu solicitud. Inténtalo de nuevo en un momento.';
}

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setServerError(null);
    setStatusMessage('Procesando solicitud…');
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo,
    });

    if (error) {
      setStatusMessage(null);
      setServerError(mapForgotError(error.message));
      return;
    }

    setStatusMessage(null);
    setSuccessOpen(true);
  };

  return (
    <>
      <AuthFeedbackModal
        open={successOpen}
        title="Correo enviado"
        message="Si el correo existe, recibirás un enlace seguro para cambiar tu contraseña."
        tone="success"
        icon="mail"
      />

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {statusMessage ? <ActionFeedback tone="loading" message={statusMessage} /> : null}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Correo</label>
          <Input className="h-12 bg-white/90" type="email" placeholder="correo@empresa.com" {...register('email')} />
          <p className="text-xs text-slate-400">Te enviaremos un enlace para restablecer tu contraseña.</p>
          {errors.email ? <p className="text-sm text-rose-600">{errors.email.message}</p> : null}
        </div>

        {serverError ? <ActionFeedback tone="error" message={serverError} /> : null}

        <Button className="h-12 w-full rounded-2xl" loading={isSubmitting} type="submit">
          {isSubmitting ? 'Enviando...' : 'Enviar correo'}
        </Button>

        <div className="text-center text-sm text-slate-500">
          <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Volver a iniciar sesión
          </Link>
        </div>
      </form>
    </>
  );
}
