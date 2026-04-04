
'use client';

import { useEffect, useMemo, useState } from 'react';
import { MailPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const ROLE_OPTIONS = [
  { value: 'manager', label: 'Manager' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
] as const;

function buildCapacityLabel(seatsIncluded?: number | null, seatsUsed?: number | null, pendingInvites?: number | null) {
  if (!seatsIncluded || seatsIncluded <= 0) return 'Cupos ilimitados para este plan.';
  const reserved = (seatsUsed ?? 0) + (pendingInvites ?? 0);
  const remaining = Math.max(seatsIncluded - reserved, 0);
  return remaining > 0 ? `Quedan ${remaining} cupos antes de bloquear nuevas invitaciones.` : 'Ya alcanzaste el cupo disponible del plan actual.';
}

export function OrganizationInviteForm({ organizationId, canInviteManagers = false, canManageInvites = true, seatsIncluded = null, seatsUsed = 0, pendingInvites = 0, planName = 'Plan activo' }: { organizationId?: string | null; canInviteManagers?: boolean; canManageInvites?: boolean; seatsIncluded?: number | null; seatsUsed?: number | null; pendingInvites?: number | null; planName?: string; }) {
  const availableRoles = useMemo(() => ROLE_OPTIONS.filter((option) => canInviteManagers || option.value !== 'manager'), [canInviteManagers]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>(availableRoles[0]?.value ?? 'member');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const reservedSeats = (seatsUsed ?? 0) + (pendingInvites ?? 0);
  const atLimit = Boolean(seatsIncluded && seatsIncluded > 0 && reservedSeats >= seatsIncluded);

  useEffect(() => {
    setRole((current) => availableRoles.some((option) => option.value === current) ? current : (availableRoles[0]?.value ?? 'member'));
  }, [availableRoles]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organizationId || !email.trim() || !canManageInvites || loading || atLimit) return;
    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch('/api/organization/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId, email: email.trim().toLowerCase(), role }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error ?? 'No pudimos crear la invitación.');
      setStatus('Invitación creada correctamente. Recarga la vista para reflejar el nuevo cupo.');
      setEmail('');
      setRole(availableRoles[0]?.value ?? 'member');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'No pudimos crear la invitación.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Invitar miembro</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Alta controlada por plan</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Envía invitaciones desde una sola vista y bloquea automáticamente el exceso de miembros según el plan de la organización.</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p className="font-semibold">{planName}</p>
          <p className="mt-1">{buildCapacityLabel(seatsIncluded, seatsUsed, pendingInvites)}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_0.7fr_auto] md:items-end">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Correo del miembro</p>
          <Input type="email" placeholder="correo@empresa.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={!organizationId || !canManageInvites || loading || atLimit} />
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Rol inicial</p>
          <Select value={role} onChange={(event) => setRole(event.target.value)} disabled={!organizationId || !canManageInvites || loading || atLimit}>
            {availableRoles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </Select>
        </div>
        <Button type="submit" loading={loading} className="h-11" disabled={!organizationId || !canManageInvites || atLimit}>
          <MailPlus className="h-4 w-4" />
          {loading ? 'Enviando...' : 'Invitar'}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">Manager coordina equipo</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">Member ejecuta trabajo</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">Viewer solo consulta</span>
      </div>

      {!canManageInvites ? <p className="mt-4 text-sm text-slate-500">Tu rol actual no permite enviar nuevas invitaciones en esta organización.</p> : null}
      {atLimit ? <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">El plan actual alcanzó el máximo de miembros disponibles. Amplía el plan o revoca invitaciones pendientes para continuar.</p> : null}
      {status ? <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{status}</p> : null}
    </form>
  );
}
