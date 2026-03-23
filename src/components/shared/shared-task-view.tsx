import { Card } from "@/components/ui/card";
import { getSharedTask } from "@/lib/queries/shared";
import { formatDate } from "@/lib/utils/dates";

export async function SharedTaskView({ token }: { token: string }) {
  const data = await getSharedTask(token);

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-50 py-10">
        <div className="container-page max-w-5xl space-y-4">
          <Card>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">FlowTask</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Vista compartida de tarea</h1>
            <p className="mt-2 text-sm text-slate-600">No se encontró una tarea compartida con este enlace o ya fue desactivada.</p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="container-page max-w-5xl space-y-4">
        <Card className="border border-slate-100 bg-gradient-to-br from-white to-slate-50">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">FlowTask</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Resumen ejecutivo de tarea</h1>
          <p className="mt-2 text-sm text-slate-600">Vista clara para revisión de estatus, seguimiento y fechas clave.</p>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Estado</p><p className="mt-2 text-2xl font-bold text-slate-900">{data.task.status}</p></Card>
          <Card><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Prioridad</p><p className="mt-2 text-2xl font-bold text-slate-900">{data.task.priority}</p></Card>
          <Card><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Deadline</p><p className="mt-2 text-2xl font-bold text-slate-900">{data.task.due_date ? formatDate(data.task.due_date) : "—"}</p></Card>
        </div>

        <Card>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tarea</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">{data.task.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{data.task.description || "Sin descripción."}</p>
            </div>
            <div className="grid gap-2 text-sm text-slate-700">
              <p><span className="font-medium">Proyecto:</span> {data.task.project_title || "Tarea independiente"}</p>
              <p><span className="font-medium">Cliente:</span> {data.task.client_name || "No indicado"}</p>
              <p><span className="font-medium">Departamento:</span> {data.task.department_name || "No indicado"}</p>
              <p><span className="font-medium">Creado:</span> {formatDate(data.task.created_at)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Seguimiento</h3>
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
