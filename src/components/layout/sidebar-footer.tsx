import Link from 'next/link';
import { PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react';
import { OrganizationSwitcher } from '@/components/layout/organization-switcher';
import { useSidebarState } from '@/components/layout/sidebar-state';
import type { OrganizationSummary } from '@/types/organization';

function getInitials(name: string, email: string) {
  const source = name?.trim() || email?.trim() || 'U';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function SidebarFooter({
  organizations,
  activeOrganization,
  userEmail,
  userName,
  collapsed = false,
}: {
  organizations?: OrganizationSummary[];
  activeOrganization?: OrganizationSummary | null;
  userEmail: string;
  userName?: string | null;
  collapsed?: boolean;
}) {
  const displayName = userName?.trim() || 'Mi cuenta';
  const initials = getInitials(displayName, userEmail);
  const { toggle } = useSidebarState();

  return (
    <div className="border-t border-white/10 pt-4">
      {!collapsed ? (
        <div className="space-y-4">
          <div>
            <p className="px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Equipo</p>
            <div className="mt-2 rounded-[24px] border border-white/10 bg-white/[0.045] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
              <OrganizationSwitcher organizations={organizations ?? []} activeOrganization={activeOrganization} compact dark />
            </div>
          </div>
          <div>
            <p className="px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Perfil</p>
            <div className="mt-2 rounded-[24px] border border-white/10 bg-white/[0.045] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
              <Link href="/app/profile" className="flex items-center gap-3 rounded-[20px] px-2 py-2 transition hover:bg-white/8">
                <span className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-slate-950">
                  {initials}
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#071120] bg-[#16C784]" />
                </span>
                <div className="min-w-0">
                  <p className="break-words text-sm font-bold leading-5 text-white">{displayName}</p>
                  <p className="truncate text-xs text-slate-400">{userEmail}</p>
                </div>
                <Settings className="ml-auto h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </div>
          <button
            type="button"
            onClick={toggle}
            className="flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <PanelLeftClose className="h-4 w-4" />
            Colapsar menú
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <OrganizationSwitcher organizations={organizations ?? []} activeOrganization={activeOrganization} compact dark collapsed />
          <Link
            href="/app/profile"
            title={displayName}
            className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/6 text-white ring-1 ring-white/10 transition hover:bg-white/10"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-950">{initials}</span>
            <span className="absolute bottom-1.5 right-1.5 h-3 w-3 rounded-full border-2 border-[#071120] bg-[#16C784]" />
          </Link>
          <button
            type="button"
            onClick={toggle}
            aria-label="Expandir menú"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/6 text-slate-300 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
