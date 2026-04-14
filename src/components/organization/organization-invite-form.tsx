'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MailPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const ROLE_OPTIONS = [
  { value: 'manager', label: 'Manager' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
] as const;

export function OrganizationInviteForm({ organizationId, canInviteManagers = false, canManageInvites = true, compact = false }: { organizationId?: string | null; canInviteManagers?: boolean; canManageInvites?: boolean; compact?: boolean; }) {
  const router = useRouter();
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
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible crear la invitación.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={`grid gap-3 rounded-[24px] border border-slate-200 bg-slate-50/85 p-4 md:grid-cols-[1.2fr_0.7fr_auto] md:items-end ${compact ? 'shadow-[0_10px_24px_rgba(15,23,42,0.04)]' : ''}`}>
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Invitar a una persona</p>
        <Input type="email" placeholder="correo@empresa.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={!organizationId || !canManageInvites || loading} />
      </div>
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Rol</p>
        <Select value={role} onChange={(event) => setRole(event.target.value)} disabled={!organizationId || !canManageInvites || loading}>
          {availableRoles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </Select>
      </div>
      <Button type="submit" loading={loading} className="h-11" disabled={!organizationId || !canManageInvites}>
        <MailPlus className="h-4 w-4" />
        {loading ? 'Procesando...' : 'Invitar'}
      </Button>
      {!canManageInvites ? <p className="md:col-span-3 text-sm text-slate-500">Tu rol actual no permite enviar nuevas invitaciones en esta organización.</p> : null}
      {status ? <p className="md:col-span-3 text-sm text-emerald-700">{status}</p> : null}
      {error ? <p className="md:col-span-3 text-sm text-rose-700">{error}</p> : null}
    </form>
  );
}
