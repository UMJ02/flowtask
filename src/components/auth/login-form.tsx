'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { safeInternalRoute } from '@/lib/navigation/routes';
import { loginSchema, type LoginValues } from '@/lib/validations/auth';
import { AuthCooldownNotice } from '@/components/auth/auth-cooldown-notice';
import { AuthFeedbackModal } from '@/components/auth/auth-feedback-modal';
import { AuthPasswordField } from '@/components/auth/auth-password-field';
import { trackEvent } from '@/lib/telemetry/track-event';
import {
  clearAuthCooldown,
  getCooldownSecondsFromMessage,
  isAuthRateLimitMessage,
  readAuthCooldown,
  saveAuthCooldown,
  type AuthCooldown,
} from '@/lib/auth-rate-limit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function mapLoginError(message: string) {
  const value = message.toLowerCase();
  if (isAuthRateLimitMessage(value)) return 'Por seguridad, Supabase bloqueó temporalmente nuevos intentos con este correo.';
  if (value.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (value.includes('email not confirmed')) return 'Tu correo aún no ha sido confirmado.';
  return 'No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo.';
}

export function LoginForm({ initialNext }: { initialNext?: string }) {
  const router = useRouter();
  const nextRoute = useMemo(() => safeInternalRoute(initialNext), [initialNext]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<AuthCooldown | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const isBlocked = Boolean(cooldown && cooldown.until > Date.now());

  const clearFieldFeedback = (field: keyof LoginValues) => {
    clearErrors(field);
    setServerError(null);
  };

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);

    const activeCooldown = readAuthCooldown('login', values.email);
    if (activeCooldown) {
      setCooldown(activeCooldown);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      if (isAuthRateLimitMessage(error.message)) {
        setCooldown(saveAuthCooldown('login', values.email, getCooldownSecondsFromMessage(error.message), 1, 'supabase'));
      }
      setServerError(mapLoginError(error.message));
      return;
    }

    clearAuthCooldown('login', values.email);
    setCooldown(null);
    setSuccessOpen(true);
    void trackEvent({ eventName: 'login', metadata: { next_route: nextRoute } });
    window.setTimeout(() => {
      router.replace(nextRoute);
      router.refresh();
    }, 850);
  };

  const emailRegistration = register('email', {
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      clearFieldFeedback('email');
      setCooldown(readAuthCooldown('login', event.target.value));
    },
  });
  const passwordRegistration = register('password', {
    onChange: () => clearFieldFeedback('password'),
  });

  return (
    <>
      <AuthFeedbackModal
        open={successOpen}
        title="Ingreso exitoso"
        message="Estamos entrando a tu workspace."
        tone="success"
      />

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="login-email">Correo</label>
          <Input
            id="login-email"
            className="h-12 bg-white/90"
            type="email"
            placeholder="correo@empresa.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...emailRegistration}
          />
          {errors.email ? <p className="text-sm text-rose-600">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-slate-700" htmlFor="login-password">Contraseña</label>
            <span className="text-xs text-slate-400">Mínimo 6 caracteres</span>
          </div>
          <AuthPasswordField
            id="login-password"
            className="h-12 bg-white/90"
            placeholder="••••••••"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...passwordRegistration}
          />
          {errors.password ? <p className="text-sm text-rose-600">{errors.password.message}</p> : null}
        </div>

        <AuthCooldownNotice cooldown={cooldown} label="correo" onDone={() => setCooldown(null)} />

        {serverError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {serverError}
          </div>
        ) : null}

        <Button className="h-12 w-full rounded-2xl" disabled={isBlocked} loading={isSubmitting} type="submit">
          {isSubmitting ? 'Validando...' : isBlocked ? 'Intento bloqueado temporalmente' : 'Ingresar'}
        </Button>

        <div className="flex items-center justify-between text-sm text-slate-600">
          <Link href="/forgot-password" className="hover:text-slate-900">Olvidé mi contraseña</Link>
          <Link href="/register" className="hover:text-slate-900">Crear cuenta</Link>
        </div>
      </form>
    </>
  );
}
