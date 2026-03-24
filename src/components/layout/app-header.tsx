import Image from 'next/image';
import { CalendarDays, Sparkles } from 'lucide-react';
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

function getTodayLabel() {
  try {
    return new Intl.DateTimeFormat('es-CR', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
    }).format(new Date());
  } catch {
    return 'Hoy';
  }
}

export function AppHeader({ userEmail, userName }: { userEmail: string; userName?: string | null }) {
  const firstName = getFirstName(userName);
  const todayLabel = getTodayLabel();

  return (
    <header className="surface-glow sticky top-3 z-20 rounded-[32px] border border-white/80 bg-white/88 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <MobileNav />
          <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 md:inline-flex">
            <Image src="/icons/icon.png" alt="FlowTask" width={34} height={34} className="h-8 w-8 object-contain" priority />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge-soft">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                FlowTask v6
              </span>
              <span className="badge-soft">
                <CalendarDays className="h-3.5 w-3.5 text-sky-600" />
                {todayLabel}
              </span>
            </div>
            <h1 className="mt-3 text-lg font-bold text-slate-900 md:text-2xl">Hola, {firstName}</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">Tu operación diaria, los accesos rápidos y la lectura del workspace viven en una misma capa más clara.</p>
            <p className="mt-2 truncate text-xs font-medium text-slate-400">Sesión activa: {userEmail}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <div className="hidden sm:block">
            <InstallAppButton compact />
          </div>
          <CommandPalette />
          <NotificationBell />
          <UserMenu fullName={userName} email={userEmail} />
        </div>
      </div>
    </header>
  );
}
