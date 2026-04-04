'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Check, Crown, ShieldCheck, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import type { OrganizationSummary } from '@/types/organization';
import { describeOrganizationRole, formatOrganizationRole } from '@/lib/organization/labels';

type OrganizationMemberItem = {
  id: string;
  userId: string;
  role: 'admin_global' | 'manager' | 'member' | 'viewer';
  isDefault: boolean;
  fullName: string;
  email: string;
};

const ROLE_OPTIONS = [
  { value: 'admin_global', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
] as const;

function roleHelper(role: OrganizationMemberItem['role']) {
  return describeOrganizationRole(role);
}

function Metric({ title, value, helper, tone = 'default' }: { title: string; value: number | string; helper: string; tone?: 'default' | 'warning' }) {
  return (
    <div className={`rounded-[22px] border px-4 py-4 ${tone === 'warning' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{helper}</p>
    </div>
  );
}

export function OrganizationMembersPanel({
  activeOrganization,
  members,
  canManageRoles = false,
  seatsIncluded = null,
  seatsUsed = null,
  pendingInvites = 0,
}: {
  activeOrganization?: OrganizationSummary | null;
  members: OrganizationMemberItem[];
  canManageRoles?: boolean;
  seatsIncluded?: number | null;
  seatsUsed?: number | null;
  pendingInvites?: number;
}) {
  const [items, setItems] = useState(members);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateRole(memberId: string, role: OrganizationMemberItem['role']) {
    setSavingId(memberId);
    setStatus(null);
    setError(null);
    const previous = items;
    setItems((current) => current.map((item) => (item.id === memberId ? { ...item, role } : item)));

    try {
      const response = await fetch('/api/organization/members/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, role }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || 'No fue posible actualizar el rol.');
      }
      setStatus(payload?.message || 'Rol actualizado correctamente.');
    } catch (err) {
      setItems(previous);
      setError(err instanceof Error ? err.message : 'No fue posible actualizar el rol.');
    } finally {
      setSavingId(null);
    }
  }

  const counters = useMemo(
    () => ({
      admin_global: items.filter((item) => item.role === 'admin_global').length,
      manager: items.filter((item) => item.role === 'manager').length,
      member: items.filter((item) => item.role === 'member').length,
      viewer: items.filter((item) => item.role === 'viewer').length,
    }),
    [items],
  );

  const ownerId = activeOrganization?.ownerId ?? null;
  const seatsFree = seatsIncluded !== null && seatsUsed !== null ? Math.max(seatsIncluded - Math.max(seatsUsed, members.length) - pendingInvites, 0) : null;
  const nearCapacity = seatsIncluded !== null && seatsUsed !== null ? seatsUsed + pendingInvites >= seatsIncluded : false;

  return (
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Equipo de organización</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">{activeOrganization ? activeOrganization.name : 'Miembros y roles'}</h2>
          <p className="mt-2 text-sm text-slate-600">Gestiona quién entra al workspace, qué rol recibe y cuánto margen real queda según el plan activo.</p>
        </div>
        {activeOrganization ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p><strong>Slug:</strong> /{activeOrganization.slug}</p>
            <p><strong>Tu rol:</strong> {formatOrganizationRole(activeOrganization.role)}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Admins" value={counters.admin_global} helper="Owner y admins con control total" />
        <Metric title="Managers" value={counters.manager} helper="Coordinan operación e invitaciones" />
        <Metric title="Pendientes" value={pendingInvites} helper="Invitaciones que aún reservan cupo" tone={pendingInvites > 0 ? 'warning' : 'default'} />
        <Metric
          title="Capacidad"
          value={seatsIncluded !== null && seatsUsed !== null ? `${Math.max(seatsUsed, members.length)}/${seatsIncluded}` : members.length}
          helper={seatsIncluded !== null && seatsUsed !== null ? `${seatsFree ?? 0} cupos libres antes de bloquear nuevas altas` : 'Sin plan cargado'}
          tone={nearCapacity ? 'warning' : 'default'}
        />
      </div>

      {nearCapacity ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Tu workspace está al límite del plan. Las invitaciones pendientes también consumen cupos.</p>
        </div>
      ) : null}
      {status ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{status}</div> : null}
      {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div> : null}

      <div className="mt-4 space-y-3">
        {items.length ? items.map((member) => {
          const isOwner = ownerId === member.userId;
          const roleLabel = isOwner ? 'Owner' : formatOrganizationRole(member.role);
          const canEditThisMember = canManageRoles && !isOwner;

          return (
            <div key={member.id} className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                      {(member.fullName || member.email || 'U').slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{member.fullName || 'Usuario sin nombre'}</p>
                      <p className="truncate text-sm text-slate-500">{member.email}</p>
                    </div>
                    {isOwner ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                        <Crown className="h-3.5 w-3.5" />
                        Owner principal
                      </span>
                    ) : null}
                    {member.isDefault ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">Workspace por defecto</span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{roleLabel}</span>
                    {!isOwner ? <span className="text-xs text-slate-500">{roleHelper(member.role)}</span> : <span className="text-xs text-slate-500">Conserva control total del workspace y protege la configuración crítica.</span>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                  {canEditThisMember ? (
                    <Select className="min-w-[180px]" value={member.role} onChange={(event) => updateRole(member.id, event.target.value as OrganizationMemberItem['role'])} disabled={savingId === member.id}>
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </Select>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                      <ShieldCheck className="h-4 w-4" />
                      {isOwner ? 'Owner protegido' : roleLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            <Users className="mx-auto mb-3 h-5 w-5 text-slate-400" />
            Todavía no hay más miembros visibles en esta organización.
          </div>
        )}
      </div>
    </Card>
  );
}
