import { Sparkles } from 'lucide-react';
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

export function AppHeader({ userEmail, userName }: { userEmail: string; userName?: string | null }) {
  const firstName = getFirstName(userName);

  return (
    <header className="sticky top-3 z-20 rounded-[32px] border border-slate-200/80 bg-white/90 px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.07)] backdrop-blur md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <MobileNav />
          <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm md:inline-flex">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">FlowTask</p>
            <h1 className="mt-1 text-lg font-bold text-slate-900 md:text-2xl">Bienvenido, {firstName}</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">Administra tareas, proyectos y clientes en una vista simple, rápida y fácil de entender.</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <div className="hidden sm:block">
            <InstallAppButton />
          </div>
          <CommandPalette />
          <NotificationBell />
          <UserMenu fullName={userName} email={userEmail} />
        </div>
      </div>
    </header>
  );
}
