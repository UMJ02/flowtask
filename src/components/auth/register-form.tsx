'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { registerSchema, type RegisterValues } from '@/lib/validations/auth';
import { AuthFeedbackModal } from '@/components/auth/auth-feedback-modal';
import { ActionFeedback } from '@/components/ui/action-feedback';
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
  const [modalStep, setModalStep] = useState<'idle' | 'created' | 'redirecting'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch('password');

  useEffect(() => {
    if (modalStep !== 'created') return;
    const first = window.setTimeout(() => setModalStep('redirecting'), 5000);
    const second = window.setTimeout(() => {
      router.push(initialNext ? `/login?next=${encodeURIComponent(initialNext)}` : '/login');
      router.refresh();
    }, 10000);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [modalStep, router, initialNext]);

  const onSubmit = async (values: RegisterValues) => {
    setServerError(null);
    setStatusMessage('Procesando solicitud…');
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
        },
      },
    });

    if (error) {
      setStatusMessage(null);
      setServerError(mapRegisterError(error.message));
      return;
    }

    setStatusMessage(null);
    setModalStep('created');
  };

  return (
    <>
      <AuthFeedbackModal
        open={modalStep === 'created'}
        title="Registro exitoso"
        message="Cuenta creada. Revisa tu correo y confirma para continuar."
        tone="success"
        icon="mail"
      />
      <AuthFeedbackModal
        open={modalStep === 'redirecting'}
        title="Siguiente paso"
        message="Mientras confirmas, te enviamos a la página de inicio de sesión."
        tone="success"
      />

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {statusMessage ? <ActionFeedback tone="loading" message={statusMessage} /> : null}
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

        {serverError ? <ActionFeedback tone="error" message={serverError} /> : null}

        <Button className="h-12 w-full rounded-2xl" loading={isSubmitting} type="submit">
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>

        <div className="text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link href={initialNext ? `/login?next=${encodeURIComponent(initialNext)}` : '/login'} className="font-semibold text-emerald-700 hover:text-emerald-800">
            Iniciar sesión
          </Link>
        </div>
      </form>
    </>
  );
}
