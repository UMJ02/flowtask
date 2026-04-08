'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { ArrowLeft, ExternalLink, FileSpreadsheet, Home, Printer, Share2 } from 'lucide-react';
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
            <p className="mt-3 text-sm text-slate-300">El enlace puede estar incompleto o ya no contiene un reporte válido.</p>
            <div className="mt-6">
              <Link href="/">
                <Button variant="secondary"><ArrowLeft className="h-4 w-4" />Volver a la página principal</Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#082f49_0%,#0f3f5e_34%,#f8fafc_34%,#f8fafc_100%)] py-8 print:bg-white print:py-0">
      <div className="container-page max-w-6xl space-y-4 print:max-w-none print:px-0">
        <Card className="rounded-[30px] border-white/10 bg-[linear-gradient(135deg,#082f49_0%,#0f3f5e_42%,#0f172a_100%)] text-white print:shadow-none">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/80">FlowTask · reporte compartido</p>
              <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-[2.5rem]">Una vista ejecutiva clara, bonita y lista para compartir</h1>
              <p className="mt-3 text-sm leading-7 text-slate-100/90 sm:text-base">
                {payload.workspaceName} · actualizado {payload.generatedAtLabel}. Aquí se resume lo importante para revisar prioridades, fechas y avance general sin entrar a la plataforma.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <Link href="/"><Button variant="secondary" className="rounded-full"><Home className="h-4 w-4" />Página principal</Button></Link>
              <Button variant="secondary" className="rounded-full" onClick={() => window.print()}><Printer className="h-4 w-4" />PDF</Button>
              <Button variant="secondary" className="rounded-full" onClick={() => downloadAnalyticsCsv(payload)}><FileSpreadsheet className="h-4 w-4" />Excel / CSV</Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Pulso" value={`${payload.kpis.healthScore}%`} helper="Panorama general" tone="cyan" />
          <MetricCard label="Ritmo" value={`${payload.kpis.intelligenceScore}%`} helper="Seguimiento activo" tone="sky" />
          <MetricCard label="Favoritos" value={String(payload.shareDigest.priorityCount)} helper="Lo más importante" tone="amber" />
          <MetricCard label="Concluidos" value={String(payload.shareDigest.completedCount)} helper="Trabajo entregado" tone="emerald" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <Card className="rounded-[28px]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-950">Foco semanal</h2>
                <p className="mt-1 text-sm text-slate-500">Lo que conviene revisar primero esta semana.</p>
              </div>
              <span className="kicker-chip">Prioridades</span>
            </div>
            <div className="mt-5 space-y-3">
              {payload.weeklyFocus.length ? payload.weeklyFocus.map((item) => (
                <FeedItem key={`${item.source}-${item.id}`} item={item} />
              )) : <EmptyBlock label="No hay tareas prioritarias para este reporte." />}
            </div>
          </Card>

          <Card className="rounded-[28px]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-950">Resumen para compartir</h2>
                <p className="mt-1 text-sm text-slate-500">Una lectura breve para acompañar este enlace o el correo.</p>
              </div>
              <Share2 className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <DigestCard label="Favoritos" value={payload.shareDigest.priorityCount} />
              <DigestCard label="En proceso" value={payload.shareDigest.inProgressCount} />
              <DigestCard label="En espera" value={payload.shareDigest.waitingCount} />
              <DigestCard label="Concluidos" value={payload.shareDigest.completedCount} />
            </div>
            <div className="mt-5 space-y-3">
              {payload.shareDigest.shareSummary.map((item) => (
                <div key={item} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">{item}</div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Card className="rounded-[28px]">
            <h2 className="text-xl font-bold tracking-tight text-slate-950">Pipeline de proyectos</h2>
            <p className="mt-1 text-sm text-slate-500">Proyectos activos y fechas visibles para seguimiento ejecutivo.</p>
            <div className="mt-5 space-y-3">
              {payload.projectPipeline.length ? payload.projectPipeline.map((item) => (
                <FeedItem key={`${item.source}-${item.id}`} item={item} />
              )) : <EmptyBlock label="No hay proyectos activos para este reporte." />}
            </div>
          </Card>

          <Card className="rounded-[28px]">
            <h2 className="text-xl font-bold tracking-tight text-slate-950">Deadlines y próximos pasos</h2>
            <p className="mt-1 text-sm text-slate-500">Fechas relevantes y señales para anticipar carga.</p>
            <div className="mt-5 space-y-3">
              {payload.shareDigest.deadlineItems.length ? payload.shareDigest.deadlineItems.map((item) => (
                <FeedItem key={`${item.source}-${item.id}-deadline`} item={item} />
              )) : <EmptyBlock label="No hay deadlines destacados para este reporte." />}
            </div>
            <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 print:hidden">
              <p className="text-sm font-semibold text-slate-900">¿Necesitas volver a FlowTask?</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">Esta vista es pública y resumida. Para operar el detalle o editar información, vuelve a la plataforma principal.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/"><Button variant="secondary" className="rounded-full"><ArrowLeft className="h-4 w-4" />Ir a la página principal</Button></Link>
                <Link href="/" className="print:hidden"><Button variant="ghost" className="rounded-full"><ExternalLink className="h-4 w-4" />Abrir inicio</Button></Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

function MetricCard({ label, value, helper, tone }: { label: string; value: string; helper: string; tone: 'cyan' | 'sky' | 'amber' | 'emerald' }) {
  const toneMap = {
    cyan: 'border-cyan-100 bg-cyan-50 text-cyan-950',
    sky: 'border-sky-100 bg-sky-50 text-sky-950',
    amber: 'border-amber-100 bg-amber-50 text-amber-950',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-950',
  } as const;

  return (
    <Card className={`rounded-[24px] border ${toneMap[tone]} print:shadow-none`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-current/55">{label}</p>
      <p className="mt-2 text-3xl font-bold text-current">{value}</p>
      <p className="mt-1 text-sm text-current/65">{helper}</p>
    </Card>
  );
}

function DigestCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function FeedItem({ item }: { item: { title: string; meta: string; statusLabel: string; tone: 'critical' | 'attention' | 'stable'; source: string } }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{item.source}</span>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[item.tone]}`}>{item.statusLabel}</span>
      </div>
      <p className="mt-3 text-[1.02rem] font-semibold leading-snug text-slate-900">{item.title}</p>
      <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
    </div>
  );
}

function EmptyBlock({ label }: { label: string }) {
  return <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">{label}</div>;
}
