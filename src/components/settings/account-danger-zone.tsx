'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function AccountDangerZone() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const canDelete = confirmation.trim().toUpperCase() === 'ELIMINAR';

  const requestDelete = async () => {
    if (!canDelete || busy) return;
    setBusy(true);
    setNotice(null);
    const response = await fetch('/api/account/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmation: confirmation.trim() }),
    });
    const payload = await response.json().catch(() => null);
    setBusy(false);

    if (!response.ok) {
      setNotice({ tone: 'error', message: payload?.error ?? 'No pudimos procesar la eliminación de la cuenta.' });
      return;
    }

    setNotice({ tone: 'success', message: 'Solicitud de eliminación registrada. Cerrando sesión…' });
    window.setTimeout(() => {
      window.location.href = '/login?reason=account-delete';
    }, 1200);
  };

  return (
    <Card className="ft-settings-danger-panel p-6 md:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-600">
            <AlertTriangle className="h-4 w-4" />
            Zona de peligro
          </p>
          <h2 className="mt-2 text-[22px] font-extrabold text-[#0F172A]">Eliminar cuenta</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#64748B]">
            Eliminar tu cuenta individual también programa la eliminación de tus datos personales y organizaciones asociadas. Esta acción requiere confirmación explícita.
          </p>
        </div>
        <Button type="button" onClick={() => setOpen((value) => !value)} className="h-11 rounded-xl bg-[#E11D48] px-5 text-white shadow-[0_12px_26px_rgba(225,29,72,.20)] hover:bg-[#BE123C]">
          <Trash2 className="h-4 w-4" />
          Eliminar cuenta
        </Button>
      </div>

      {open ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-bold text-rose-900">Confirmá escribiendo ELIMINAR</p>
          <p className="mt-1 text-xs font-semibold text-rose-700">Esta solicitud cierra la sesión y marca la cuenta para eliminación segura.</p>
          <input
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="mt-4 h-11 w-full rounded-xl border border-rose-200 bg-white px-3 text-sm font-bold text-rose-900 outline-none focus:border-rose-500"
            placeholder="ELIMINAR"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => { setOpen(false); setConfirmation(''); }} className="h-10 rounded-xl px-4">
              Cancelar
            </Button>
            <Button type="button" disabled={!canDelete || busy} onClick={() => void requestDelete()} className="h-10 rounded-xl bg-[#E11D48] px-5 text-white shadow-[0_12px_26px_rgba(225,29,72,.20)] hover:bg-[#BE123C] disabled:opacity-50">
              {busy ? 'Procesando…' : 'Confirmar eliminación'}
            </Button>
          </div>
        </div>
      ) : null}

      {notice ? (
        <div className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold ${notice.tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {notice.message}
        </div>
      ) : null}
    </Card>
  );
}
