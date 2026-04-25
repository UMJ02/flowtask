'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { LogOut, Settings, UserCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const PROFILE_STORAGE_KEY = 'flowtask.profile-shell';
const PROFILE_UPDATED_EVENT = 'flowtask:profile-updated';

type ProfileShellPayload = {
  fullName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

function getInitials(name: string, email: string) {
  const source = name?.trim() || email?.trim() || 'U';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function readShellProfile(): ProfileShellPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProfileShellPayload;
  } catch {
    return null;
  }
}

function AvatarBadge({ avatarUrl, initials }: { avatarUrl?: string | null; initials: string }) {
  return avatarUrl ? (
    <span className="relative inline-flex h-9 w-9 overflow-hidden rounded-full ring-1 ring-slate-200/80">
      <Image src={avatarUrl} alt="Avatar del usuario" fill className="object-cover" sizes="36px" unoptimized />
    </span>
  ) : (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
      {initials}
    </span>
  );
}

export function UserMenu({
  fullName,
  email,
  avatarUrl,
}: {
  fullName?: string | null;
  email: string;
  avatarUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liveFullName, setLiveFullName] = useState(fullName ?? '');
  const [liveEmail, setLiveEmail] = useState(email);
  const [liveAvatarUrl, setLiveAvatarUrl] = useState(avatarUrl ?? '');

  useEffect(() => {
    setLiveFullName(fullName ?? '');
  }, [fullName]);

  useEffect(() => {
    setLiveEmail(email);
  }, [email]);

  useEffect(() => {
    setLiveAvatarUrl(avatarUrl ?? '');
  }, [avatarUrl]);

  useEffect(() => {
    const shellProfile = readShellProfile();
    if (shellProfile) {
      if (typeof shellProfile.fullName === 'string') setLiveFullName(shellProfile.fullName);
      if (typeof shellProfile.email === 'string' && shellProfile.email) setLiveEmail(shellProfile.email);
      if ('avatarUrl' in shellProfile) setLiveAvatarUrl(shellProfile.avatarUrl ?? '');
    }

    const handleProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<ProfileShellPayload>).detail;
      if (!detail) return;
      if (typeof detail.fullName === 'string') setLiveFullName(detail.fullName);
      if (typeof detail.email === 'string' && detail.email) setLiveEmail(detail.email);
      if ('avatarUrl' in detail) setLiveAvatarUrl(detail.avatarUrl ?? '');
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated as EventListener);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated as EventListener);
  }, []);

  const initials = useMemo(() => getInitials(liveFullName ?? '', liveEmail), [liveFullName, liveEmail]);
  const displayName = liveFullName?.trim() || 'Mi perfil';

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <>
      <Link
        href="/app/profile"
        aria-label="Abrir perfil"
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E5EAF1] bg-white text-left shadow-[0_8px_18px_rgba(15,23,42,.035)] transition hover:scale-[1.04] hover:border-emerald-100 hover:bg-emerald-50 md:hidden"
      >
        <AvatarBadge avatarUrl={liveAvatarUrl} initials={initials} />
        <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#16C784]" />
      </Link>

      <div className="relative hidden md:block">
        <button
          type="button"
          aria-label="Abrir menú de usuario"
          onClick={() => setOpen((value) => !value)}
          className="group relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E5EAF1] bg-white text-left shadow-[0_8px_18px_rgba(15,23,42,.035)] transition hover:scale-[1.04] hover:border-emerald-100 hover:bg-emerald-50"
        >
          <AvatarBadge avatarUrl={liveAvatarUrl} initials={initials} />
          <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#16C784]" />
          <span className="pointer-events-none absolute -bottom-10 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block">
            {liveEmail}
          </span>
        </button>

        {open ? (
          <div className="absolute right-0 top-[calc(100%+10px)] z-40 w-72 rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_24px_50px_rgba(15,23,42,0.16)]">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{displayName}</p>
              <p className="mt-1 break-all text-xs text-slate-500">{liveEmail}</p>
            </div>

            <div className="mt-3 space-y-2">
              <Link
                href="/app/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <UserCircle2 className="h-4 w-4 text-slate-500" />
                Ver y editar perfil
              </Link>
              <Link
                href="/app/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Settings className="h-4 w-4 text-slate-500" />
                Configuración
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                {loading ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
