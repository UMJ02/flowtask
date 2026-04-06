'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Camera, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function getInitials(name: string, email: string) {
  const source = name.trim() || email.trim() || 'U';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
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
  const [nextEmail, setNextEmail] = useState(email);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initials = useMemo(() => getInitials(fullName, nextEmail), [fullName, nextEmail]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    if (password && password.length < 6) {
      setSaving(false);
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password && password !== confirmPassword) {
      setSaving(false);
      setError('La confirmación de contraseña no coincide.');
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      setError('No pudimos identificar tu sesión.');
      return;
    }

    const profilePayload = {
      full_name: fullName.trim() || null,
      email: nextEmail.trim() || null,
      avatar_url: avatarUrl.trim() || null,
    };

    const { error: profileError } = await supabase.from('profiles').update(profilePayload).eq('id', user.id);

    if (profileError) {
      setSaving(false);
      setError('No se pudo actualizar tu perfil.');
      return;
    }

    const metadataUpdates: Record<string, string> = {};
    if ((fullName ?? '').trim() !== (initialFullName ?? '').trim()) {
      metadataUpdates.full_name = fullName.trim();
    }

    const shouldUpdateAuth = Boolean(password || nextEmail.trim() !== email.trim() || Object.keys(metadataUpdates).length);

    if (shouldUpdateAuth) {
      const { error: authError } = await supabase.auth.updateUser({
        email: nextEmail.trim() !== email.trim() ? nextEmail.trim() : undefined,
        password: password || undefined,
        data: Object.keys(metadataUpdates).length ? metadataUpdates : undefined,
      });

      if (authError) {
        setSaving(false);
        setError(authError.message || 'No se pudo actualizar tu cuenta.');
        return;
      }
    }

    setSaving(false);
    setPassword('');
    setConfirmPassword('');
    setMessage(
      nextEmail.trim() !== email.trim()
        ? 'Perfil actualizado. Revisa tu correo para confirmar el cambio de email si Supabase lo solicita.'
        : 'Perfil actualizado correctamente.',
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Foto de perfil</p>
          <div className="mt-4 flex items-center gap-4">
            {avatarUrl.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Foto de perfil" className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-sm" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-950 text-2xl font-bold text-white ring-4 ring-white shadow-sm">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">Imagen visible en tu cuenta</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">Pega la URL de tu foto para actualizar el avatar sin afectar Vercel ni el flujo actual.</p>
            </div>
          </div>
          <label className="mt-4 block space-y-2">
            <span className="text-sm font-medium text-slate-700">URL de la foto</span>
            <div className="relative">
              <Camera className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://..." className="pl-10" />
            </div>
          </label>
        </div>

        <div className="grid gap-5">
          <div className="rounded-[26px] border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-slate-900">
              <UserRound className="h-4 w-4" />
              <h2 className="text-base font-semibold">Datos de usuario</h2>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Nombre</span>
                <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Cómo quieres que te vean en la app" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Correo</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input value={nextEmail} onChange={(event) => setNextEmail(event.target.value)} placeholder="tu@correo.com" className="pl-10" />
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-slate-900">
              <LockKeyhole className="h-4 w-4" />
              <h2 className="text-base font-semibold">Cambio de contraseña</h2>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Nueva contraseña</span>
                <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoComplete="new-password" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Confirmar contraseña</span>
                <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="••••••••" autoComplete="new-password" />
              </label>
            </div>
            <p className="mt-3 text-sm text-slate-500">Solo completa estos campos cuando quieras actualizar tu acceso.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" className="min-w-[190px] rounded-full bg-emerald-500 text-slate-950 hover:bg-emerald-400" disabled={saving}>
          {saving ? 'Actualizando...' : 'Guardar actualización'}
        </Button>
        {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
      </div>
    </form>
  );
}
