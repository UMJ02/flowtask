import { Building2, Sun } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { CommandPalette } from '@/components/layout/command-palette';
import { MobileNav } from '@/components/layout/mobile-nav';
import { UserMenu } from '@/components/layout/user-menu';
import { OrganizationSwitcher } from '@/components/layout/organization-switcher';
import type { OrganizationSummary } from '@/types/organization';

function getFirstName(name?: string | null) {
  const clean = name?.trim();
  if (!clean) return 'de nuevo';
  return clean.split(/\s+/)[0] ?? clean;
}

export function AppHeader({
  userEmail,
  userName,
  avatarUrl,
  organizations = [],
  activeOrganization = null,
}: {
  userEmail: string;
  userName?: string | null;
  avatarUrl?: string | null;
  organizations?: OrganizationSummary[];
  activeOrganization?: OrganizationSummary | null;
}) {
  const firstName = getFirstName(userName);
  const workspaceLabel = activeOrganization ? `Estás trabajando en ${activeOrganization.name}.` : 'Enfócate en lo importante. Tú decides el impacto de hoy.';

  return (
    <header className="animate-[flowtask-fade-up_250ms_ease-out] rounded-[18px] border border-transparent bg-transparent text-[#0F172A]">
      <div className="flex min-h-[72px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <MobileNav />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[1.7rem] font-black leading-tight tracking-[-0.045em] text-[#0F172A] md:text-[2rem]">Hola, {firstName} 👋</h1>
              {activeOrganization ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  <Building2 className="h-3.5 w-3.5" /> Organización
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm font-medium text-[#64748B]">{workspaceLabel}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <div className="min-w-[220px] md:hidden">
            <OrganizationSwitcher organizations={organizations} activeOrganization={activeOrganization} compact />
          </div>
          <CommandPalette />
          <button
            type="button"
            aria-label="Cambiar tema"
            className="hidden h-11 w-11 items-center justify-center rounded-full border border-[#E5EAF1] bg-white text-slate-600 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition duration-200 hover:scale-[1.04] hover:bg-slate-50 hover:text-[#0F172A] md:inline-flex"
          >
            <Sun className="h-5 w-5" />
          </button>
          <NotificationBell />
          <UserMenu fullName={userName} email={userEmail} avatarUrl={avatarUrl} />
        </div>
      </div>
    </header>
  );
}
