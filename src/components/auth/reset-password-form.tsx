'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { resetPasswordSchema, type ResetPasswordValues } from '@/lib/validations/auth';
import { AuthFeedbackModal } from '@/components/auth/auth-feedback-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function mapResetError(message: string) {
  const value = message.toLowerCase();
  if (value.includes('same password')) return 'La nueva contraseña debe ser diferente a la anterior.';
  return 'No pudimos actualizar tu contraseña. Inténtalo de nuevo con un enlace vigente.';
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const passwordValue = watch('password');

  const onSubmit = async (values: ResetPasswordValues) => {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      setServerError(mapResetError(error.message));
      return;
    }

    setSuccessOpen(true);
    window.setTimeout(() => {
      router.push('/login');
      router.refresh();
    }, 1200);
  };

  return (
    <>
      <AuthFeedbackModal
        open={successOpen}
        title="Contraseña actualizada"
        message="Tu acceso se actualizó correctamente. Te llevaremos al inicio de sesión."
        tone="success"
      />

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-slate-700">Nueva contraseña</label>
            <span className="text-xs text-slate-400">Mínimo 6 caracteres</span>
          </div>
          <Input className="h-12 bg-white/90" type="password" placeholder="••••••••" {...register('password')} />
          <p className="text-xs text-slate-400">Usa una contraseña segura y diferente a la anterior.</p>
          {errors.password ? <p className="text-sm text-rose-600">{errors.password.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Confirmar contraseña</label>
          <Input className="h-12 bg-white/90" type="password" placeholder="••••••••" {...register('confirmPassword')} />
          {!errors.confirmPassword && passwordValue ? (
            <p className="text-xs text-slate-400">Confirma exactamente la misma contraseña.</p>
          ) : null}
          {errors.confirmPassword ? <p className="text-sm text-rose-600">{errors.confirmPassword.message}</p> : null}
        </div>

        {serverError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {serverError}
          </div>
        ) : null}

        <Button className="h-12 w-full rounded-2xl" loading={isSubmitting} type="submit">
          {isSubmitting ? 'Guardando...' : 'Guardar nueva contraseña'}
        </Button>
      </form>
    </>
  );
}
