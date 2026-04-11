import Image from 'next/image';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { CommandPalette } from '@/components/layout/command-palette';
import { MobileNav } from '@/components/layout/mobile-nav';
import { UserMenu } from '@/components/layout/user-menu';
import { InstallAppButton } from '@/components/pwa/install-app-button';

function getFirstName(name?: string | null) {
  const clean = name?.trim();
  if (!clean) return 'de nuevo';
  return clean.split(/\s+/)[0] ?? clean;
}

export function AppHeader({
  userEmail,
  userName,
  avatarUrl,
}: {
  userEmail: string;
  userName?: string | null;
  avatarUrl?: string | null;
}) {
  const firstName = getFirstName(userName);

  return (
    <header className="sticky top-3 z-20 rounded-[34px] border border-emerald-100/90 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <MobileNav />
          <div className="hidden h-12 w-12 items-center justify-center rounded-full bg-slate-950 shadow-[0_12px_28px_rgba(15,23,42,0.18)] ring-1 ring-slate-900 md:inline-flex">
            <Image src="/icons/icon.png" alt="FlowTask" width={28} height={28} className="h-7 w-7 object-contain" priority />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">FlowTask</p>
            <h1 className="mt-1 text-lg font-bold text-slate-900 md:text-2xl">Hola, {firstName}</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">Tu tablero, tus tareas y lo importante del día en un solo lugar.</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <div className="hidden sm:block">
            <InstallAppButton compact />
          </div>
          <CommandPalette />
          <NotificationBell />
          <UserMenu fullName={userName} email={userEmail} avatarUrl={avatarUrl} />
        </div>
      </div>
    </header>
  );
}
