export const dynamic = 'force-dynamic';

import { OrganizationMetricsPanel } from '@/components/organization/organization-metrics-panel';
import { OrganizationMembersPanel } from '@/components/organization/organization-members-panel';
import { OrganizationRolesPanel } from '@/components/organization/organization-roles-panel';
import { ClientPermissionsPanel } from '@/components/organization/client-permissions-panel';
import { OrganizationInviteForm } from '@/components/organization/organization-invite-form';
import { OrganizationInvitesPanel } from '@/components/organization/organization-invites-panel';
import { OrganizationBootstrapCard } from '@/components/organization/organization-bootstrap-card';
import { OrganizationPendingInvitesCard } from '@/components/organization/organization-pending-invites-card';
import { ActivityTimeline } from '@/components/activity/activity-timeline';
import { safeServerCall } from '@/lib/runtime/safe-server';
import { getOrganizationContext, getOrganizationInvites, getOrganizationMetrics, getOrganizationRolesAndPermissions, getPendingOrganizationInvitesForCurrentUser } from '@/lib/queries/organization';
import { getOrganizationActivity } from '@/lib/queries/activity';
import { getOrganizationMembers } from '@/lib/queries/organization-members';
import { getOrganizationBillingSummary } from '@/lib/queries/billing';
import type { OrganizationInviteSummary } from '@/types/organization';

export default async function OrganizationPage() {
  const context = await safeServerCall('getOrganizationContext', () => getOrganizationContext(), null);
  const activeOrganization = context?.activeOrganization ?? null;
  const organizations = context?.organizations ?? [];
  const activeId = activeOrganization?.id ?? null;
  const canManage = Boolean(context?.access?.canManageInvites);
  const canManageRoles = Boolean(context?.access?.canManageRoles);

  const [metrics, invites, roles, members, activity, pendingInvitesForCurrentUser, billingSummary] = await Promise.all([
    safeServerCall('getOrganizationMetrics', () => getOrganizationMetrics(activeId), null),
    safeServerCall('getOrganizationInvites', () => getOrganizationInvites(activeId, canManage), []),
    safeServerCall('getOrganizationRolesAndPermissions', () => getOrganizationRolesAndPermissions(activeId, canManageRoles), { roleTemplates: [], permissionDefinitions: [], membersByRole: [] }),
    safeServerCall('getOrganizationMembers', () => getOrganizationMembers(activeId, Boolean(activeOrganization)), []),
    activeId ? safeServerCall('getOrganizationActivity', () => getOrganizationActivity(activeId), []) : Promise.resolve([]),
    safeServerCall('getPendingOrganizationInvitesForCurrentUser', () => getPendingOrganizationInvitesForCurrentUser(), []),
    safeServerCall('getOrganizationBillingSummary', () => getOrganizationBillingSummary(activeId), null),
  ]);

  return (
    <div className="space-y-5">
      {pendingInvitesForCurrentUser.length ? <OrganizationPendingInvitesCard invites={pendingInvitesForCurrentUser} /> : null}
      {!activeOrganization ? (
        organizations.length ? (
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Workspace personal activo</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Tu organización sigue disponible, pero no reemplaza tu modo individual</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Ahora FlowTask mantiene separados tu trabajo personal y los workspaces de equipo. Usa el selector del sidebar para cambiar entre <strong>Workspace personal</strong> y cualquiera de tus organizaciones sin perder acceso a tus tareas, proyectos y catálogos anteriores.</p>
            <div className="mt-4 inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">Organizaciones disponibles: {organizations.length}</div>
          </div>
        ) : (
          <OrganizationBootstrapCard />
        )
      ) : (
        <>
          <OrganizationMetricsPanel metrics={metrics} />
          <OrganizationMembersPanel
            activeOrganization={activeOrganization}
            members={members}
            canManageRoles={canManageRoles}
            seatsIncluded={billingSummary?.seatsIncluded ?? null}
            seatsUsed={billingSummary?.seatsUsed ?? null}
            pendingInvites={invites.filter((item: OrganizationInviteSummary) => item.status === 'pending').length}
          />
          <OrganizationRolesPanel roles={roles.roleTemplates} permissions={roles.permissionDefinitions} canManageRoles={canManageRoles} />
          <ClientPermissionsPanel items={context?.clientPermissions ?? []} canManage={Boolean(context?.access?.canManageClientPermissions)} />
          {activeId ? <OrganizationInviteForm organizationId={activeId} canInviteManagers={canManageRoles} canManageInvites={canManage} /> : null}
          <OrganizationInvitesPanel organizationId={activeId} invites={invites} canManageInvites={canManage} />
          <ActivityTimeline
            items={activity}
            title="Bitácora de seguridad y administración"
            description="Cambios recientes de miembros, invitaciones, permisos y clientes dentro del equipo activo."
          />
        </>
      )}
    </div>
  );
}
