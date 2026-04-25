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

  return (
    <div className="border-t border-white/10 pt-4">
      <div className="space-y-3">
        {!collapsed ? (
          <>
            <div>
              <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Equipo</p>
              <div className="mt-2">
                <OrganizationSwitcher organizations={organizations ?? []} activeOrganization={activeOrganization} compact dark />
              </div>
            </div>
            <div className="border-t border-white/10 pt-2.5">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Perfil</p>
              <Link href="/app/profile" className="mt-2 flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/6 px-3 py-2.5 ring-1 ring-white/5 transition hover:translate-x-1 hover:bg-white/10">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-950">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold leading-5 text-white">{displayName}</p>
                  <p className="truncate text-xs text-slate-400">{userEmail}</p>
                </div>
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <OrganizationSwitcher organizations={organizations ?? []} activeOrganization={activeOrganization} compact dark collapsed />
            <Link
              href="/app/profile"
              title={displayName}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white ring-1 ring-white/10 transition hover:scale-[1.04] hover:bg-white/10"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-950">{initials}</span>
            </Link>
            <Link
              href="/app/settings"
              aria-label="Abrir configuración"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-slate-300 ring-1 ring-white/10 transition hover:scale-[1.04] hover:bg-white/10 hover:text-white"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
