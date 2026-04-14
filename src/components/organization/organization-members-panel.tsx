'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Crown, ShieldCheck, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { OrganizationSummary, OrganizationMetricSummary } from '@/types/organization';
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

const metricTones = {
  admins: 'border border-slate-200 bg-slate-950 text-white',
  managers: 'border border-emerald-100 bg-emerald-50 text-emerald-950',
  pending: 'border border-amber-100 bg-amber-50 text-amber-950',
  capacity: 'border border-sky-100 bg-sky-50 text-sky-950',
} as const;

function roleHelper(role: OrganizationMemberItem['role']) {
  return describeOrganizationRole(role);
}

function StatCard({ title, value, helper, tone }: { title: string; value: number | string; helper: string; tone: string }) {
  return (
    <div className={`rounded-[20px] px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)] ${tone}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-80">{title}</p>
      <p className="mt-2 text-3xl font-bold leading-none">{value}</p>
      <p className="mt-2 text-sm opacity-85">{helper}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 text-sm text-slate-600">
      <span>{label}</span>
      <strong className="text-slate-950">{value}</strong>
    </div>
  );
}

export function OrganizationMembersPanel({
  activeOrganization,
  members,
  metrics,
  canManageRoles = false,
  seatsIncluded = null,
  seatsUsed = null,
  pendingInvites = 0,
}: {
  activeOrganization?: OrganizationSummary | null;
  members: OrganizationMemberItem[];
  metrics?: OrganizationMetricSummary | null;
  canManageRoles?: boolean;
  seatsIncluded?: number | null;
  seatsUsed?: number | null;
  pendingInvites?: number;
}) {
  const [items, setItems] = useState(members);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [teamExpanded, setTeamExpanded] = useState(true);

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
      if (!response.ok) throw new Error(payload?.error || 'No fue posible actualizar el rol.');
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
  const seatsFree = seatsIncluded !== null && seatsUsed !== null ? Math.max(seatsIncluded - Math.max(seatsUsed, items.length) - pendingInvites, 0) : null;
  const nearCapacity = seatsIncluded !== null && seatsUsed !== null ? seatsUsed + pendingInvites >= seatsIncluded : false;

  return (
    <Card className="rounded-[26px] p-4 md:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Equipo y capacidad</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">Tu organización en una sola vista</h2>
          <p className="mt-1 text-sm text-slate-600">Consulta cómo va el equipo, revisa cupos y ajusta roles sin moverte de aquí.</p>
        </div>
        <Button type="button" variant="secondary" className="h-10 rounded-2xl px-4" onClick={() => setTeamExpanded((value) => !value)}>
          {teamExpanded ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {teamExpanded ? 'Ocultar detalle del equipo' : 'Mostrar detalle del equipo'}
        </Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-[24px] border border-slate-200/80 bg-slate-50/65">
        <div className={`grid transition-[grid-template-columns] duration-300 ease-out xl:min-h-[540px] ${teamExpanded ? 'xl:grid-cols-[1.02fr_1.15fr]' : 'xl:grid-cols-[1fr_0fr]'}`}>
          <div className="min-w-0 border-b border-slate-200/80 p-4 xl:border-b-0 xl:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Panel del workspace</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">Lo importante del espacio hoy</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <StatCard title="Miembros" value={String(metrics?.members ?? items.length ?? 0)} helper="Personas activas en este equipo" tone={metricTones.admins} />
              <StatCard title="Clientes" value={String(metrics?.clients ?? 0)} helper="Clientes gestionados por la organización" tone={metricTones.managers} />
              <StatCard title="Proyectos activos" value={String(metrics?.activeProjects ?? 0)} helper="Proyectos que siguen en marcha" tone={metricTones.capacity} />
              <StatCard title="Tareas abiertas" value={String(metrics?.openTasks ?? 0)} helper="Trabajo pendiente dentro del espacio" tone={metricTones.pending} />
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <div className="rounded-[22px] border border-slate-200/80 bg-white/90 p-3.5">
                <p className="text-sm font-semibold text-slate-950">Distribución de roles</p>
                <div className="mt-3 space-y-2">
                  <Row label="Admins globales" value={metrics?.roleBreakdown.admin_global ?? counters.admin_global} />
                  <Row label="Managers" value={metrics?.roleBreakdown.manager ?? counters.manager} />
                  <Row label="Members" value={metrics?.roleBreakdown.member ?? counters.member} />
                  <Row label="Viewers" value={metrics?.roleBreakdown.viewer ?? counters.viewer} />
                </div>
              </div>
              <div className="rounded-[22px] border border-slate-200/80 bg-white/90 p-3.5">
                <p className="text-sm font-semibold text-slate-950">Cobertura operativa</p>
                <div className="mt-3 space-y-2">
                  <Row label="Clientes editables" value={metrics?.editableClients ?? 0} />
                  <Row label="Con gestión de miembros" value={metrics?.memberManagedClients ?? 0} />
                  <Row label="Solo lectura" value={metrics?.readOnlyClients ?? 0} />
                  <Row label="Invitaciones pendientes" value={pendingInvites} />
                </div>
              </div>
            </div>
          </div>

          <div className={`min-w-0 overflow-hidden transition-all duration-300 ease-out ${teamExpanded ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0 xl:max-h-[1px]'}`}>
            <div className="p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Detalle del equipo</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950">Personas, cupos y roles</h3>
                </div>
                {nearCapacity ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Te estás acercando al límite del plan
                  </span>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Admins" value={counters.admin_global} helper="Controlan el espacio y sus accesos" tone={metricTones.admins} />
                <StatCard title="Managers" value={counters.manager} helper="Coordinan el trabajo del equipo" tone={metricTones.managers} />
                <StatCard title="Pendientes" value={pendingInvites} helper="Aún no aceptan la invitación" tone={metricTones.pending} />
                <StatCard title="Capacidad" value={seatsIncluded !== null && seatsUsed !== null ? `${Math.max(seatsUsed, items.length)}/${seatsIncluded}` : items.length} helper={seatsIncluded !== null && seatsUsed !== null ? `${seatsFree ?? 0} cupos disponibles` : 'Sin capacidad registrada'} tone={metricTones.capacity} />
              </div>

              {status ? <p className="mt-3 text-sm text-emerald-700">{status}</p> : null}
              {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}

              <div className="mt-4 space-y-3">
                {items.length ? items.map((member) => {
                  const isOwner = ownerId === member.userId;
                  const roleLabel = formatOrganizationRole(member.role);
                  const canEditThisMember = canManageRoles && !isOwner;

                  return (
                    <div key={member.id} className="rounded-[22px] border border-slate-200/80 bg-white px-3.5 py-3.5 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                              {(member.fullName || member.email || 'U').slice(0, 2).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">{member.fullName || 'Usuario sin nombre'}</p>
                              <p className="truncate text-sm text-slate-500">{member.email}</p>
                            </div>
                            {isOwner ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                                <Crown className="h-3.5 w-3.5" />
                                Owner principal
                              </span>
                            ) : null}
                            {member.isDefault ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">Workspace por defecto</span> : null}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{roleLabel}</span>
                            <span className="text-xs text-slate-500">{isOwner ? 'Mantiene el control principal del espacio.' : roleHelper(member.role)}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                          {canEditThisMember ? (
                            <Select className="min-w-[170px]" value={member.role} onChange={(event) => updateRole(member.id, event.target.value as OrganizationMemberItem['role'])} disabled={savingId === member.id}>
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
                    Aún no hay más personas visibles dentro de esta organización.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
