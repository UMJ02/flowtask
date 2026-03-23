import { Card } from "@/components/ui/card";
import { OrganizationInviteForm } from "@/components/organization/organization-invite-form";
import type { OrganizationInviteSummary } from "@/types/organization";

export function OrganizationInvitesPanel({
  organizationId,
  invites,
  canManageInvites = false,
  canInviteManagers = false,
}: {
  organizationId?: string | null;
  invites: OrganizationInviteSummary[];
  canManageInvites?: boolean;
  canInviteManagers?: boolean;
}) {
  return (
    <Card>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Invitaciones</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Alta rápida de equipo</h2>
          <p className="mt-2 text-sm text-slate-600">Crea invitaciones por correo con rol sugerido para managers, miembros o visualizadores.</p>
        </div>
      </div>

      {canManageInvites ? (
        <div className="mt-4">
          <OrganizationInviteForm organizationId={organizationId} canInviteManagers={canInviteManagers} />
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Solo los roles <span className="font-semibold text-slate-900">admin_global</span> y <span className="font-semibold text-slate-900">manager</span> pueden crear y consultar invitaciones activas.
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="pb-2 pr-4 font-medium">Correo</th>
              <th className="pb-2 pr-4 font-medium">Rol</th>
              <th className="pb-2 pr-4 font-medium">Estado</th>
              <th className="pb-2 pr-4 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {invites.length ? invites.map((invite) => (
              <tr key={invite.id} className="border-t border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">{invite.email}</td>
                <td className="py-3 pr-4 text-slate-600">{invite.role}</td>
                <td className="py-3 pr-4 text-slate-600">{invite.status}</td>
                <td className="py-3 pr-4 text-slate-600">{invite.createdAtLabel}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-6 text-sm text-slate-500">{canManageInvites ? "Todavía no hay invitaciones para esta organización." : "No tienes acceso a la bandeja de invitaciones de esta organización."}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
