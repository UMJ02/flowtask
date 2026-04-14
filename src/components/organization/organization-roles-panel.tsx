'use client';

import { useMemo, useState } from 'react';
import { ChevronRight, Shield, Users2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { OrganizationRoleTemplateSummary, PermissionDefinitionSummary } from '@/types/organization';

function resolvePermissions(keys: string[], defs: PermissionDefinitionSummary[]) {
  const map = new Map(defs.map((item) => [item.key, item]));
  return keys.map((key) => map.get(key)).filter(Boolean) as PermissionDefinitionSummary[];
}

const categoryTone: Record<string, string> = {
  tasks: 'bg-slate-100 text-slate-700 ring-slate-200',
  projects: 'bg-slate-100 text-slate-700 ring-slate-200',
  clients: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  team: 'bg-sky-50 text-sky-700 ring-sky-100',
  reports: 'bg-amber-50 text-amber-700 ring-amber-100',
};

export function OrganizationRolesPanel({
  roles,
  permissions,
  canManageRoles = true,
}: {
  roles: OrganizationRoleTemplateSummary[];
  permissions: PermissionDefinitionSummary[];
  canManageRoles?: boolean;
}) {
  const [activeRoleId, setActiveRoleId] = useState<string>(roles[0]?.id ?? '');
  const activeRole = useMemo(() => roles.find((role) => role.id === activeRoleId) ?? roles[0], [activeRoleId, roles]);
  const activePermissions = useMemo(() => (activeRole ? resolvePermissions(activeRole.permissions, permissions) : []), [activeRole, permissions]);

  return (
    <Card className="rounded-[24px] p-4 md:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Roles del equipo</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">Qué puede hacer cada perfil</h2>
          <p className="mt-1 text-sm text-slate-600">Una lectura simple para entender permisos sin navegar entre varias pantallas.</p>
        </div>
        {canManageRoles ? (
          <a href="/app/organization/roles" className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.14)]">
            Gestionar roles
          </a>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-2">
          {roles.map((role) => {
            const isActive = role.id === activeRole?.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setActiveRoleId(role.id)}
                className={`flex w-full items-center justify-between rounded-[20px] border px-4 py-3 text-left transition-all ${isActive ? 'border-slate-300 bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.12)]' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold">{role.name}</p>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${isActive ? 'bg-white/10 text-white ring-white/15' : 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
                      {role.memberCount} miembros
                    </span>
                  </div>
                  <p className={`mt-1 text-sm ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>{role.description || 'Sin descripción'}</p>
                </div>
                <ChevronRight className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              </button>
            );
          })}
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-slate-50/75 p-4">
          {activeRole ? (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      <Users2 className="h-3.5 w-3.5" />
                      {activeRole.memberCount} miembros
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      <Shield className="h-3.5 w-3.5" />
                      {activeRole.isSystem ? 'Rol base del sistema' : 'Rol personalizado'}
                    </span>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">{activeRole.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{activeRole.description || 'Sin descripción adicional.'}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {activePermissions.length ? activePermissions.map((permission) => (
                  <div key={permission.key} className="rounded-2xl border border-white/70 bg-white px-3 py-3 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{permission.label}</p>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${categoryTone[permission.category] ?? categoryTone.reports}`}>
                        {permission.category}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{permission.description}</p>
                  </div>
                )) : <p className="text-sm text-slate-500">Este rol todavía no tiene permisos configurados.</p>}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">No hay roles configurados todavía.</p>
          )}
        </div>
      </div>
    </Card>
  );
}
