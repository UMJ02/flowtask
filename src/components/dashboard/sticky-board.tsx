import Link from "next/link";
import { formatDate } from "@/lib/utils/dates";
import { Card } from "@/components/ui/card";
import { projectDetailRoute, taskDetailRoute, taskNewRoute, type AppRoute, asRoute } from "@/lib/navigation/routes";

interface StickyBoardProps {
  recentTasks: Array<{
    id: string;
    title: string;
    status: string;
    due_date: string | null;
    client_name: string | null;
  }>;
  recentProjects: Array<{
    id: string;
    title: string;
    status: string;
    due_date: string | null;
    client_name: string | null;
  }>;
  reminders: Array<{
    id: string;
    remind_at: string;
    task_id: string | null;
    project_id: string | null;
  }>;
}

function Sticky({ title, body, href, meta }: { title: string; body: string; href: AppRoute; meta: string }) {
  return (
    <Link
      href={href}
      className="block rounded-[28px] border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-soft transition hover:-translate-y-0.5"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Nota rápida</p>
      <h3 className="mt-2 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-slate-600">{body}</p>
      <p className="mt-3 text-xs font-medium text-slate-500">{meta}</p>
    </Link>
  );
}

export function StickyBoard({ recentTasks, recentProjects, reminders }: StickyBoardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Pizarra personal</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Vista rápida del trabajo pendiente</h2>
        </div>
        <Link href={taskNewRoute()} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Nueva tarea
        </Link>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-800">Tareas recientes</p>
          {recentTasks.length ? (
            recentTasks.slice(0, 3).map((task) => (
              <Sticky
                key={task.id}
                href={taskDetailRoute(task.id)}
                title={task.title}
                body={`Estado: ${task.status}. Cliente: ${task.client_name || "Sin cliente"}. Deadline: ${formatDate(task.due_date)}.`}
                meta="Seguimiento de tarea"
              />
            ))
          ) : (
            <div className="rounded-[24px] bg-slate-50 p-4 text-sm text-slate-500">Aún no hay tareas para mostrar.</div>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-800">Proyectos activos</p>
          {recentProjects.length ? (
            recentProjects.slice(0, 3).map((project) => (
              <Sticky
                key={project.id}
                href={projectDetailRoute(project.id)}
                title={project.title}
                body={`Estado: ${project.status}. Cliente: ${project.client_name || "Sin cliente"}. Deadline: ${formatDate(project.due_date)}.`}
                meta="Resumen de proyecto"
              />
            ))
          ) : (
            <div className="rounded-[24px] bg-slate-50 p-4 text-sm text-slate-500">Todavía no hay proyectos activos.</div>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-800">Recordatorios</p>
          {reminders.length ? (
            reminders.slice(0, 3).map((reminder) => (
              <Sticky
                key={reminder.id}
                href={reminder.task_id ? taskDetailRoute(reminder.task_id) : reminder.project_id ? projectDetailRoute(reminder.project_id) : asRoute("/app/reminders")}
                title={`Recordatorio ${formatDate(reminder.remind_at)}`}
                body={`Programado para ${formatDate(reminder.remind_at)}. Úsalo para revisar seguimiento, bloqueos o entregas próximas.`}
                meta="Aviso programado"
              />
            ))
          ) : (
            <div className="rounded-[24px] bg-slate-50 p-4 text-sm text-slate-500">No tienes recordatorios próximos.</div>
          )}
        </div>
      </div>
    </Card>
  );
}
