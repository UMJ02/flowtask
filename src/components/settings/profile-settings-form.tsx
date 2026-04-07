'use client';

import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { Camera, ImagePlus, Link2, LockKeyhole, Mail, Trash2, Upload, UserRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function getInitials(name: string, email: string) {
  const source = name.trim() || email.trim() || 'U';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
}

function normalizeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/-+/g, '-');
}

function extractStoragePath(publicUrl: string, bucket: string) {
  try {
    const url = new URL(publicUrl);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(url.pathname.slice(idx + marker.length));
  } catch {
    return null;
  }
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
  const [lastUploadedAvatarUrl, setLastUploadedAvatarUrl] = useState(initialAvatarUrl ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initials = useMemo(() => getInitials(fullName, nextEmail), [fullName, nextEmail]);

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setMessage(null);
    setError(null);

    if (!file.type.startsWith('image/')) {
      setUploadingAvatar(false);
      setError('Selecciona una imagen válida para tu foto de perfil.');
      event.target.value = '';
      return;
    }

    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      setUploadingAvatar(false);
      setError('No pudimos validar tu sesión para subir la foto.');
      event.target.value = '';
      return;
    }

    const extension = file.name.includes('.') ? file.name.split('.').pop() : 'png';
    const safeName = normalizeFileName(file.name || `avatar.${extension}`);
    const filePath = `${authData.user.id}/avatar-${Date.now()}-${safeName}`;

    const uploadRes = await supabase.storage.from('profile-avatars').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

    if (uploadRes.error) {
      setUploadingAvatar(false);
      setError('No se pudo subir la foto de perfil.');
      event.target.value = '';
      return;
    }

    const publicUrl = supabase.storage.from('profile-avatars').getPublicUrl(filePath).data.publicUrl;

    const { error: profileError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', authData.user.id);

    if (profileError) {
      setUploadingAvatar(false);
      setError('La foto se subió, pero no pudimos guardarla en tu perfil.');
      event.target.value = '';
      return;
    }

    const oldPath = lastUploadedAvatarUrl ? extractStoragePath(lastUploadedAvatarUrl, 'profile-avatars') : null;
    if (oldPath && oldPath !== filePath) {
      await supabase.storage.from('profile-avatars').remove([oldPath]);
    }

    setAvatarUrl(publicUrl);
    setLastUploadedAvatarUrl(publicUrl);
    setUploadingAvatar(false);
    setMessage('Tu foto de perfil se actualizó correctamente.');
    event.target.value = '';
  };

  const handleRemoveAvatar = async () => {
    setAvatarUrl('');
    setMessage('La foto quedará vacía cuando guardes los cambios del perfil.');
    setError(null);
  };

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

    const cleanedAvatarUrl = avatarUrl.trim();
    if (cleanedAvatarUrl && !/^https?:\/\//i.test(cleanedAvatarUrl)) {
      setSaving(false);
      setError('La URL de la foto debe iniciar con http:// o https://.');
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
      avatar_url: cleanedAvatarUrl || null,
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
      const { error: authUpdateError } = await supabase.auth.updateUser({
        email: nextEmail.trim() !== email.trim() ? nextEmail.trim() : undefined,
        password: password || undefined,
        data: Object.keys(metadataUpdates).length ? metadataUpdates : undefined,
      });

      if (authUpdateError) {
        setSaving(false);
        setError('Actualizamos el perfil, pero faltó confirmar algunos cambios de acceso.');
        return;
      }
    }

    if (!cleanedAvatarUrl && lastUploadedAvatarUrl) {
      const oldPath = extractStoragePath(lastUploadedAvatarUrl, 'profile-avatars');
      if (oldPath) {
        await supabase.storage.from('profile-avatars').remove([oldPath]);
      }
      setLastUploadedAvatarUrl('');
    } else if (cleanedAvatarUrl) {
      setLastUploadedAvatarUrl(cleanedAvatarUrl);
    }

    setSaving(false);
    setPassword('');
    setConfirmPassword('');
    setMessage('Perfil actualizado correctamente.');
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-[30px] border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Foto de perfil</p>

          <div className="mt-6 flex justify-center">
            {avatarUrl ? (
              <div className="relative h-52 w-52 overflow-hidden rounded-full border border-slate-200 bg-slate-950 shadow-sm">
                <Image src={avatarUrl} alt="Foto de perfil" fill className="object-cover" sizes="208px" unoptimized />
              </div>
            ) : (
              <div className="flex h-52 w-52 items-center justify-center rounded-full bg-slate-950 text-5xl font-bold text-white shadow-sm">
                {initials}
              </div>
            )}
          </div>

          <div className="mt-6 space-y-1">
            <p className="text-xl font-semibold text-slate-900">Imagen visible en tu cuenta</p>
            <p className="text-sm leading-6 text-slate-500">
              Usa una foto clara y cuadrada. También puedes pegar una URL si quieres controlar la imagen desde fuera.
            </p>
          </div>

          <label className="mt-5 block">
            <p className="mb-2 text-sm font-medium text-slate-700">URL de la foto</p>
            <div className="relative">
              <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder="https://..."
                className="pl-11"
                inputMode="url"
              />
            </div>
          </label>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} loading={uploadingAvatar}>
              <Upload className="h-4 w-4" />
              {uploadingAvatar ? 'Subiendo...' : 'Subir imagen'}
            </Button>
            <Button type="button" variant="ghost" onClick={handleRemoveAvatar} disabled={!avatarUrl}>
              <Trash2 className="h-4 w-4" />
              Quitar
            </Button>
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            <div className="flex items-start gap-2">
              <Camera className="mt-0.5 h-4 w-4 text-slate-400" />
              <p>Formatos sugeridos: JPG, PNG o WEBP. Tamaño recomendado: 800×800 o superior para verse bien en toda la app.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[30px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-slate-900">
              <UserRound className="h-5 w-5" />
              <h3 className="text-xl font-semibold">Datos de usuario</h3>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <label className="block">
                <p className="mb-2 text-sm font-medium text-slate-700">Nombre</p>
                <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Tu nombre visible" />
              </label>

              <label className="block">
                <p className="mb-2 text-sm font-medium text-slate-700">Correo</p>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={nextEmail}
                    onChange={(event) => setNextEmail(event.target.value)}
                    placeholder="nombre@correo.com"
                    className="pl-11"
                    type="email"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-slate-900">
              <LockKeyhole className="h-5 w-5" />
              <h3 className="text-xl font-semibold">Cambio de contraseña</h3>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <label className="block">
                <p className="mb-2 text-sm font-medium text-slate-700">Nueva contraseña</p>
                <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="••••••••" />
              </label>
              <label className="block">
                <p className="mb-2 text-sm font-medium text-slate-700">Confirmar contraseña</p>
                <Input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" placeholder="••••••••" />
              </label>
            </div>

            <p className="mt-4 text-sm text-slate-500">Completa estos campos solo cuando quieras actualizar tu acceso.</p>
          </div>
        </div>
      </div>

      {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}

      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
        <Button type="submit" loading={saving} className="min-w-[180px]">
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
