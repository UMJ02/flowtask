'use client';

import { useState } from 'react';
import { LogOut, PencilLine, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function OrganizationAdminSettingsCard({
  organizationId,
  organizationName,
  isOwner = false,
  canManage = false,
}: {
  organizationId: string;
  organizationName: string;
  isOwner?: boolean;
  canManage?: boolean;
}) {
  const [name, setName] = useState(organizationName);
  const [loading, setLoading] = useState<'save' | 'leave' | 'delete' | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateOrganization() {
    if (!canManage) return;
    setLoading('save');
    setStatus(null);
    setError(null);
    try {
      const response = await fetch('/api/organization/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId, name: name.trim(), action: 'rename' }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'No fue posible actualizar la organización.');
      setStatus(payload?.message || 'Información actualizada correctamente.');
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible actualizar la organización.');
    } finally {
      setLoading(null);
    }
  }

  async function leaveOrganization() {
    const confirmation = window.confirm('Vas a salir de esta organización. Tu trabajo personal seguirá intacto.');
    if (!confirmation) return;
    setLoading('leave');
    setStatus(null);
    setError(null);
    try {
      const response = await fetch('/api/organization/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId, action: 'leave' }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'No fue posible salir de la organización.');
      window.location.href = '/app/organization';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible salir de la organización.');
    } finally {
      setLoading(null);
    }
  }

  async function deleteOrganization() {
    const confirmation = window.confirm('La organización entrará en una ventana de eliminación de 10 días. Durante ese tiempo podrás reactivarla o borrarla definitivamente desde la bandeja de workspaces.');
    if (!confirmation) return;
    setLoading('delete');
    setStatus(null);
    setError(null);
    try {
      const response = await fetch('/api/organization/manage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'No fue posible programar la eliminación de la organización.');
      window.location.href = '/app/organization';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible programar la eliminación de la organización.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="rounded-[24px] p-4 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Ajustes del workspace</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">Mantén el nombre y las acciones sensibles bajo control</h3>
          <p className="mt-1 text-sm text-slate-600">Aquí puedes actualizar el nombre del equipo, salir del espacio o iniciar una eliminación programada.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Nombre de la organización</p>
          <Input value={name} onChange={(event) => setName(event.target.value)} disabled={!canManage || loading !== null} />
        </div>
        <Button type="button" className="h-11" onClick={updateOrganization} disabled={!canManage || !name.trim() || name.trim() === organizationName || loading !== null}>
          <PencilLine className="h-4 w-4" />
          {loading === 'save' ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {!isOwner ? (
          <Button type="button" variant="secondary" className="h-11" onClick={leaveOrganization} disabled={loading !== null}>
            <LogOut className="h-4 w-4" />
            {loading === 'leave' ? 'Saliendo...' : 'Salir de la organización'}
          </Button>
        ) : null}
        {isOwner ? (
          <Button type="button" variant="secondary" className="h-11 border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" onClick={deleteOrganization} disabled={loading !== null}>
            <Trash2 className="h-4 w-4" />
            {loading === 'delete' ? 'Programando...' : 'Eliminar organización'}
          </Button>
        ) : null}
      </div>
      {status ? <p className="mt-3 text-sm text-emerald-700">{status}</p> : null}
      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
    </Card>
  );
}
