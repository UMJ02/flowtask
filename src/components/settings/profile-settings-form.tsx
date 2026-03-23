'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function ProfileSettingsForm({
  initialFullName,
  email,
}: {
  initialFullName?: string | null;
  email: string;
}) {
  const [fullName, setFullName] = useState(initialFullName ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      setSaving(false);
      setMessage('No pudimos identificar tu sesión.');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() || null })
      .eq('id', user.id);

    setSaving(false);
    setMessage(error ? 'No se pudo guardar tu perfil.' : 'Perfil actualizado correctamente.');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Nombre</span>
        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Cómo quieres que te vean en la app"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Correo</span>
        <input
          value={email}
          disabled
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
        />
      </label>
      <div className="md:col-span-2 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-w-[170px] items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_30px_rgba(16,185,129,0.24)] transition hover:bg-emerald-400 disabled:opacity-70"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
        {message ? <p className="text-sm text-slate-500">{message}</p> : null}
      </div>
    </form>
  );
}
