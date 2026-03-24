import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { RecentActivitySummary } from "@/lib/queries/activity";
import { ActivityTimeline } from "@/components/activity/activity-timeline";

type RecentActivityProps = {
  summary?: RecentActivitySummary | null;
};

const EMPTY_SUMMARY = {
  counts: {
    total: 0,
    tasks: 0,
    projects: 0,
    comments: 0,
    reminders: 0,
  },
  items: [],
} as const;

const metricCards = [
  { key: 'total', label: 'Movimientos', tone: 'text-slate-700 border-slate-200 bg-slate-50' },
  { key: 'tasks', label: 'Tareas', tone: 'text-blue-700 border-blue-100 bg-blue-50' },
  { key: 'projects', label: 'Proyectos', tone: 'text-violet-700 border-violet-100 bg-violet-50' },
  { key: 'updates', label: 'Avisos', tone: 'text-emerald-700 border-emerald-100 bg-emerald-50' },
] as const;

export function RecentActivity({ summary }: RecentActivityProps) {
  const safeSummary = summary ?? EMPTY_SUMMARY;
  const counts = safeSummary.counts ?? EMPTY_SUMMARY.counts;
  const items = Array.isArray(safeSummary.items) ? safeSummary.items : [];
  const values = {
    total: counts.total,
    tasks: counts.tasks,
    projects: counts.projects,
    updates: counts.comments + counts.reminders,
  } as const;

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 bg-slate-50/70">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Activity className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-slate-900">Pulso de actividad</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Mira en un solo bloque lo que se movió hoy para retomar rápido sin abrir varias pantallas.
              </p>
            </div>
          </div>
          <Link
            href="/app/notifications"
            className="inline-flex items-center gap-2 self-start rounded-lg px-2 py-1 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-900"
          >
            Ver notificaciones
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => (
            <div key={card.key} className={`min-w-0 rounded-xl border px-4 py-4 ${card.tone}`}>
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em]">{card.label}</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="text-4xl font-semibold leading-none text-slate-950">{values[card.key]}</p>
                <p className="text-right text-xs leading-5 text-slate-500">
                  {card.key === 'total' && 'Todo lo que cambió'}
                  {card.key === 'tasks' && 'Pendientes en movimiento'}
                  {card.key === 'projects' && 'Frentes con actividad'}
                  {card.key === 'updates' && 'Comentarios y recordatorios'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <ActivityTimeline
        items={items}
        compact
        title="Actividad reciente"
        description="Cambios, seguimiento y recordatorios para volver al hilo rápido."
      />
    </div>
  );
}
