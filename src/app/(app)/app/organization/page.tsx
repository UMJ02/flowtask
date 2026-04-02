export const dynamic = 'force-dynamic';

import { OrganizationMetricsPanel } from '@/components/organization/organization-metrics-panel';
import { OrganizationMembersPanel } from '@/components/organization/organization-members-panel';
import { OrganizationRolesPanel } from '@/components/organization/organization-roles-panel';
import { ClientPermissionsPanel } from '@/components/organization/client-permissions-panel';
import { OrganizationInviteForm } from '@/components/organization/organization-invite-form';
import { OrganizationInvitesPanel } from '@/components/organization/organization-invites-panel';
import { ActivityTimeline } from '@/components/activity/activity-timeline';
import { AccessSummaryCard } from '@/components/security/access-summary-card';
import { safeServerCall } from '@/lib/runtime/safe-server';
import { getOrganizationContext, getOrganizationInvites, getOrganizationMetrics, getOrganizationRolesAndPermissions } from '@/lib/queries/organization';
import { getOrganizationActivity } from '@/lib/queries/activity';
import { getOrganizationMembers } from '@/lib/queries/organization-members';
import { getOrganizationWorkspaceAccessSummary } from '@/lib/queries/access-summary';

export default async function OrganizationPage() {
  const context = await safeServerCall('getOrganizationContext', () => getOrganizationContext(), null);
  const activeOrganization = context?.activeOrganization ?? null;
  const activeId = activeOrganization?.id ?? null;
  const canManage = Boolean(context?.access?.canManageInvites);
  const canManageRoles = Boolean(context?.access?.canManageRoles);

  const [metrics, invites, roles, members, activity, accessSummary] = await Promise.all([
    safeServerCall('getOrganizationMetrics', () => getOrganizationMetrics(activeId), null),
    safeServerCall('getOrganizationInvites', () => getOrganizationInvites(activeId, canManage), []),
    safeServerCall('getOrganizationRolesAndPermissions', () => getOrganizationRolesAndPermissions(activeId, canManageRoles), { roleTemplates: [], permissionDefinitions: [], membersByRole: [] }),
    safeServerCall('getOrganizationMembers', () => getOrganizationMembers(activeId, Boolean(activeOrganization)), []),
    activeId ? safeServerCall('getOrganizationActivity', () => getOrganizationActivity(activeId), []) : Promise.resolve([]),
    safeServerCall('getOrganizationWorkspaceAccessSummary', () => getOrganizationWorkspaceAccessSummary(), { role: null, canManageInvites: false, canManageRoles: false, canManageClientPermissions: false, canViewSensitiveOrganizationData: false }),
  ]);

  return (
    <div className="space-y-4">
      <AccessSummaryCard
        title="Gobierno y permisos de la organización"
        description="La interfaz oculta o bloquea acciones según tu rol actual y los permisos efectivos de la organización activa."
        roleLabel={accessSummary.role ? accessSummary.role.replace('_', ' ') : 'Sin rol'}
        items={[
          { label: 'Ver datos sensibles', enabled: accessSummary.canViewSensitiveOrganizationData },
          { label: 'Gestionar invitaciones', enabled: accessSummary.canManageInvites },
          { label: 'Gestionar roles', enabled: accessSummary.canManageRoles },
          { label: 'Gestionar permisos de cliente', enabled: accessSummary.canManageClientPermissions },
        ]}
        compact
      />
      <OrganizationMetricsPanel metrics={metrics} />
      <OrganizationMembersPanel activeOrganization={activeOrganization} members={members} canManageRoles={canManageRoles} />
      <OrganizationRolesPanel roles={roles.roleTemplates} permissions={roles.permissionDefinitions} canManageRoles={canManageRoles} />
      <ClientPermissionsPanel items={context?.clientPermissions ?? []} canManage={Boolean(context?.access?.canManageClientPermissions)} />
      {activeId ? <OrganizationInviteForm organizationId={activeId} canInviteManagers={canManageRoles} canManageInvites={canManage} /> : null}
      <OrganizationInvitesPanel organizationId={activeId} invites={invites} canManageInvites={canManage} />
      <ActivityTimeline
        items={activity}
        title="Bitácora de seguridad y gobierno"
        description="Cambios recientes de miembros, invitaciones, permisos y clientes dentro de la organización activa."
      />
    </div>
  );
}
