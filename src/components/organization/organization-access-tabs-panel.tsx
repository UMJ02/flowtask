'use client';

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ClientPermissionSummary, OrganizationInviteSummary } from '@/types/organization';
import { ClientPermissionsPanel } from '@/components/organization/client-permissions-panel';
import { OrganizationInvitesPanel } from '@/components/organization/organization-invites-panel';

export function OrganizationAccessTabsPanel({
  clientPermissions,
  invites,
  canManageClientPermissions = false,
  canManageInvites = false,
  organizationId,
}: {
  clientPermissions: ClientPermissionSummary[];
  invites: OrganizationInviteSummary[];
  canManageClientPermissions?: boolean;
  canManageInvites?: boolean;
  organizationId?: string | null;
}) {
  const [tab, setTab] = useState<'permissions' | 'invites'>('permissions');
  const [open, setOpen] = useState(false);

  const currentLabel = useMemo(() => (tab === 'permissions' ? 'Permisos del cliente' : 'Invitaciones'), [tab]);

  return (
    <Card className="rounded-[24px] p-4 md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex w-fit rounded-2xl border border-slate-200 bg-slate-50 p-1">
          <Button type="button" variant={tab === 'permissions' ? 'primary' : 'ghost'} className="h-9 rounded-xl px-4" onClick={() => setTab('permissions')}>
            Permisos del cliente
          </Button>
          <Button type="button" variant={tab === 'invites' ? 'primary' : 'ghost'} className="h-9 rounded-xl px-4" onClick={() => setTab('invites')}>
            Invitaciones
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-[0_4px_14px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:bg-slate-50"
        >
          {currentLabel}
          <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open ? (
        <div className="mt-3 animate-fade-in">
          {tab === 'permissions' ? (
            <ClientPermissionsPanel items={clientPermissions} canManage={canManageClientPermissions} embedded defaultOpen={true} showHeader={false} />
          ) : (
            <OrganizationInvitesPanel organizationId={organizationId} invites={invites} canManageInvites={canManageInvites} embedded defaultOpen={true} showHeader={false} />
          )}
        </div>
      ) : null}
    </Card>
  );
}
