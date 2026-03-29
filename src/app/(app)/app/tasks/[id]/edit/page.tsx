import { notFound } from "next/navigation";
import { TaskForm } from "@/components/tasks/task-form";
import { getTaskById } from "@/lib/queries/tasks";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) notFound();

  const department = Array.isArray(task.departments) ? task.departments[0] : task.departments;

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] bg-white p-5 shadow-soft">
        <h1 className="text-2xl font-bold text-slate-900">Editar tarea</h1>
        <p className="text-sm text-slate-500">Actualiza información principal, estado y deadline.</p>
      </div>
      <TaskForm
        taskId={task.id}
        redirectTo={`/app/tasks/${task.id}`}
        initialData={{
          title: task.title,
          description: task.description ?? "",
          status: task.status,
          department: department?.code ?? "",
          clientName: task.client_name ?? "",
          dueDate: task.due_date ? String(task.due_date).slice(0, 10) : "",
        }}
      />
    </div>
  );
}
