'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { DeletedOrganizationSummary } from '@/types/organization';

export function DeletedOrganizationsPanel({ organizations }: { organizations: DeletedOrganizationSummary[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reactivate(organizationId: string) {
    setLoading(`reactivate:${organizationId}`);
    setError(null);
    try {
      const response = await fetch('/api/organization/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId, action: 'reactivate' }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'No fue posible reactivar la organización.');
      window.location.href = '/app/organization?reactivated=1';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible reactivar la organización.');
    } finally {
      setLoading(null);
    }
  }

  async function destroyNow(organizationId: string) {
    const confirmed = window.confirm('Esta acción elimina la organización y sus datos compartidos de forma permanente.');
    if (!confirmed) return;
    setLoading(`delete:${organizationId}`);
    setError(null);
    try {
      const response = await fetch('/api/organization/manage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId, force: true }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'No fue posible borrar la organización.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible borrar la organización.');
    } finally {
      setLoading(null);
    }
  }

  if (!organizations.length) return null;

  return (
    <Card className="rounded-[24px] border border-amber-200 bg-amber-50/70 p-4 md:p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-amber-700 ring-1 ring-amber-200">
          <Building2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">Eliminación programada</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">Tus workspaces en pausa siguen disponibles para reactivar</h3>
          <p className="mt-1 text-sm text-slate-600">No desaparecen de inmediato: tienes 10 días para recuperarlos o borrarlos definitivamente.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {organizations.map((organization) => (
          <div key={organization.id} className="rounded-[20px] border border-amber-200/80 bg-white px-4 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{organization.name}</p>
                <p className="mt-1 text-sm text-slate-500">Se eliminará automáticamente el {organization.purgeScheduledAt ? new Date(organization.purgeScheduledAt).toLocaleDateString() : 'próximamente'}.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" className="h-10 rounded-xl" onClick={() => reactivate(organization.id)} disabled={loading !== null}>
                  <RotateCcw className="h-4 w-4" />
                  {loading === `reactivate:${organization.id}` ? 'Reactivando...' : 'Reactivar'}
                </Button>
                <Button type="button" variant="secondary" className="h-10 rounded-xl border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" onClick={() => destroyNow(organization.id)} disabled={loading !== null}>
                  <Trash2 className="h-4 w-4" />
                  {loading === `delete:${organization.id}` ? 'Eliminando...' : 'Eliminar ahora'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
    </Card>
  );
}
