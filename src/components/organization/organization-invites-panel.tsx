
'use client';

import { useState } from 'react';
import { Ban, MailCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { OrganizationInviteSummary } from '@/types/organization';

function roleLabel(role: OrganizationInviteSummary['role']) {
  if (role === 'admin_global') return 'Admin';
  if (role === 'manager') return 'Manager';
  if (role === 'member') return 'Member';
  return 'Viewer';
}

export function OrganizationInvitesPanel({ organizationId, invites, canManageInvites = false, seatsIncluded = null, seatsUsed = 0 }: { organizationId?: string | null; invites: OrganizationInviteSummary[]; canManageInvites?: boolean; seatsIncluded?: number | null; seatsUsed?: number | null; }) {
  const supabase = createClient();
  const [items, setItems] = useState(invites);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const pendingCount = items.filter((item) => item.status === 'pending').length;
  const reservedSeats = (seatsUsed ?? 0) + pendingCount;

  async function revokeInvite(inviteId: string) {
    if (!canManageInvites) return;
    setRevokingId(inviteId);
    const previous = items;
    setItems((current) => current.map((item) => (item.id === inviteId ? { ...item, status: 'revoked' } : item)));
    const { error } = await supabase.from('organization_invites').update({ status: 'revoked' }).eq('id', inviteId);
    if (error) setItems(previous);
    setRevokingId(null);
  }

  return (
    <Card className="rounded-[22px]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Invitaciones</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Bandeja de acceso del equipo</h2>
          <p className="mt-2 text-sm text-slate-600">Monitorea invitaciones pendientes, revoca accesos antes de aceptar y controla cuánto cupo queda reservado por plan.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Pendientes</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{pendingCount}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Cupos reservados</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{seatsIncluded && seatsIncluded > 0 ? `${reservedSeats}/${seatsIncluded}` : reservedSeats}</p>
          </div>
        </div>
      </div>
      {!canManageInvites ? <p className="mt-4 text-sm text-slate-500">Tu acceso actual solo permite revisar la organización. La revocación de invitaciones está bloqueada.</p> : null}
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr><th className="pb-2 pr-4 font-medium">Correo</th><th className="pb-2 pr-4 font-medium">Rol</th><th className="pb-2 pr-4 font-medium">Estado</th><th className="pb-2 pr-4 font-medium">Fecha</th>{canManageInvites ? <th className="pb-2 pr-4 font-medium">Acción</th> : null}</tr>
          </thead>
          <tbody>
            {items.length ? items.map((invite) => (
              <tr key={invite.id} className="border-t border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">{invite.email}</td>
                <td className="py-3 pr-4 text-slate-600">{roleLabel(invite.role)}</td>
                <td className="py-3 pr-4 text-slate-600"><span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${invite.status === 'pending' ? 'bg-amber-50 text-amber-700' : invite.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{invite.status === 'accepted' ? <MailCheck className="h-3.5 w-3.5" /> : null}{invite.status}</span></td>
                <td className="py-3 pr-4 text-slate-600">{invite.createdAtLabel}</td>
                {canManageInvites ? <td className="py-3 pr-4">{invite.status === 'pending' ? <Button type="button" variant="secondary" className="h-9 rounded-xl" onClick={() => revokeInvite(invite.id)} disabled={revokingId === invite.id}><Ban className="h-4 w-4" />{revokingId === invite.id ? 'Revocando...' : 'Revocar'}</Button> : <span className="text-xs text-slate-400">Sin acción</span>}</td> : null}
              </tr>
            )) : <tr><td colSpan={canManageInvites ? 5 : 4} className="py-6 text-sm text-slate-500">{canManageInvites ? 'Todavía no hay invitaciones para esta organización.' : 'No tienes acceso a la bandeja de invitaciones de esta organización.'}</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
