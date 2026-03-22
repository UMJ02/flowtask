import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { RecentActivitySummary } from "@/lib/queries/activity";
import { ActivityTimeline } from "@/components/activity/activity-timeline";

export function RecentActivity({ summary }: { summary: RecentActivitySummary }) {
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Pulso de actividad</h2>
              <p className="mt-1 text-sm text-slate-500">Un resumen vivo de lo que se está moviendo en tu workspace.</p>
            </div>
          </div>
          <Link href="/app/notifications" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
            Ver centro de notificaciones
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Movimientos</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{summary.counts.total}</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Tareas</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{summary.counts.tasks}</p>
          </div>
          <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">Proyectos</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{summary.counts.projects}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Comentarios y recordatorios</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{summary.counts.comments + summary.counts.reminders}</p>
          </div>
        </div>
      </Card>

      <ActivityTimeline
        items={summary.items}
        compact
        title="Actividad reciente"
        description="Cambios, seguimiento y recordatorios que te ayudan a entender el ritmo del día."
      />
    </div>
  );
}
