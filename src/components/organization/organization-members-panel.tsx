
'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Check, Crown, LockKeyhole, ShieldCheck, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import type { OrganizationMemberSummary, OrganizationSummary } from '@/types/organization';

const ROLE_OPTIONS = [
  { value: 'admin_global', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
] as const;

function describeRole(role: OrganizationMemberSummary['role'], isOwner: boolean) {
  if (isOwner) return 'Owner del workspace y administrador principal del plan.';
  if (role === 'admin_global') return 'Admin con control de roles, invitaciones y operación.';
  if (role === 'manager') return 'Coordina clientes, proyectos y seguimiento del equipo.';
  if (role === 'viewer') return 'Solo lectura para monitoreo y aprobación.';
  return 'Ejecuta trabajo operativo con acceso estándar.';
}

function roleLabel(role: OrganizationMemberSummary['role'], isOwner: boolean) {
  if (isOwner) return 'Owner';
  if (role === 'admin_global') return 'Admin';
  if (role === 'manager') return 'Manager';
  if (role === 'member') return 'Member';
  return 'Viewer';
}

function roleTone(role: OrganizationMemberSummary['role'], isOwner: boolean) {
  if (isOwner) return 'bg-amber-50 text-amber-800 ring-amber-100';
  if (role === 'admin_global') return 'bg-violet-50 text-violet-800 ring-violet-100';
  if (role === 'manager') return 'bg-sky-50 text-sky-800 ring-sky-100';
  if (role === 'member') return 'bg-emerald-50 text-emerald-800 ring-emerald-100';
  return 'bg-slate-100 text-slate-700 ring-slate-200';
}

export function OrganizationMembersPanel({ activeOrganization, members, canManageRoles = false, seatsIncluded = null, seatsUsed = 0, pendingInvites = 0, planName = 'Plan activo' }: { activeOrganization?: OrganizationSummary | null; members: OrganizationMemberSummary[]; canManageRoles?: boolean; seatsIncluded?: number | null; seatsUsed?: number | null; pendingInvites?: number | null; planName?: string; }) {
  const [items, setItems] = useState(members);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const reservedSeats = (seatsUsed ?? items.length) + (pendingInvites ?? 0);
  const isUnlimited = !seatsIncluded || seatsIncluded <= 0;
  const seatsRemaining = isUnlimited ? null : Math.max((seatsIncluded ?? 0) - reservedSeats, 0);

  async function updateRole(memberId: string, role: OrganizationMemberSummary['role']) {
    const target = items.find((item) => item.id === memberId);
    if (!target || target.isOwner) return;
    setSavingId(memberId);
    setStatus(null);
    const previous = items;
    setItems((current) => current.map((item) => (item.id === memberId ? { ...item, role } : item)));
    try {
      const response = await fetch('/api/organization/members/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: activeOrganization?.id, memberId, role }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error ?? 'No pudimos actualizar el rol.');
      setStatus('Rol actualizado correctamente.');
    } catch (error) {
      setItems(previous);
      setStatus(error instanceof Error ? error.message : 'No pudimos actualizar el rol.');
    } finally {
      setSavingId(null);
    }
  }

  const counters = useMemo(() => ({
    owner: items.filter((item) => item.isOwner).length,
    admin: items.filter((item) => !item.isOwner && item.role === 'admin_global').length,
    manager: items.filter((item) => item.role === 'manager').length,
    member: items.filter((item) => item.role === 'member').length,
  }), [items]);

  return (
    <Card className="rounded-[22px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Equipo de organización</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">{activeOrganization ? activeOrganization.name : 'Miembros y roles'}</h2>
          <p className="mt-2 text-sm text-slate-600">Gestiona el equipo con una lectura clara de owner, admin, manager y member. Los cambios de rol se bloquean cuando comprometen la seguridad del workspace.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Plan</p>
            <p className="mt-1 font-semibold text-slate-900">{planName}</p>
            <p className="mt-1 text-slate-600">{isUnlimited ? 'Sin límite de miembros.' : `${reservedSeats}/${seatsIncluded} cupos reservados`}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Capacidad libre</p>
            <p className="mt-1 font-semibold text-slate-900">{isUnlimited ? 'Ilimitada' : seatsRemaining}</p>
            <p className="mt-1 text-slate-600">{pendingInvites ? `${pendingInvites} invitaciones pendientes reservan cupo.` : 'Sin invitaciones bloqueando capacidad.'}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Owner" value={counters.owner} tone="amber" />
        <Metric title="Admins" value={counters.admin} tone="violet" />
        <Metric title="Managers" value={counters.manager} tone="sky" />
        <Metric title="Members" value={counters.member} tone="emerald" />
      </div>
      <div className="mt-4 grid gap-3 xl:grid-cols-4">
        <RoleLegend title="Owner" description="Admin principal y titular del workspace." tone="amber" icon={<Crown className="h-4 w-4" />} />
        <RoleLegend title="Admin" description="Gestiona roles, invitaciones y estructura." tone="violet" icon={<ShieldCheck className="h-4 w-4" />} />
        <RoleLegend title="Manager" description="Coordina la operación diaria del equipo." tone="sky" icon={<Users className="h-4 w-4" />} />
        <RoleLegend title="Member" description="Ejecuta trabajo y seguimiento asignado." tone="emerald" icon={<Check className="h-4 w-4" />} />
      </div>
      {status ? <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">{status}</div> : null}
      <div className="mt-4 space-y-3">
        {items.length ? items.map((member) => {
          const locked = member.isOwner;
          return (
            <div key={member.id} className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">{(member.fullName || member.email || 'U').slice(0, 2).toUpperCase()}</span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{member.fullName || 'Usuario sin nombre'}</p>
                      <p className="truncate text-sm text-slate-500">{member.email}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${roleTone(member.role, member.isOwner)}`}>{roleLabel(member.role, member.isOwner)}</span>
                    {member.isDefault ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">Organización por defecto</span> : null}
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{describeRole(member.role, member.isOwner)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                  {canManageRoles ? <Select className="min-w-[190px]" value={member.role} onChange={(event) => updateRole(member.id, event.target.value as OrganizationMemberSummary['role'])} disabled={savingId === member.id || locked}>{ROLE_OPTIONS.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</Select> : <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">{roleLabel(member.role, member.isOwner)}</span>}
                  {locked ? <span className="inline-flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800"><LockKeyhole className="h-4 w-4" />Owner bloqueado</span> : savingId === member.id ? <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600"><ShieldCheck className="h-4 w-4" />Guardando...</span> : canManageRoles ? <span className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700"><Check className="h-4 w-4" />Editable</span> : null}
                </div>
              </div>
            </div>
          );
        }) : <div className="rounded-[22px] border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">No hay miembros para mostrar en esta organización.</div>}
      </div>
    </Card>
  );
}

function Metric({ title, value, tone }: { title: string; value: number; tone: 'amber' | 'violet' | 'sky' | 'emerald' }) {
  const toneClass = tone === 'amber' ? 'bg-amber-50 text-amber-900 border-amber-100' : tone === 'violet' ? 'bg-violet-50 text-violet-900 border-violet-100' : tone === 'sky' ? 'bg-sky-50 text-sky-900 border-sky-100' : 'bg-emerald-50 text-emerald-900 border-emerald-100';
  return <div className={`rounded-2xl border px-4 py-3 ${toneClass}`}><p className="text-[11px] uppercase tracking-[0.18em] opacity-70">{title}</p><p className="mt-1 text-lg font-bold">{value}</p></div>;
}

function RoleLegend({ title, description, tone, icon }: { title: string; description: string; tone: 'amber' | 'violet' | 'sky' | 'emerald'; icon: ReactNode }) {
  const toneClass = tone === 'amber' ? 'bg-amber-50 text-amber-800 border-amber-100' : tone === 'violet' ? 'bg-violet-50 text-violet-800 border-violet-100' : tone === 'sky' ? 'bg-sky-50 text-sky-800 border-sky-100' : 'bg-emerald-50 text-emerald-800 border-emerald-100';
  return <div className={`rounded-2xl border px-4 py-3 ${toneClass}`}><div className="flex items-center gap-2 text-sm font-semibold">{icon}<span>{title}</span></div><p className="mt-2 text-sm opacity-80">{description}</p></div>;
}
