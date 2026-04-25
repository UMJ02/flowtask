import Link from 'next/link';
import { Settings } from 'lucide-react';
import { OrganizationSwitcher } from '@/components/layout/organization-switcher';
import type { OrganizationSummary } from '@/types/organization';

function getInitials(name: string, email: string) {
  const source = name?.trim() || email?.trim() || 'U';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function SidebarFooter({ organizations, activeOrganization, userEmail, userName, collapsed = false }: { organizations?: OrganizationSummary[]; activeOrganization?: OrganizationSummary | null; userEmail: string; userName?: string | null; collapsed?: boolean }) {
  const displayName = userName?.trim() || 'Mi cuenta';
  const initials = getInitials(displayName, userEmail);

  return (
    <div className="border-t border-white/10 pt-4">
      {!collapsed ? (
        <div className="space-y-4">
          <div>
            <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace activo</p>
            <OrganizationSwitcher organizations={organizations ?? []} activeOrganization={activeOrganization} compact dark />
          </div>
          <div>
            <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Perfil</p>
            <Link href="/app/profile" className="group flex min-w-0 items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.04] px-3 py-3 transition hover:-translate-y-px hover:border-[#16C784]/25 hover:bg-white/[0.07]">
              <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-950 ring-1 ring-white/15">
                {initials}
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#071120] bg-[#16C784]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold leading-5 text-white">{displayName}</span>
                <span className="block truncate text-xs leading-4 text-slate-400">{userEmail}</span>
              </span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <OrganizationSwitcher organizations={organizations ?? []} activeOrganization={activeOrganization} compact dark collapsed />
          <Link href="/app/profile" title={displayName} className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/[0.04] text-white ring-1 ring-white/10 transition hover:bg-white/[0.08]">
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-950">
              {initials}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#071120] bg-[#16C784]" />
            </span>
          </Link>
          <Link href="/app/settings" aria-label="Abrir configuración" className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/[0.04] text-slate-300 ring-1 ring-white/10 transition hover:bg-white/[0.08] hover:text-white">
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
