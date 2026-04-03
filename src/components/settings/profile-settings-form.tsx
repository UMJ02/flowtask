'use client';

import { useMemo, useState } from 'react';
import { KeyRound, Save, UserCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function getInitials(name: string, email: string) {
  const source = name?.trim() || email?.trim() || 'U';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function ProfileSettingsForm({
  initialFullName,
  email,
  initialAvatarUrl,
}: {
  initialFullName?: string | null;
  email: string;
  initialAvatarUrl?: string | null;
}) {
  const [fullName, setFullName] = useState(initialFullName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingIdentity, setSavingIdentity] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [identityMessage, setIdentityMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const initials = useMemo(() => getInitials(fullName, email), [fullName, email]);

  const handleIdentitySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingIdentity(true);
    setIdentityMessage(null);
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      setSavingIdentity(false);
      setIdentityMessage('No pudimos identificar tu sesión.');
      return;
    }

    const nextFullName = fullName.trim() || null;
    const nextAvatarUrl = avatarUrl.trim() || null;

    const [profileRes, authRes] = await Promise.all([
      supabase.from('profiles').update({ full_name: nextFullName, avatar_url: nextAvatarUrl }).eq('id', user.id),
      supabase.auth.updateUser({
        data: {
          full_name: nextFullName ?? '',
          avatar_url: nextAvatarUrl ?? '',
        },
      }),
    ]);

    setSavingIdentity(false);
    setIdentityMessage(profileRes.error || authRes.error ? 'No se pudieron guardar los datos del perfil.' : 'Perfil actualizado correctamente.');
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage(null);

    if (password.length < 6) {
      setPasswordMessage('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMessage('La confirmación de contraseña no coincide.');
      return;
    }

    setSavingPassword(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setSavingPassword(false);

    if (error) {
      setPasswordMessage('No se pudo actualizar la contraseña.');
      return;
    }

    setPassword('');
    setConfirmPassword('');
    setPasswordMessage('Contraseña actualizada correctamente.');
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[430px_minmax(0,1fr)]">
        <div className="rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-6 py-7 shadow-sm">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Identidad de perfil</p>

          <div className="mt-6 flex justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Vista previa del avatar"
                className="h-56 w-56 rounded-full object-cover shadow-[0_18px_45px_rgba(15,23,42,0.18)] ring-1 ring-slate-200 lg:h-60 lg:w-60"
              />
            ) : (
              <div className="inline-flex h-56 w-56 items-center justify-center rounded-full bg-slate-950 text-5xl font-bold text-white shadow-[0_18px_45px_rgba(15,23,42,0.22)] ring-1 ring-slate-200 lg:h-60 lg:w-60 lg:text-6xl">
                {initials}
              </div>
            )}
          </div>

          <div className="mt-8 px-2">
            <p className="text-[2rem] font-semibold leading-tight text-slate-900">{fullName.trim() || 'Tu nombre visible'}</p>
            <p className="mt-2 break-all text-sm text-slate-500 sm:text-base">{email}</p>
          </div>
        </div>

        <form onSubmit={handleIdentitySubmit} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <UserCircle2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Información del usuario</h2>
              <p className="mt-1 text-sm text-slate-500">Actualiza nombre visible e imagen del perfil sin salir de la aplicación.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Nombre visible</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Cómo quieres que te vean en la app"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Correo</span>
              <input
                value={email}
                disabled
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Imagen del perfil (URL)</span>
              <input
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder="https://..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={savingIdentity}
              className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_30px_rgba(16,185,129,0.24)] transition hover:bg-emerald-400 disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {savingIdentity ? 'Guardando...' : 'Guardar información'}
            </button>
            {identityMessage ? <p className="text-sm text-slate-500">{identityMessage}</p> : null}
          </div>
        </form>
      </div>

      <form onSubmit={handlePasswordSubmit} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Cambio de contraseña</h2>
            <p className="mt-1 text-sm text-slate-500">Renueva la contraseña de acceso de esta cuenta y mantén la sesión protegida.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Nueva contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Confirmar contraseña</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
          >
            <KeyRound className="h-4 w-4" />
            {savingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
          {passwordMessage ? <p className="text-sm text-slate-500">{passwordMessage}</p> : null}
        </div>
      </form>
    </div>
  );
}
