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

export function RecentActivity({ summary }: RecentActivityProps) {
  const safeSummary = summary ?? EMPTY_SUMMARY;
  const counts = safeSummary.counts ?? EMPTY_SUMMARY.counts;
  const items = Array.isArray(safeSummary.items) ? safeSummary.items : [];

  const tiles = [
    { label: 'Movimientos', value: counts.total, tone: 'border-slate-200 bg-slate-50 text-slate-700' },
    { label: 'Tareas', value: counts.tasks, tone: 'border-blue-100 bg-blue-50 text-blue-700' },
    { label: 'Proyectos', value: counts.projects, tone: 'border-violet-100 bg-violet-50 text-violet-700' },
    { label: 'Avisos', value: counts.comments + counts.reminders, tone: 'border-emerald-100 bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div className="space-y-3">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-slate-100 text-slate-700">
              <Activity className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900">Pulso de actividad</h2>
              <p className="mt-1 max-w-xl text-sm text-slate-500">Un resumen vivo de lo que se está moviendo en tu workspace.</p>
            </div>
          </div>
          <Link href="/app/notifications" className="inline-flex items-center gap-2 self-start text-sm font-semibold text-slate-700 hover:text-slate-900">
            Ver notificaciones
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map((tile) => (
            <div key={tile.label} className={`min-h-[96px] rounded-[10px] border px-4 py-3 ${tile.tone}`}>
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em]">{tile.label}</p>
              <p className="mt-3 text-[2rem] font-bold leading-none text-slate-950">{tile.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <ActivityTimeline
        items={items}
        compact
        title="Actividad reciente"
        description="Cambios, seguimiento y recordatorios para retomar rápido."
      />
    </div>
  );
}
