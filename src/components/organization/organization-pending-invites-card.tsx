'use client';

import { useState } from 'react';
import { MailCheck, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { PendingOrganizationInviteSummary } from '@/types/organization';
import { formatOrganizationRole } from '@/lib/organization/labels';

export function OrganizationPendingInvitesCard({ invites }: { invites: PendingOrganizationInviteSummary[] }) {
  const [items, setItems] = useState(invites);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function acceptInvite(inviteId: string) {
    setLoadingId(inviteId);
    setError(null);
    try {
      const response = await fetch('/api/organization/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || 'No fue posible aceptar la invitación.');
      }
      window.location.href = payload?.redirectTo || '/app/organization';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible aceptar la invitación.');
    } finally {
      setLoadingId(null);
    }
  }

  if (!items.length) return null;

  return (
    <Card className="border border-sky-200/80 bg-sky-50/80 shadow-[0_16px_44px_rgba(14,165,233,0.08)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Invitaciones pendientes</p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">Únete a un workspace existente sin perder tu sesión actual</h2>
          <p className="mt-2 text-sm text-slate-600">
            Si ya te invitaron a una organización, acepta desde aquí y FlowTask activará ese workspace sin ocultar tu espacio personal.
          </p>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sky-700 ring-1 ring-sky-200">
          <MailCheck className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {items.map((invite) => (
          <div key={invite.id} className="rounded-[22px] border border-sky-100 bg-white px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{invite.organizationName}</p>
                <p className="text-sm text-slate-500">/{invite.organizationSlug}</p>
              </div>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
                {formatOrganizationRole(invite.role)}
              </span>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-slate-600">
              <p><strong>Correo:</strong> {invite.email}</p>
              <p><strong>Creada:</strong> {invite.createdAtLabel}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" className="h-10" loading={loadingId === invite.id} onClick={() => acceptInvite(invite.id)}>
                <Users className="h-4 w-4" />
                Aceptar invitación
              </Button>
            </div>
          </div>
        ))}
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </Card>
  );
}
