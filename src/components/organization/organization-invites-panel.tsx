'use client';

import { useState } from 'react';
import { Ban, ChevronDown, RefreshCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { OrganizationInviteSummary } from '@/types/organization';
import { formatOrganizationRole } from '@/lib/organization/labels';

export function OrganizationInvitesPanel({
  organizationId,
  invites,
  canManageInvites = false,
  embedded = false,
  defaultOpen = false,
  showHeader = true,
}: {
  organizationId?: string | null;
  invites: OrganizationInviteSummary[];
  canManageInvites?: boolean;
  embedded?: boolean;
  defaultOpen?: boolean;
  showHeader?: boolean;
}) {
  const [items, setItems] = useState(invites);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(defaultOpen);

  async function revokeInvite(inviteId: string) {
    if (!canManageInvites || !organizationId) return;
    setRevokingId(inviteId);
    setError(null);
    setStatus(null);
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
      setStatus('Invitación revocada correctamente.');
    } catch (err) {
      setItems(previous);
      setError(err instanceof Error ? err.message : 'No fue posible revocar la invitación.');
    } finally {
      setRevokingId(null);
    }
  }

  async function resendInvite(inviteId: string) {
    if (!canManageInvites || !organizationId) return;
    setResendingId(inviteId);
    setError(null);
    setStatus(null);
    try {
      const response = await fetch('/api/organization/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId, inviteId }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'No fue posible reenviar el correo.');
      setStatus(payload?.message || 'Correo reenviado correctamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible reenviar el correo.');
    } finally {
      setResendingId(null);
    }
  }

  const table = (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-left text-slate-500">
          <tr>
            <th className="pb-2 pr-4 font-medium">Correo</th>
            <th className="pb-2 pr-4 font-medium">Rol</th>
            <th className="pb-2 pr-4 font-medium">Estado</th>
            <th className="pb-2 pr-4 font-medium">Fecha</th>
            {canManageInvites ? <th className="pb-2 pr-4 font-medium">Acción</th> : null}
          </tr>
        </thead>
        <tbody>
          {items.length ? items.map((invite) => (
            <tr key={invite.id} className="border-t border-slate-100">
              <td className="py-3 pr-4 font-medium text-slate-900">{invite.email}</td>
              <td className="py-3 pr-4 text-slate-600">{formatOrganizationRole(invite.role)}</td>
              <td className="py-3 pr-4 text-slate-600">{invite.status}</td>
              <td className="py-3 pr-4 text-slate-600">{invite.createdAtLabel}</td>
              {canManageInvites ? (
                <td className="py-3 pr-4">
                  {invite.status === 'pending' ? (
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="secondary" className="h-9 rounded-xl" onClick={() => resendInvite(invite.id)} disabled={resendingId === invite.id || revokingId === invite.id}>
                        <RefreshCcw className="h-4 w-4" />
                        {resendingId === invite.id ? 'Reenviando...' : 'Reenviar'}
                      </Button>
                      <Button type="button" variant="secondary" className="h-9 rounded-xl" onClick={() => revokeInvite(invite.id)} disabled={revokingId === invite.id || resendingId === invite.id}>
                        <Ban className="h-4 w-4" />
                        {revokingId === invite.id ? 'Revocando...' : 'Revocar'}
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Sin acción</span>
                  )}
                </td>
              ) : null}
            </tr>
          )) : (
            <tr>
              <td colSpan={canManageInvites ? 5 : 4} className="py-6 text-sm text-slate-500">
                {canManageInvites ? 'Todavía no hay invitaciones activas en este workspace.' : 'No tienes acceso a la bandeja de invitaciones de este workspace.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {status ? <p className="mt-3 text-sm text-emerald-700">{status}</p> : null}
      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
    </div>
  );

  const content = showHeader ? (
    <div>
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-3 text-left transition hover:bg-slate-100">
        <div>
          <p className="text-sm font-semibold text-slate-900">Invitaciones</p>
          <p className="mt-1 text-sm text-slate-600">Controla altas pendientes, estados y correos de acceso del equipo.</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? <div className="mt-3">{table}</div> : null}
    </div>
  ) : table;

  return embedded ? content : <Card>{content}</Card>;
}
