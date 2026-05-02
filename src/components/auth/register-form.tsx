'use client';

import { PublicTransitionLink } from '@/components/public/public-transition-link';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { registerSchema, type RegisterValues } from '@/lib/validations/auth';
import { AuthCooldownNotice } from '@/components/auth/auth-cooldown-notice';
import { AuthFeedbackModal } from '@/components/auth/auth-feedback-modal';
import { AuthPasswordField } from '@/components/auth/auth-password-field';
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

function mapRegisterError(message: string) {
  const value = message.toLowerCase();
  if (isAuthRateLimitMessage(value)) return 'Por seguridad, el envío de correos fue pausado temporalmente para este correo.';
  if (value.includes('already registered')) return 'Este correo ya está registrado.';
  return 'No pudimos crear la cuenta. Revisa tus datos e inténtalo de nuevo.';
}

export function RegisterForm({ initialNext }: { initialNext?: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<AuthCooldown | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');
  const isBlocked = Boolean(cooldown && cooldown.until > Date.now());

  useEffect(() => {
    if (!successOpen) return;
    const timeout = window.setTimeout(() => {
      router.push(initialNext ? `/login?next=${encodeURIComponent(initialNext)}` : '/login');
      router.refresh();
    }, 6500);
    return () => window.clearTimeout(timeout);
  }, [successOpen, router, initialNext]);

  const clearFieldFeedback = (field: keyof RegisterValues) => {
    clearErrors(field);
    setServerError(null);
  };

  const onSubmit = async (values: RegisterValues) => {
    setServerError(null);

    const activeCooldown = readAuthCooldown('register', values.email);
    if (activeCooldown) {
      setCooldown(activeCooldown);
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: {
          full_name: values.fullName,
        },
      },
    });

    if (error) {
      if (isAuthRateLimitMessage(error.message)) {
        setCooldown(saveAuthCooldown('register', values.email, getCooldownSecondsFromMessage(error.message), 1, 'supabase'));
      }
      setServerError(mapRegisterError(error.message));
      return;
    }

    clearAuthCooldown('register', values.email);
    setCooldown(null);
    reset({ fullName: '', email: '', password: '', confirmPassword: '' });
    setSuccessOpen(true);
  };

  const fullNameRegistration = register('fullName', {
    onChange: () => clearFieldFeedback('fullName'),
  });
  const emailRegistration = register('email', {
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      clearFieldFeedback('email');
      setCooldown(readAuthCooldown('register', event.target.value));
    },
  });
  const passwordRegistration = register('password', {
    onChange: () => clearFieldFeedback('password'),
  });
  const confirmPasswordRegistration = register('confirmPassword', {
    onChange: () => clearFieldFeedback('confirmPassword'),
  });

  return (
    <>
      <AuthFeedbackModal
        open={successOpen}
        title="Revisa tu correo"
        message="Te enviamos un enlace para confirmar tu cuenta. Después de validarla, vas a poder iniciar sesión desde el login."
        tone="success"
        icon="mail"
      />

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="register-full-name">Nombre completo</label>
          <Input
            id="register-full-name"
            className="h-12 bg-white/90"
            placeholder="Tu nombre"
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            {...fullNameRegistration}
          />
          {errors.fullName ? <p className="text-sm text-rose-600">{errors.fullName.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="register-email">Correo</label>
          <Input
            id="register-email"
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
            <label className="text-sm font-medium text-slate-700" htmlFor="register-password">Contraseña</label>
            <span className="text-xs text-slate-400">Mínimo 6 caracteres</span>
          </div>
          <AuthPasswordField
            id="register-password"
            className="h-12 bg-white/90"
            placeholder="••••••••"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            {...passwordRegistration}
          />
          <p className="text-xs text-slate-400">
            Usa al menos 6 caracteres. Mezclar letras y números mejora la seguridad.
          </p>
          {errors.password ? <p className="text-sm text-rose-600">{errors.password.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="register-confirm-password">Confirmar contraseña</label>
          <AuthPasswordField
            id="register-confirm-password"
            className="h-12 bg-white/90"
            placeholder="••••••••"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...confirmPasswordRegistration}
          />
          {!errors.confirmPassword && passwordValue ? (
            <p className="text-xs text-slate-400">Confirma exactamente la misma contraseña.</p>
          ) : null}
          {errors.confirmPassword ? <p className="text-sm text-rose-600">{errors.confirmPassword.message}</p> : null}
        </div>

        <AuthCooldownNotice cooldown={cooldown} label="correo" onDone={() => setCooldown(null)} />

        {serverError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {serverError}
          </div>
        ) : null}

        <Button className="h-12 w-full rounded-2xl" disabled={isBlocked} loading={isSubmitting} type="submit">
          {isSubmitting ? 'Creando cuenta...' : isBlocked ? 'Intento bloqueado temporalmente' : 'Crear cuenta'}
        </Button>

        <div className="text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <PublicTransitionLink href={initialNext ? `/login?next=${encodeURIComponent(initialNext)}` : '/login'} className="font-semibold text-emerald-700 hover:text-emerald-800" title="Cargando ingreso…">
            Iniciar sesión
          </PublicTransitionLink>
        </div>
      </form>
    </>
  );
}
