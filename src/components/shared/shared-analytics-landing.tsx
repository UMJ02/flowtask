'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { ArrowLeft, FileSpreadsheet, Home, Printer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { decodeAnalyticsShareToken, downloadAnalyticsCsv } from '@/lib/share/analytics-share';

const toneClasses = {
  critical: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  attention: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  stable: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
} as const;

export function SharedAnalyticsLanding({ token, autoPrint = false }: { token: string; autoPrint?: boolean }) {
  const payload = useMemo(() => decodeAnalyticsShareToken(token), [token]);

  useEffect(() => {
    if (autoPrint && payload) {
      const timer = window.setTimeout(() => window.print(), 500);
      return () => window.clearTimeout(timer);
    }
  }, [autoPrint, payload]);

  if (!payload) {
    return (
      <main className="min-h-screen bg-slate-950 py-10 text-white">
        <div className="container-page max-w-5xl">
          <Card className="border-white/10 bg-white/5 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">FlowTask</p>
            <h1 className="mt-3 text-3xl font-bold">No se pudo abrir este reporte</h1>
            <p className="mt-3 text-sm text-slate-300">El enlace compartido es inválido o quedó incompleto.</p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#052e2b_0%,#0b3954_36%,#f8fafc_36%,#f8fafc_100%)] py-8 print:bg-white print:py-0">
      <div className="container-page max-w-6xl space-y-4 print:max-w-none print:px-0">
        <Card className="border-white/10 bg-[linear-gradient(135deg,#052e2b_0%,#0b3954_42%,#0f172a_100%)] text-white print:shadow-none">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/80">FlowTask · reporte compartido</p>
              <h1 className="mt-2 text-3xl font-bold leading-tight">Un reporte ejecutivo claro, bonito y listo para compartir</h1>
              <p className="mt-3 text-sm leading-6 text-slate-100/90">{payload.workspaceName} · actualizado {payload.generatedAtLabel}. Esta vista resume prioridades, proyectos y fechas clave sin necesidad de entrar a la app.</p>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <Link href="/"><Button variant="secondary"><Home className="h-4 w-4" />Página principal</Button></Link>
              <Button variant="secondary" onClick={() => window.print()}><Printer className="h-4 w-4" />PDF</Button>
              <Button variant="secondary" onClick={() => downloadAnalyticsCsv(payload)}><FileSpreadsheet className="h-4 w-4" />Excel / CSV</Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Pulso general" value={`${payload.kpis.healthScore}%`} helper="Panorama del momento" />
          <MetricCard label="Ritmo del equipo" value={`${payload.kpis.intelligenceScore}%`} helper="Seguimiento activo" />
          <MetricCard label="Favoritos" value={String(payload.shareDigest.priorityCount)} helper="Lo más importante" />
          <MetricCard label="Concluidos" value={String(payload.shareDigest.completedCount)} helper="Trabajo entregado" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Foco semanal</h2>
                <p className="mt-1 text-sm text-slate-500">Lo que conviene revisar primero esta semana.</p>
              </div>
              <span className="kicker-chip">Prioridades</span>
            </div>
            <div className="mt-5 space-y-3">
              {payload.weeklyFocus.map((item) => (
                <FeedItem key={`${item.source}-${item.id}`} item={item} />
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Share center</h2>
                <p className="mt-1 text-sm text-slate-500">Un resumen corto para acompañar el enlace o el correo.</p>
              </div>
              <Share2 className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <DigestCard label="Favoritos" value={payload.shareDigest.priorityCount} helper="Seguimiento clave" />
              <DigestCard label="En proceso" value={payload.shareDigest.inProgressCount} helper="Trabajo activo" />
              <DigestCard label="En espera" value={payload.shareDigest.waitingCount} helper="Pide destrabe" />
              <DigestCard label="Concluidos" value={payload.shareDigest.completedCount} helper="Avance visible" />
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-700">Pensado para compartir prioridades, avance y fechas clave con una lectura rápida y presentable.</p>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Card>
            <h2 className="text-xl font-semibold text-slate-900">Pipeline de proyectos</h2>
            <p className="mt-1 text-sm text-slate-500">Proyectos activos y fechas visibles para seguimiento ejecutivo.</p>
            <div className="mt-5 space-y-3">
              {payload.projectPipeline.map((item) => (
                <FeedItem key={`${item.source}-${item.id}`} item={item} />
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-slate-900">Deadlines y próximos pasos</h2>
            <p className="mt-1 text-sm text-slate-500">Fechas relevantes y señales para anticipar carga.</p>
            <div className="mt-5 space-y-3">
              {payload.shareDigest.deadlineItems.length ? payload.shareDigest.deadlineItems.map((item) => (
                <FeedItem key={`${item.source}-${item.id}-deadline`} item={item} />
              )) : <p className="text-sm text-slate-500">No hay deadlines destacados para este reporte.</p>}
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 print:hidden">
              <p className="text-sm font-semibold text-slate-900">¿Necesitas volver a FlowTask?</p>
              <p className="mt-1 text-sm text-slate-500">Esta vista es pública y resumida. Para operar el detalle, vuelve a la plataforma principal.</p>
              <div className="mt-3">
                <Link href="/"><Button variant="secondary"><ArrowLeft className="h-4 w-4" />Ir a la página principal</Button></Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

function MetricCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <Card className="print:shadow-none">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </Card>
  );
}

function DigestCard({ label, value, helper }: { label: string; value: number; helper: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function FeedItem({ item }: { item: { title: string; meta: string; statusLabel: string; tone: 'critical' | 'attention' | 'stable'; source: string } }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{item.source}</span>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[item.tone]}`}>{item.statusLabel}</span>
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-900">{item.title}</p>
      <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
    </div>
  );
}
