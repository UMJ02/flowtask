"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { OrganizationPlanSummary } from "@/types/billing";

const PLAN_OPTIONS = [
  { value: "basic", label: "Basic" },
  { value: "plus", label: "Plus" },
  { value: "business", label: "Business" },
] as const;

export function OrganizationSubscriptionLifecyclePanel({ summary }: { summary?: OrganizationPlanSummary | null }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState(summary?.planCode ?? "basic");
  const [isPending, startTransition] = useTransition();

  const send = (payload: Record<string, unknown>) => {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/organization/billing/manage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result?.error ?? "No pudimos actualizar el plan.");
        setMessage(result?.message ?? "Cambio aplicado.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "No pudimos actualizar el plan.");
      }
    });
  };

  return (
    <Card>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Ciclo comercial</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Renovación anual, upgrade y downgrade</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Controla la continuidad del plan, programa cambios para la siguiente vigencia y mantén visible la relación entre código corporativo, suscripción y bloqueo suave.</p>
        </div>
        <div className={`rounded-2xl px-4 py-3 text-sm font-semibold ${summary?.softLocked ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {summary?.softLocked ? 'Workspace en bloqueo suave' : 'Workspace habilitado'}
        </div>
      </div>
      {message ? <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      <div className="mt-4 grid gap-3 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Estado actual</p>
          <p className="mt-2 font-semibold text-slate-900">{summary?.planName ?? 'Sin plan'}</p>
          <p className="mt-1">Vigente hasta {summary?.expiresAtLabel ?? summary?.trialEndsAtLabel ?? 'pendiente'}.</p>
          <p className="mt-1">Renovación {summary?.autoRenew ? 'automática' : 'manual'}.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Código corporativo</p>
          <p className="mt-2 font-semibold text-slate-900">{summary?.activationCode ?? 'Self-serve'}</p>
          <p className="mt-1">Si la cuenta nació desde código, la suscripción queda vinculada como referencia comercial del workspace.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Próximo cambio</p>
          <p className="mt-2 font-semibold text-slate-900">{summary?.scheduledPlanName ?? 'Sin cambio programado'}</p>
          <p className="mt-1">Los downgrades quedan programados para la siguiente renovación para no romper la operación actual.</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center">
        <select value={selectedPlan} onChange={(event) => setSelectedPlan(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700">
          {PLAN_OPTIONS.map((plan) => <option key={plan.value} value={plan.value}>{plan.label}</option>)}
        </select>
        <Button loading={isPending} onClick={() => send({ action: 'change_plan', planCode: selectedPlan })}>Aplicar cambio de plan</Button>
        <Button variant="secondary" loading={isPending} onClick={() => send({ action: 'toggle_auto_renew' })}>{summary?.autoRenew ? 'Desactivar renovación' : 'Activar renovación'}</Button>
      </div>
    </Card>
  );
}
