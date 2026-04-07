import Link from "next/link";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ClientDetailSummary } from "@/types/client";

export function ClientDetailPanels({ client }: { client: ClientDetailSummary }) {
  const createProjectHref = `/app/projects/new?clientName=${encodeURIComponent(client.name)}`;
  const createTaskHref = `/app/tasks/new?clientName=${encodeURIComponent(client.name)}`;

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Cliente</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
            <p className="mt-2 text-sm text-slate-600">{client.notes || 'Este cliente ya cuenta con tablero de seguimiento por organización.'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p><strong>Estado:</strong> {client.status.replace('_', ' ')}</p>
            <p><strong>Creado:</strong> {client.createdAtLabel}</p>
            <p><strong>Correo cliente:</strong> {client.contactEmail || 'Sin correo cargado'}</p>
            <p><strong>Owner:</strong> {client.accountOwnerEmail || 'Sin asignar'}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={createProjectHref} className="inline-flex">
            <Button type="button">
              <Plus className="h-4 w-4" />
              Nuevo proyecto
            </Button>
          </Link>
          <Link href={createTaskHref} className="inline-flex">
            <Button type="button" variant="secondary">
              <Plus className="h-4 w-4" />
              Nueva tarea
            </Button>
          </Link>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Proyectos activos</p><p className="mt-3 text-3xl font-bold text-slate-900">{client.projectsCount}</p></Card>
        <Card><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tareas abiertas</p><p className="mt-3 text-3xl font-bold text-slate-900">{client.openTasksCount}</p></Card>
        <Card><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tareas cerradas</p><p className="mt-3 text-3xl font-bold text-slate-900">{client.completedTasksCount}</p></Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Proyectos del cliente</p>
          <div className="mt-4 space-y-3">
            {client.recentProjects.length ? client.recentProjects.map((project) => (
              <Link key={project.id} href={`/app/projects/${project.id}`} className="block rounded-2xl border border-slate-100 p-3 hover:bg-slate-50">
                <p className="font-semibold text-slate-900">{project.title}</p>
                <p className="text-sm text-slate-500">{project.status} · {project.dueDateLabel}</p>
              </Link>
            )) : <p className="text-sm text-slate-500">Sin proyectos recientes.</p>}
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tareas abiertas por cliente</p>
          <div className="mt-4 space-y-3">
            {client.recentTasks.length ? client.recentTasks.map((task) => (
              <Link key={task.id} href={`/app/tasks/${task.id}`} className="block rounded-2xl border border-slate-100 p-3 hover:bg-slate-50">
                <p className="font-semibold text-slate-900">{task.title}</p>
                <p className="text-sm text-slate-500">{task.status} · {task.dueDateLabel}</p>
              </Link>
            )) : <p className="text-sm text-slate-500">Sin tareas recientes.</p>}
          </div>
        </Card>
      </div>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Actividad del cliente</p>
        <div className="mt-4 space-y-3">
          {client.activity.length ? client.activity.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-100 p-3">
              <p className="font-medium text-slate-900">{item.action}</p>
              <p className="text-sm text-slate-500">{item.createdAtLabel}</p>
            </div>
          )) : <p className="text-sm text-slate-500">Aún no hay bitácora para este cliente.</p>}
        </div>
      </Card>
    </div>
  );
}
