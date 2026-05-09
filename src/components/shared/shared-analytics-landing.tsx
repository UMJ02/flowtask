'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { CheckCircle2, ClipboardCheck, Clock3, Download, Home, Printer, Share2, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { decodeAnalyticsShareToken, downloadAnalyticsCsv, getSharedReportTasks } from '@/lib/share/analytics-share';

type StatusFilter = 'all' | 'En proceso' | 'En espera' | 'Concluido';
const PAGE_SIZE = 15;

export function SharedAnalyticsLanding({ token, autoPrint = false }: { token: string; autoPrint?: boolean }) {
  const payload = useMemo(() => decodeAnalyticsShareToken(token), [token]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (autoPrint && payload) {
      const timer = window.setTimeout(() => window.print(), 500);
      return () => window.clearTimeout(timer);
    }
  }, [autoPrint, payload]);

  useEffect(() => setPage(1), [statusFilter]);

  if (!payload) {
    return (
      <main className="min-h-screen bg-[#F7F9FC] px-4 py-8 text-[#071333]">
        <section className="mx-auto max-w-[760px] rounded-[24px] border border-[#E5EAF1] bg-white p-8 shadow-[0_28px_80px_rgba(7,19,51,0.08)]">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#16A878]">FlowTask</p>
          <h1 className="mt-3 text-[2rem] font-extrabold tracking-[-0.04em]">No se pudo abrir este reporte</h1>
          <p className="mt-3 text-sm leading-6 text-[#64748B]">El enlace compartido es inválido, quedó incompleto o ya no contiene la información necesaria.</p>
          <Link href="/" className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-[#16C784] px-5 text-sm font-extrabold text-white">Ir a FlowTask</Link>
        </section>
      </main>
    );
  }

  const tasks = getSharedReportTasks(payload);
  const filteredTasks = statusFilter === 'all' ? tasks : tasks.filter((task) => task.statusLabel === statusFilter);
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleTasks = filteredTasks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const shareUrl = typeof window === 'undefined' ? '' : window.location.href;
  const shareTitle = `Reporte FlowTask · ${payload.workspaceName}`;
  const nativeShare = typeof navigator !== 'undefined' ? (navigator as Navigator & { share?: (data: ShareData) => Promise<void> }).share : undefined;
  const canShare = Boolean(nativeShare);

  const cards = [
    { label: 'Total de tareas', value: tasks.length, helper: 'Incluidas en reporte', icon: ClipboardCheck, tone: 'emerald' },
    { label: 'Prioridad alta', value: payload.shareDigest.priorityCount, helper: 'Seguimiento ejecutivo', icon: SlidersHorizontal, tone: 'amber' },
    { label: 'En proceso', value: payload.shareDigest.inProgressCount, helper: 'Operación activa', icon: Clock3, tone: 'blue' },
    { label: 'En espera', value: payload.shareDigest.waitingCount, helper: 'Bloqueos actuales', icon: Clock3, tone: 'orange' },
    { label: 'Concluidos', value: payload.shareDigest.completedCount, helper: 'Histórico cerrado', icon: CheckCircle2, tone: 'green' },
  ];

  async function handleShare() {
    if (!shareUrl) return;
    if (canShare) {
      await nativeShare?.({ title: shareTitle, text: 'Te comparto la carga de trabajo actual.', url: shareUrl });
      return;
    }
    await navigator.clipboard?.writeText(shareUrl);
  }

  return (
    <main className="min-h-screen bg-[#F7F9FC] text-[#071333] print:bg-white">
      <div className="mx-auto w-full max-w-[1180px] px-4 py-5 print:block print:max-w-none print:px-0 print:py-0">
        <section className="overflow-hidden rounded-[24px] border border-[#E5EAF1] bg-white shadow-[0_28px_80px_rgba(7,19,51,0.06)] print:border-none print:shadow-none">
          <header className="flex items-center justify-between gap-4 px-7 py-5 print:px-4">
            <div className="flex items-center gap-3">
              <img src="/icons/icon.png" alt="FlowTask" className="h-8 w-8 rounded-xl" />
              <span className="text-[1.35rem] font-extrabold tracking-[-0.04em]">FlowTask</span>
            </div>
            <span className="rounded-full bg-[#E6F8F1] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[#009B6A] print:hidden">Reporte público</span>
          </header>

          <section className="relative px-7 pb-8 pt-5 text-center print:px-4">
            <div className="pointer-events-none absolute inset-x-0 top-2 h-40 bg-[radial-gradient(circle_at_50%_0%,rgba(22,199,132,0.12),transparent_60%)]" />
            <div className="relative mx-auto max-w-[760px]">
              <span className="inline-flex rounded-xl bg-[#E6F8F1] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#009B6A]">Carga de trabajo</span>
              <p className="mt-5 text-[1.35rem] leading-tight text-[#071333]">Hola, esta es la carga de trabajo de:</p>
              <h1 className="mt-1 text-[2.35rem] font-extrabold leading-none tracking-[-0.05em] text-[#071333]">{payload.workspaceName}</h1>
              <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#16C784]" />
              <p className="mt-5 text-sm font-medium text-[#64748B]">Última actualización: {payload.generatedAtLabel}</p>
            </div>
          </section>

          <section className="grid gap-4 px-7 pb-7 sm:grid-cols-2 xl:grid-cols-5 print:px-4">
            {cards.map((card) => <MetricCard key={card.label} {...card} />)}
          </section>

          <section className="mx-7 mb-7 overflow-hidden rounded-[22px] border border-[#E5EAF1] bg-white print:mx-4">
            <div className="flex flex-col gap-4 border-b border-[#E5EAF1] px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-[1.25rem] font-extrabold tracking-[-0.03em]">Todas las tareas</h2>
                <p className="mt-1 text-sm text-[#64748B]">Reporte público de solo lectura con estado, prioridad, deadline y último comentario.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 print:hidden">
                {(['all', 'En proceso', 'En espera', 'Concluido'] as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={statusFilter === status ? 'rounded-2xl bg-[#071333] px-4 py-2 text-xs font-extrabold text-white' : 'rounded-2xl border border-[#E5EAF1] bg-white px-4 py-2 text-xs font-extrabold text-[#52617A] transition hover:border-[#16C784]/40'}
                  >
                    {status === 'all' ? 'Todas' : status}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] border-collapse text-left text-sm">
                <thead className="bg-[#F7F9FC] text-xs font-extrabold uppercase tracking-[0.08em] text-[#52617A]">
                  <tr>
                    <th className="px-4 py-3">Módulo</th>
                    <th className="px-4 py-3">Tarea</th>
                    <th className="px-4 py-3">Fecha ingreso</th>
                    <th className="px-4 py-3">Deadline</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Prioridad</th>
                    <th className="px-4 py-3">Último comentario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EAF1]">
                  {visibleTasks.length ? visibleTasks.map((task) => (
                    <tr key={task.id} className="transition hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3 text-xs font-bold text-[#52617A]">{moduleLabel(payload, task.id)}</td>
                      <td className="px-4 py-3 font-bold text-[#071333]">{task.title}</td>
                      <td className="px-4 py-3 text-[#52617A]">{task.createdAtLabel}</td>
                      <td className="px-4 py-3 text-[#52617A]">{task.deadlineLabel}</td>
                      <td className="px-4 py-3"><StatusBadge status={task.statusLabel} /></td>
                      <td className="px-4 py-3"><PriorityDot priority={task.priorityLabel} /></td>
                      <td className="max-w-[260px] px-4 py-3 text-[#52617A]">{task.lastComment || '—'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-sm font-semibold text-[#64748B]">No hay tareas para este filtro.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#E5EAF1] px-5 py-4 text-sm text-[#52617A] md:flex-row md:items-center md:justify-between print:hidden">
              <span>Mostrando {visibleTasks.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0} a {Math.min(currentPage * PAGE_SIZE, filteredTasks.length)} de {filteredTasks.length} tareas</span>
              <div className="flex items-center gap-2">
                <button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="h-10 rounded-xl border border-[#E5EAF1] px-3 font-extrabold disabled:opacity-40">‹</button>
                <span className="rounded-xl bg-[#16C784] px-4 py-2 font-extrabold text-white">{currentPage}</span>
                <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="h-10 rounded-xl border border-[#E5EAF1] px-3 font-extrabold disabled:opacity-40">›</button>
              </div>
            </div>
          </section>

          <section className="mx-7 mb-7 rounded-[22px] border border-dashed border-[#B8C6DB] bg-[#F8FAFC] px-5 py-5 text-center text-sm font-semibold text-[#52617A] print:mx-4">
            Este es un enlace público de solo lectura. Los datos se actualizan cuando se genera un nuevo enlace desde FlowTask.
          </section>

          <section className="mx-7 mb-9 flex flex-col gap-3 rounded-[24px] border border-[#E5EAF1] bg-white p-4 sm:flex-row sm:items-center sm:justify-center print:hidden">
            <Button onClick={handleShare} variant="secondary"><Share2 className="h-4 w-4" /> Compartir</Button>
            <Button onClick={() => window.print()} variant="secondary"><Printer className="h-4 w-4" /> Descargar PDF</Button>
            <Button onClick={() => downloadAnalyticsCsv(payload)}><Download className="h-4 w-4" /> Exportar reporte</Button>
            <Link href="/"><Button variant="secondary" className="w-full sm:w-auto"><Home className="h-4 w-4" /> Ir a FlowTask</Button></Link>
          </section>

          <footer className="bg-[#16A878] px-7 py-4 text-center text-sm font-bold text-white print:hidden">© 2026 FlowTask. Todos los derechos reservados.</footer>
        </section>

      </div>
    </main>
  );
}

function moduleLabel(payload: NonNullable<ReturnType<typeof decodeAnalyticsShareToken>>, id: string) {
  if (payload.reportModules.dayTasks.some((item) => item.id === id)) return 'Tareas del día';
  if (payload.reportModules.weeklyInProgress.some((item) => item.id === id)) return 'Tareas en proceso semanal';
  if (payload.reportModules.waitingTasks.some((item) => item.id === id)) return 'Tareas en espera';
  return 'Reporte';
}

function MetricCard({ label, value, helper, icon: Icon, tone }: { label: string; value: number; helper: string; icon: ComponentType<{ className?: string }>; tone: string }) {
  const toneClass = tone === 'amber' ? 'bg-amber-50 text-amber-600' : tone === 'blue' ? 'bg-blue-50 text-blue-600' : tone === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600';
  return (
    <article className="rounded-[18px] border border-[#E5EAF1] bg-white p-4">
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}><Icon className="h-5 w-5" /></div>
      <div className="mt-3 text-[1.65rem] font-extrabold tracking-[-0.04em]">{value}</div>
      <p className="text-sm font-extrabold text-[#071333]">{label}</p>
      <p className="mt-1 text-xs font-semibold text-[#64748B]">{helper}</p>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls = status === 'En espera' ? 'bg-amber-50 text-amber-700' : status === 'Concluido' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ${cls}`}>{status}</span>;
}

function PriorityDot({ priority }: { priority: string }) {
  const cls = priority === 'Alta' ? 'bg-red-500' : priority === 'Baja' ? 'bg-blue-400' : 'bg-amber-500';
  return <span className="inline-flex items-center gap-2 text-sm font-bold text-[#52617A]"><span className={`h-2.5 w-2.5 rounded-full ${cls}`} />{priority}</span>;
}
