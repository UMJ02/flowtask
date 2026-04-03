"use client";

import { useState, useTransition } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { AdminActivationCodeSummary } from '@/types/admin';

export function AdminActivationCodesPanel({ items }: { items: AdminActivationCodeSummary[] }) {
  const [planCode, setPlanCode] = useState('business');
  const [accountMode, setAccountMode] = useState('team_owner');
  const [customCode, setCustomCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    setMessage(null); setError(null);
    startTransition(async () => {
      try {
        const response = await fetch('/api/platform/activation-codes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planCode, accountMode, code: customCode, expiresAt }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? 'No se pudo crear el código.');
        setCustomCode(''); setExpiresAt('');
        setMessage(`Código creado: ${result.data.code}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo crear el código.');
      }
    });
  };

  return (
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Códigos corporativos</h3>
          <p className="mt-1 text-sm text-slate-500">Genera códigos únicos para activar planes individuales o workspaces de equipo sin duplicar la lógica actual de suscripciones.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700"><KeyRound className="h-4 w-4 text-slate-500" />Admin only</div>
      </div>
      {message ? <p className="mt-4 text-sm font-medium text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-4 text-sm font-medium text-rose-700">{error}</p> : null}
      <div className="mt-5 grid gap-3 lg:grid-cols-[0.9fr_0.9fr_1fr_0.9fr_auto]">
        <select value={planCode} onChange={(event) => setPlanCode(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"><option value="individual">Individual</option><option value="basic">Basic</option><option value="plus">Plus</option><option value="business">Business</option></select>
        <select value={accountMode} onChange={(event) => setAccountMode(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"><option value="team_owner">Equipo / empresa</option><option value="individual">Individual</option></select>
        <input value={customCode} onChange={(event) => setCustomCode(event.target.value.toUpperCase())} placeholder="Código opcional" className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700" />
        <input type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700" />
        <button type="button" onClick={handleCreate} disabled={isPending} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear'}</button>
      </div>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.code}</p>
                <p className="mt-1 text-sm text-slate-500">{item.planName} · {item.accountMode.replace('_', ' ')} · {item.billingCycle}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em]">
                <span className={item.isUsed ? 'rounded-full bg-slate-200 px-3 py-1 text-slate-600' : 'rounded-full bg-emerald-100 px-3 py-1 text-emerald-700'}>{item.isUsed ? 'Usado' : 'Disponible'}</span>
                <span className="rounded-full bg-white px-3 py-1 text-slate-500">Vence: {item.expiresAtLabel}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
