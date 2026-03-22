'use client';

import Link from 'next/link';
import { Building2, Settings } from 'lucide-react';
import { OrganizationSwitcher } from '@/components/layout/organization-switcher';
import { UserMenu } from '@/components/layout/user-menu';
import type { OrganizationSummary } from '@/types/organization';

export function SidebarFooter({
  organizations,
  activeOrganization,
  userEmail,
  userName,
}: {
  organizations?: OrganizationSummary[];
  activeOrganization?: OrganizationSummary | null;
  userEmail: string;
  userName?: string | null;
}) {
  return (
    <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
      <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Espacio de trabajo</p>
      <OrganizationSwitcher organizations={organizations ?? []} activeOrganization={activeOrganization} compact dark />
      <div className="grid grid-cols-2 gap-2">
        <Link href="/app/organization" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/6 px-3 py-3 text-sm font-medium text-white transition hover:bg-white/10">
          <Building2 className="h-4 w-4 text-emerald-300" />
          Organización
        </Link>
        <Link href="/app/settings" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/6 px-3 py-3 text-sm font-medium text-white transition hover:bg-white/10">
          <Settings className="h-4 w-4 text-emerald-300" />
          Perfil
        </Link>
      </div>
      <div className="flex justify-between gap-3 rounded-2xl bg-white/6 px-3 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{userName?.trim() || 'Mi cuenta'}</p>
          <p className="truncate text-xs text-slate-400">{userEmail}</p>
        </div>
        <UserMenu fullName={userName} email={userEmail} />
      </div>
    </div>
  );
}
