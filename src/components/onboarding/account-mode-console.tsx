"use client";

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, CheckCircle2, KeyRound, Loader2, ShieldCheck, UserRound } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { AccountAccessSummary } from '@/lib/queries/account-access';

const TEAM_PLANS = [
  { code: 'basic', name: 'Basic', seats: '10 miembros', accent: 'from-sky-500 to-cyan-400' },
  { code: 'plus', name: 'Plus', seats: '50 miembros', accent: 'from-violet-500 to-fuchsia-400' },
  { code: 'business', name: 'Business', seats: 'Ilimitado', accent: 'from-emerald-500 to-teal-400' },
] as const;

function tone(active: boolean) {
  return active
    ? 'border-slate-900 bg-slate-900 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]'
    : 'border-slate-200 bg-white text-slate-900';
}

export function AccountModeConsole({ access }: { access: AccountAccessSummary }) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(access.selectedPlanCode ?? 'basic');
  const [workspaceName, setWorkspaceName] = useState(access.activeOrganizationName ?? '');
  const [workspaceSlug, setWorkspaceSlug] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activePlan = useMemo(() => TEAM_PLANS.find((plan) => plan.code === selectedPlan) ?? TEAM_PLANS[0], [selectedPlan]);

  async function postJson(url: string, body: Record<string, unknown>) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({ ok: false, error: 'Respuesta inválida.' }));
    if (!response.ok) throw new Error(result.error ?? 'No se pudo completar la acción.');
    return result;
  }

  const activateIndividual = () => {
    setMessage(null); setError(null);
    startTransition(async () => {
      try {
        const result = await postJson('/api/account/select-mode', {
          accountMode: 'individual',
          selectedPlanCode: 'individual',
          selectedPlanName: 'Individual',
          billingCycle: 'annual',
        });
        setMessage(result.message ?? 'Tu cuenta quedó lista en modo individual.');
        router.refresh();
        if (result.redirectTo) router.push(result.redirectTo as string);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo activar el modo individual.');
      }
    });
  };

  const activateTeamPlan = () => {
    setMessage(null); setError(null);
    startTransition(async () => {
      try {
        const result = await postJson('/api/account/select-mode', {
          accountMode: 'team_owner',
          selectedPlanCode: activePlan.code,
          selectedPlanName: activePlan.name,
          billingCycle: 'annual',
        });
        setMessage(result.message ?? `Plan ${activePlan.name} listo. Ahora puedes crear tu organización.`);
        router.refresh();
        if (result.redirectTo) router.push(result.redirectTo as string);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo activar el plan de equipo.');
      }
    });
  };

  const redeemCode = () => {
    setMessage(null); setError(null);
    startTransition(async () => {
      try {
        const result = await postJson('/api/account/redeem-code', { code });
        setCode('');
        setMessage(result.message ?? 'Código aplicado correctamente.');
        router.refresh();
        if (result.redirectTo) router.push(result.redirectTo as string);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo validar el código.');
      }
    });
  };

  const createWorkspace = () => {
    setMessage(null); setError(null);
    startTransition(async () => {
      try {
        const result = await postJson('/api/account/create-workspace', { name: workspaceName, slug: workspaceSlug });
        setMessage(result.message ?? 'Workspace creado correctamente.');
        router.refresh();
        if (result.redirectTo) router.push(result.redirectTo as string);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo crear la organización.');
      }
    });
  };

  return (
    <Card className="border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Acceso moderno</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">Define si trabajarás solo o con un equipo</h3>
          <p className="mt-2 text-sm text-slate-500">Esta capa moderniza el onboarding usando la estructura actual de organizaciones, miembros y suscripción del workspace, sin duplicar lógica.</p>
        </div>
        <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Modo actual: <span className="font-semibold">{access.currentMode ? access.currentMode.replace('_', ' ') : 'Sin definir'}</span>
          {access.selectedPlanName ? <span className="ml-2 text-emerald-700">· {access.selectedPlanName}</span> : null}
          {access.hasWorkspace && access.activeOrganizationName ? <span className="ml-2 text-emerald-700">· {access.activeOrganizationName}</span> : null}
        </div>
      </div>

      {message ? <p className="mt-4 text-sm font-medium text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-4 text-sm font-medium text-rose-700">{error}</p> : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className={`rounded-[28px] border px-5 py-5 ${tone(access.currentMode === 'individual')}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Modo personal</p>
              <h4 className="mt-2 text-xl font-bold">Uso individual</h4>
              <p className={`mt-2 text-sm ${access.currentMode === 'individual' ? 'text-slate-200' : 'text-slate-500'}`}>Ideal para trabajar con clientes, proyectos y tareas sin depender de una organización ni de miembros adicionales.</p>
            </div>
            <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${access.currentMode === 'individual' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'}`}>
              <UserRound className="h-5 w-5" />
            </span>
          </div>
          <ul className={`mt-4 space-y-2 text-sm ${access.currentMode === 'individual' ? 'text-slate-200' : 'text-slate-600'}`}>
            <li>• Flujo completo personal.</li>
            <li>• Sin miembros ni invitaciones.</li>
            <li>• Compatible con la base actual.</li>
          </ul>
          <button type="button" onClick={activateIndividual} disabled={isPending} className={access.currentMode === 'individual' ? 'mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white' : 'mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white'}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {access.currentMode === 'individual' ? 'Modo activo' : 'Usar FlowTask solo'}
          </button>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Workspace colaborativo</p>
              <h4 className="mt-2 text-xl font-bold text-slate-900">Equipo / empresa</h4>
              <p className="mt-2 text-sm text-slate-500">Selecciona un plan de equipo o canjea un código corporativo. Luego crearás la organización sobre la estructura actual del proyecto.</p>
            </div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Building2 className="h-5 w-5" />
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {TEAM_PLANS.map((plan) => {
              const active = selectedPlan === plan.code;
              return (
                <button key={plan.code} type="button" onClick={() => setSelectedPlan(plan.code)} className={active ? `rounded-[24px] border border-transparent bg-gradient-to-br ${plan.accent} px-4 py-4 text-left text-white shadow-[0_16px_32px_rgba(59,130,246,0.18)]` : 'rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-left text-slate-900'}>
                  <p className="text-sm font-semibold">{plan.name}</p>
                  <p className={`mt-2 text-xs ${active ? 'text-white/80' : 'text-slate-500'}`}>{plan.seats}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={activateTeamPlan} disabled={isPending} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Activar plan {activePlan.name}
            </button>
            {access.currentMode === 'team_owner' && access.selectedPlanName ? <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">Activo: {access.selectedPlanName}</span> : null}
          </div>

          <div className="mt-5 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><KeyRound className="h-4 w-4 text-slate-500" />Código corporativo</div>
            <div className="mt-3 flex flex-col gap-3 md:flex-row">
              <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="FLOW-BUSINESS-2026" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none" />
              <button type="button" onClick={redeemCode} disabled={isPending || !code.trim()} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Aplicar código</button>
            </div>
          </div>

          {access.canCreateWorkspace ? (
            <div className="mt-5 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4">
              <h5 className="text-sm font-semibold text-emerald-900">Crear organización</h5>
              <p className="mt-1 text-sm text-emerald-800">Tu acceso ya está listo. Ahora crea el workspace y quedarás como admin inicial.</p>
              <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.7fr_auto]">
                <input value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} placeholder="Canvas Gráfica CR" className="rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none" />
                <input value={workspaceSlug} onChange={(event) => setWorkspaceSlug(event.target.value)} placeholder="canvas-grafica-cr" className="rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none" />
                <button type="button" onClick={createWorkspace} disabled={isPending || !workspaceName.trim()} className="rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Crear workspace</button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
