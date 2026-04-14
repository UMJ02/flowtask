'use client';

import { useState } from 'react';
import { Ban, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { OrganizationInviteSummary } from '@/types/organization';
import { formatOrganizationRole } from '@/lib/organization/labels';

export function OrganizationInvitesPanel({ organizationId, invites, canManageInvites = false, embedded = false }: { organizationId?: string | null; invites: OrganizationInviteSummary[]; canManageInvites?: boolean; canInviteManagers?: boolean; embedded?: boolean; }) {
  const [items, setItems] = useState(invites);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(true);

  async function revokeInvite(inviteId: string) {
    if (!canManageInvites) return;
    setRevokingId(inviteId);
    setError(null);
    const previous = items;
    setItems((current) => current.map((item) => (item.id === inviteId ? { ...item, status: 'revoked' } : item)));
    try {
      const response = await fetch('/api/organization/invites', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId, status: 'revoked' }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'No fue posible revocar la invitación.');
    } catch (err) {
      setItems(previous);
      setError(err instanceof Error ? err.message : 'No fue posible revocar la invitación.');
    } finally {
      setRevokingId(null);
    }
  }

  const content = (
    <div>
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-3 text-left transition hover:bg-slate-100">
        <div>
          <p className="text-sm font-semibold text-slate-900">Invitaciones</p>
          <p className="mt-1 text-sm text-slate-600">Revisa quién está pendiente de entrar y el rol reservado para cada acceso.</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <>
          {!canManageInvites ? <p className="mt-4 text-sm text-slate-500">Tu rol actual permite ver la organización, pero no gestionar invitaciones.</p> : null}
          {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr><th className="pb-2 pr-4 font-medium">Correo</th><th className="pb-2 pr-4 font-medium">Rol</th><th className="pb-2 pr-4 font-medium">Estado</th><th className="pb-2 pr-4 font-medium">Fecha</th>{canManageInvites ? <th className="pb-2 pr-4 font-medium">Acción</th> : null}</tr>
              </thead>
              <tbody>
                {items.length ? items.map((invite) => (
                  <tr key={invite.id} className="border-t border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-900">{invite.email}</td>
                    <td className="py-3 pr-4 text-slate-600">{formatOrganizationRole(invite.role)}</td>
                    <td className="py-3 pr-4 text-slate-600">{invite.status}</td>
                    <td className="py-3 pr-4 text-slate-600">{invite.createdAtLabel}</td>
                    {canManageInvites ? <td className="py-3 pr-4">{invite.status === 'pending' ? <Button type="button" variant="secondary" className="h-9 rounded-xl" onClick={() => revokeInvite(invite.id)} disabled={revokingId === invite.id}><Ban className="h-4 w-4" />{revokingId === invite.id ? 'Revocando...' : 'Revocar'}</Button> : <span className="text-xs text-slate-400">Sin acción</span>}</td> : null}
                  </tr>
                )) : <tr><td colSpan={canManageInvites ? 5 : 4} className="py-6 text-sm text-slate-500">{canManageInvites ? 'Todavía no hay invitaciones activas en esta organización.' : 'No tienes acceso a la bandeja de invitaciones de esta organización.'}</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );

  return embedded ? content : <Card>{content}</Card>;
}
