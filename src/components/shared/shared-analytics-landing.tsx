'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { ArrowLeft, FileSpreadsheet, Home, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { decodeAnalyticsShareToken, downloadAnalyticsCsv } from '@/lib/share/analytics-share';

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
      <main className="min-h-screen bg-white py-10 text-slate-900">
        <div className="mx-auto w-full max-w-[1080px] px-4">
          <Card>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">FlowTask</p>
            <h1 className="mt-3 text-[1.85rem] font-bold">No se pudo abrir este reporte</h1>
            <p className="mt-3 text-sm text-slate-500">El enlace compartido es inválido o quedó incompleto.</p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white py-8 text-slate-900 print:bg-white print:py-0">
      <div className="mx-auto w-full max-w-[1040px] space-y-4 px-4 print:max-w-none print:px-0">
        <Card className="rounded-[24px] border border-slate-200 bg-white print:shadow-none">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">FlowTask · reporte compartido</p>
              <h1 className="mt-2 text-[1.85rem] font-bold leading-tight">Reporte general de trabajo</h1>
              <div className="mt-3 space-y-1.5 text-sm leading-6 text-slate-600">
                <p>Usuario: <span className="font-semibold text-slate-900">{payload.workspaceName}</span></p>
                <p>Reporte general de trabajo: Esta vista resume prioridades, proyectos y deadlines con un formato simple para compartir.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <Link href="/"><Button variant="secondary"><Home className="h-4 w-4" />Página principal</Button></Link>
              <Button variant="secondary" onClick={() => window.print()}><Printer className="h-4 w-4" />PDF</Button>
              <Button variant="secondary" onClick={() => downloadAnalyticsCsv(payload)}><FileSpreadsheet className="h-4 w-4" />Excel / CSV</Button>
            </div>
          </div>
        </Card>

        <ReportModule
          title="Tareas del día"
          accentClassName="bg-sky-50 text-sky-800 border-sky-100"
          description="Tareas del día visibles para resolver rápido."
          items={payload.reportModules.dayTasks}
          emptyLabel="No hay tareas del día visibles en este reporte."
        />

        <ReportModule
          title="Tareas en proceso semanal"
          accentClassName="bg-emerald-50 text-emerald-800 border-emerald-100"
          description="Máximo 10 tareas en proceso con fechas cercanas de la semana actual."
          items={payload.reportModules.weeklyInProgress}
          emptyLabel="No hay tareas en proceso para esta semana."
        />

        <ReportModule
          title="Tareas en espera"
          accentClassName="bg-amber-50 text-amber-800 border-amber-100"
          description="Tareas en espera con su último comentario para entender el bloqueo actual."
          items={payload.reportModules.waitingTasks}
          emptyLabel="No hay tareas en espera para mostrar."
          showLastComment
        />

        <footer className="border-t border-slate-200 pt-4 text-xs text-slate-500 print:border-none print:pt-2">
          Generado por FlowTask · {payload.generatedAtLabel}
        </footer>

        <div className="print:hidden">
          <Link href="/">
            <Button variant="secondary"><ArrowLeft className="h-4 w-4" />Ir a FlowTask</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

function ReportModule({
  title,
  description,
  items,
  emptyLabel,
  accentClassName,
  showLastComment = false,
}: {
  title: string;
  description: string;
  items: Array<{
    id: string;
    title: string;
    createdAtLabel: string;
    deadlineLabel: string;
    statusLabel: string;
    clientLabel: string;
    priorityLabel: string;
    lastComment: string | null;
  }>;
  emptyLabel: string;
  accentClassName: string;
  showLastComment?: boolean;
}) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white print:shadow-none">
      <div className={`rounded-t-[24px] border-b px-4 py-3.5 ${accentClassName}`}>
        <h2 className="text-base font-bold">{title}</h2>
        <p className="mt-1 text-sm opacity-90">{description}</p>
      </div>

      <div className="divide-y divide-slate-200">
        {items.length ? items.map((item) => (
          <article key={item.id} className="px-4 py-3.5">
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                  <span><span className="font-medium text-slate-700">Ingreso:</span> {item.createdAtLabel}</span>
                  <span><span className="font-medium text-slate-700">Deadline:</span> {item.deadlineLabel}</span>
                  <span><span className="font-medium text-slate-700">Status:</span> {item.statusLabel}</span>
                  <span><span className="font-medium text-slate-700">Cliente:</span> {item.clientLabel}</span>
                  <span><span className="font-medium text-slate-700">Prioridad:</span> {item.priorityLabel}</span>
                </div>
                {showLastComment ? (
                  <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Último comentario:</span> {item.lastComment || 'Sin comentario registrado.'}
                  </p>
                ) : null}
              </div>
            </div>
          </article>
        )) : <div className="px-4 py-4 text-sm text-slate-500">{emptyLabel}</div>}
      </div>
    </section>
  );
}
