import { format } from 'date-fns';
import { Sparkles } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { OrganizationSwitcher } from '@/components/layout/organization-switcher';
import { MobileNav } from '@/components/layout/mobile-nav';
import type { OrganizationSummary } from '@/types/organization';

export function AppHeader({ userEmail, organizations = [], activeOrganization = null }: { userEmail: string; organizations?: OrganizationSummary[]; activeOrganization?: OrganizationSummary | null }) {
  return (
    <header className="sticky top-3 z-20 rounded-[32px] border border-slate-200/80 bg-white/90 px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.07)] backdrop-blur md:px-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <MobileNav />
          <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm md:inline-flex">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">FlowTask</p>
            <h1 className="mt-1 text-lg font-bold text-slate-900 md:text-2xl">Tu espacio de trabajo</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">Administra tareas, proyectos y clientes en una vista simple, rápida y fácil de entender.</p>
          </div>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <OrganizationSwitcher organizations={organizations} activeOrganization={activeOrganization} />
          <NotificationBell />
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
            <p className="max-w-[220px] truncate text-sm font-medium text-slate-900">{userEmail}</p>
            <p className="text-xs text-slate-500">{format(new Date(), 'dd/MM/yyyy')}</p>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 md:hidden">
        <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="truncate text-sm font-medium text-slate-900">{userEmail}</p>
          <p className="text-xs text-slate-500">{format(new Date(), 'dd/MM/yyyy')}</p>
        </div>
        <NotificationBell />
      </div>
    </header>
  );
}
