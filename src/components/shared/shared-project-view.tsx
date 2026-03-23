import { Card } from "@/components/ui/card";
import { getSharedProject } from "@/lib/queries/shared";
import { formatDate } from "@/lib/utils/dates";

export async function SharedProjectView({ token }: { token: string }) {
  const data = await getSharedProject(token);

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-50 py-10">
        <div className="container-page max-w-5xl space-y-4">
          <Card>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">FlowTask</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Vista compartida de proyecto</h1>
            <p className="mt-2 text-sm text-slate-600">No se encontró un proyecto compartido con este enlace o ya fue desactivado.</p>
          </Card>
        </div>
      </main>
    );
  }

  const totalTasks = data.tasks.length;
  const completedTasks = data.tasks.filter((task) => task.status === "concluido").length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="container-page max-w-5xl space-y-4">
        <Card className="border border-slate-100 bg-gradient-to-br from-white to-slate-50">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">FlowTask</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Resumen ejecutivo del proyecto</h1>
          <p className="mt-2 text-sm text-slate-600">Vista simple para jefatura, con datos clave y seguimiento general.</p>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Estado</p><p className="mt-2 text-2xl font-bold text-slate-900">{data.project.status}</p></Card>
          <Card><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tareas abiertas</p><p className="mt-2 text-2xl font-bold text-slate-900">{pendingTasks}</p></Card>
          <Card><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tareas cerradas</p><p className="mt-2 text-2xl font-bold text-slate-900">{completedTasks}</p></Card>
        </div>

        <Card>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Proyecto</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">{data.project.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{data.project.description || "Sin descripción."}</p>
            </div>
            <div className="grid gap-2 text-sm text-slate-700">
              <p><span className="font-medium">Cliente:</span> {data.project.client_name || "No indicado"}</p>
              <p><span className="font-medium">Departamento:</span> {data.project.department_name || "No indicado"}</p>
              <p><span className="font-medium">Creado:</span> {formatDate(data.project.created_at)}</p>
              <p><span className="font-medium">Deadline:</span> {data.project.due_date ? formatDate(data.project.due_date) : "Sin deadline"}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Tareas del proyecto</h3>
          <div className="mt-4 space-y-3">
            {data.tasks.length ? data.tasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <p className="font-medium text-slate-900">{task.title}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{task.status}</p>
                </div>
                <p className="mt-1">Cliente: {task.client_name || "No indicado"}</p>
                <p>Deadline: {task.due_date ? formatDate(task.due_date) : "Sin deadline"}</p>
              </div>
            )) : <p className="text-sm text-slate-500">Todavía no hay tareas visibles en este proyecto.</p>}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Seguimiento y comentarios</h3>
          <div className="mt-4 space-y-3">
            {data.comments.length ? data.comments.map((comment, index) => (
              <div key={`${comment.created_at}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <p>{comment.content}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(comment.created_at)}</p>
              </div>
            )) : <p className="text-sm text-slate-500">No hay comentarios compartidos todavía.</p>}
          </div>
        </Card>
      </div>
    </main>
  );
}
