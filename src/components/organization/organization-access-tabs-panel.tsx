'use client';

import { useState } from 'react';
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

  return (
    <Card className="rounded-[24px] p-4 md:p-5">
      <div className="flex justify-end">
        <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
          <Button type="button" variant={tab === 'permissions' ? 'primary' : 'ghost'} className="h-9 rounded-xl px-4" onClick={() => setTab('permissions')}>
            Permisos del cliente
          </Button>
          <Button type="button" variant={tab === 'invites' ? 'primary' : 'ghost'} className="h-9 rounded-xl px-4" onClick={() => setTab('invites')}>
            Invitaciones
          </Button>
        </div>
      </div>

      <div className="mt-3">
        {tab === 'permissions' ? (
          <ClientPermissionsPanel items={clientPermissions} canManage={canManageClientPermissions} embedded />
        ) : (
          <OrganizationInvitesPanel organizationId={organizationId} invites={invites} canManageInvites={canManageInvites} embedded />
        )}
      </div>
    </Card>
  );
}
