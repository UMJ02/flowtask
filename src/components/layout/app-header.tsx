import { Building2, SunMedium } from 'lucide-react';
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
    <header className="sticky top-4 z-30 animate-[flowtaskFadeUp_250ms_ease-out] min-h-[74px] rounded-[20px] border border-[#E5EAF1] bg-white/85 px-5 py-4 shadow-[0_8px_30px_rgba(2,6,23,0.06)] backdrop-blur-[16px] md:h-[82px] md:px-6 md:py-0">
      <div className="flex h-full min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="flex min-w-0 items-center gap-3 md:w-[36%]">
          <MobileNav />
          <span className="hidden h-9 w-1 shrink-0 rounded-full bg-[#16C784] shadow-[0_0_18px_rgba(22,199,132,0.35)] md:inline-flex" aria-hidden="true" />
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-[24px] font-bold leading-tight tracking-[-0.04em] text-[#0F172A] md:text-[24px]">Hola, {firstName} 👋</h1>
              {activeOrganization ? (
                <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 xl:inline-flex">
                  <Building2 className="h-3.5 w-3.5" /> Org
                </span>
              ) : null}
            </div>
            <p className="mt-1 truncate text-[14px] font-medium leading-5 text-[#64748B]">{workspaceLabel}</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
          <div className="hidden min-w-[210px] md:hidden">
            <OrganizationSwitcher organizations={organizations} activeOrganization={activeOrganization} compact />
          </div>
          <div className="min-w-0 flex-1 md:max-w-[560px]">
            <CommandPalette />
          </div>
          <button
            type="button"
            aria-label="Cambiar tema"
            title="Tema"
            className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E5EAF1] bg-white text-[#0F172A] shadow-[0_4px_14px_rgba(15,23,42,0.04)] transition-all duration-150 hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-[#F7F9FC] md:inline-flex"
          >
            <SunMedium className="h-[18px] w-[18px]" />
          </button>
          <NotificationBell />
          <UserMenu fullName={userName} email={userEmail} avatarUrl={avatarUrl} />
        </div>
      </div>
    </header>
  );
}
