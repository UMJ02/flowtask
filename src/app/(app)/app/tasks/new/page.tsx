import { TaskForm } from "@/components/tasks/task-form";

export default function NewTaskPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-[24px] bg-white p-5 shadow-soft">
        <h1 className="text-2xl font-bold text-slate-900">Nueva tarea</h1>
        <p className="text-sm text-slate-500">Crea una tarea con estado, cliente, departamento y deadline.</p>
      </div>
      <TaskForm />
    </div>
  );
}
