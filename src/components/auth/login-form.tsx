'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { safeInternalRoute } from '@/lib/navigation/routes';
import { loginSchema, type LoginValues } from '@/lib/validations/auth';
import { AuthFeedbackModal } from '@/components/auth/auth-feedback-modal';
import { trackEvent } from '@/lib/telemetry/track-event';
import { ActionFeedback } from '@/components/ui/action-feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function mapLoginError(message: string) {
  const value = message.toLowerCase();
  if (value.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (value.includes('email not confirmed')) return 'Tu correo aún no ha sido confirmado.';
  return 'No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo.';
}

export function LoginForm({ initialNext }: { initialNext?: string }) {
  const router = useRouter();
  const nextRoute = useMemo(() => safeInternalRoute(initialNext), [initialNext]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    setStatusMessage('Procesando solicitud…');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setStatusMessage(null);
      setServerError(mapLoginError(error.message));
      return;
    }

    setStatusMessage(null);
    setSuccessOpen(true);
    void trackEvent({ eventName: "login", metadata: { next_route: nextRoute } });
    window.setTimeout(() => {
      router.replace(nextRoute);
      router.refresh();
    }, 850);
  };

  return (
    <>
      <AuthFeedbackModal
        open={successOpen}
        title="Ingreso exitoso"
        message="Estamos entrando a tu workspace."
        tone="success"
      />

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {statusMessage ? <ActionFeedback tone="loading" message={statusMessage} /> : null}
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
          {errors.password ? <p className="text-sm text-rose-600">{errors.password.message}</p> : null}
        </div>

        {serverError ? <ActionFeedback tone="error" message={serverError} /> : null}

        <Button className="h-12 w-full rounded-2xl" loading={isSubmitting} type="submit">
          {isSubmitting ? 'Validando...' : 'Ingresar'}
        </Button>

        <div className="flex items-center justify-between text-sm text-slate-600">
          <Link href="/forgot-password" className="hover:text-slate-900">Olvidé mi contraseña</Link>
          <Link href="/register" className="hover:text-slate-900">Crear cuenta</Link>
        </div>
      </form>
    </>
  );
}
