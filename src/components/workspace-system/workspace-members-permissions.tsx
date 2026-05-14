import { Lock, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import type { WorkspaceMemberSummary, WorkspacePermissionSummary } from "@/lib/workspace-system/view-state";

function roleLabel(role?: string | null) {
  const normalized = String(role ?? "viewer").toLowerCase();
  if (normalized === "owner") return "Owner";
  if (normalized === "editor") return "Editor";
  if (normalized === "viewer") return "Viewer";
  if (normalized === "admin" || normalized === "admin_global") return "Admin";
  if (normalized === "manager") return "Manager";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "FT";
}

export function WorkspacePermissionBanner({ permissions }: { permissions: WorkspacePermissionSummary }) {
  return (
    <div className={permissions.isReadOnly ? "ft-ws-permission-banner is-readonly" : "ft-ws-permission-banner"}>
      {permissions.isReadOnly ? <Lock className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
      <div className="min-w-0">
        <b>{permissions.isReadOnly ? "Modo solo lectura" : "Permisos activos"}</b>
        <p>{permissions.message}</p>
      </div>
    </div>
  );
}

export function WorkspaceMembersPermissionsCard({
  members,
  permissions,
}: {
  members: WorkspaceMemberSummary[];
  permissions: WorkspacePermissionSummary;
}) {
  const visibleMembers = members.slice(0, 5);
  const enabledActions = [
    permissions.canCreateTask ? "Crear tareas" : null,
    permissions.canSaveViews ? "Guardar vistas" : null,
    permissions.canUploadFiles ? "Subir archivos" : null,
    permissions.canManageSpaces ? "Gestionar espacios" : null,
  ].filter(Boolean);

  return (
    <section className="ft-ws-card ft-ws-members-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[.18em] text-emerald-600">Equipo y permisos</p>
          <h3 className="mt-1 font-extrabold text-[var(--ft-workspace-text)]">Acceso del contexto</h3>
        </div>
        <span className={permissions.isReadOnly ? "ft-ws-permission-chip is-readonly" : "ft-ws-permission-chip"}>
          {roleLabel(permissions.projectMemberRole ?? permissions.organizationRole ?? permissions.role)}
        </span>
      </div>

      <WorkspacePermissionBanner permissions={permissions} />

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {enabledActions.length ? enabledActions.map((action) => (
          <span key={action} className="ft-ws-access-pill"><ShieldCheck className="h-3.5 w-3.5" /> {action}</span>
        )) : <span className="ft-ws-access-pill is-muted"><Lock className="h-3.5 w-3.5" /> Escritura bloqueada</span>}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-black text-slate-800"><UsersRound className="mr-1 inline h-4 w-4" /> Miembros visibles</h4>
          <span className="text-xs font-black text-slate-400">{members.length}</span>
        </div>
        {visibleMembers.length ? visibleMembers.map((member) => (
          <div key={member.id} className="ft-ws-member-row">
            <span className="ft-ws-member-avatar">{initials(member.name)}</span>
            <span className="min-w-0 flex-1">
              <b>{member.name}</b>
              <small>{member.email ?? member.source}</small>
            </span>
            <em>{roleLabel(member.role)}</em>
          </div>
        )) : (
          <p className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500">
            No hay miembros visibles en este contexto. Los permisos siguen protegidos por RLS.
          </p>
        )}
      </div>
    </section>
  );
}

export function WorkspaceReadOnlyActionHint({ label = "acción" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
      <Lock className="h-3.5 w-3.5" /> Sin permiso para {label}
    </span>
  );
}
