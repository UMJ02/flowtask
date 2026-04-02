'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { safeInternalRoute } from '@/lib/navigation/routes';
import { registerSchema, type RegisterValues } from '@/lib/validations/auth';
import { AuthFeedbackModal } from '@/components/auth/auth-feedback-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function mapRegisterError(message: string) {
  const value = message.toLowerCase();
  if (value.includes('already registered')) return 'Este correo ya está registrado.';
  return 'No pudimos crear la cuenta. Revisa tus datos e inténtalo de nuevo.';
}

export function RegisterForm({ initialNext }: { initialNext?: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('Cuenta creada correctamente.');
  const nextRoute = safeInternalRoute(initialNext);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch('password');

  const onSubmit = async (values: RegisterValues) => {
    setServerError(null);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
        },
      },
    });

    if (error) {
      setServerError(mapRegisterError(error.message));
      return;
    }

    const hasSession = Boolean(data.session);
    setSuccessMessage(
      hasSession
        ? 'Cuenta creada. Te llevaremos a tu área de trabajo.'
        : 'Cuenta creada. Revisa tu correo antes de iniciar sesión.'
    );
    setSuccessOpen(true);

    if (hasSession) {
      window.setTimeout(() => {
        router.push(nextRoute);
        router.refresh();
      }, 900);
    }
  };

  return (
    <>
      <AuthFeedbackModal
        open={successOpen}
        title="Registro exitoso"
        message={successMessage}
        tone="success"
      />

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Nombre completo</label>
          <Input className="h-12 bg-white/90" placeholder="Tu nombre" {...register('fullName')} />
          {errors.fullName ? <p className="text-sm text-rose-600">{errors.fullName.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Correo</label>
          <Input className="h-12 bg-white/90" type="email" placeholder="correo@empresa.com" {...register('email')} />
          {errors.email ? <p className="text-sm text-rose-600">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-slate-700">Contraseña</label>
            <span className="text-xs text-slate-400">Mínimo 6 caracteres</span>
          </div>
          <Input className="h-12 bg-white/90" type="password" placeholder="••••••••" {...register('password')} />
          <p className="text-xs text-slate-400">
            Usa al menos 6 caracteres. Mezclar letras y números mejora la seguridad.
          </p>
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
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>
    </>
  );
}
