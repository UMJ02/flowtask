'use client';

import { useMemo, useState } from 'react';
import { MailPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const ROLE_OPTIONS = [
  { value: 'manager', label: 'Manager' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
] as const;

export function OrganizationInviteForm({ organizationId, canInviteManagers = false, canManageInvites = true }: { organizationId?: string | null; canInviteManagers?: boolean; canManageInvites?: boolean; }) {
  const availableRoles = useMemo(() => ROLE_OPTIONS.filter((option) => canInviteManagers || option.value !== 'manager'), [canInviteManagers]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>(availableRoles[0]?.value ?? 'member');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organizationId || !email.trim() || !canManageInvites) return;
    setLoading(true);
    setStatus(null);
    setError(null);

    try {
      const response = await fetch('/api/organization/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId, email: email.trim(), role }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'No fue posible crear la invitación.');
      setStatus(payload?.message || 'Invitación creada correctamente.');
      setEmail('');
      setRole(availableRoles[0]?.value ?? 'member');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible crear la invitación.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1.2fr_0.7fr_auto] md:items-end">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Invitar miembro</p>
        <Input type="email" placeholder="correo@empresa.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={!organizationId || !canManageInvites || loading} />
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Rol</p>
        <Select value={role} onChange={(event) => setRole(event.target.value)} disabled={!organizationId || !canManageInvites || loading}>
          {availableRoles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </Select>
      </div>
      <Button type="submit" loading={loading} className="h-11" disabled={!organizationId || !canManageInvites}>
        <MailPlus className="h-4 w-4" />
        {loading ? 'Enviando...' : 'Invitar'}
      </Button>
      {!canManageInvites ? <p className="md:col-span-3 text-sm text-slate-500">Tu rol actual no permite enviar nuevas invitaciones en esta organización.</p> : null}
      {status ? <p className="md:col-span-3 text-sm text-emerald-700">{status}</p> : null}
      {error ? <p className="md:col-span-3 text-sm text-rose-700">{error}</p> : null}
    </form>
  );
}
