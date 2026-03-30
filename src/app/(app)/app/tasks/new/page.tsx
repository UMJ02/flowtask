import { TaskForm } from '@/components/tasks/task-form';
import { Card } from '@/components/ui/card';
import { taskListRoute } from '@/lib/navigation/routes';

export default function NewTaskPage() {
  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Nueva tarea</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Crear tarea</h1>
        <p className="mt-2 text-sm text-slate-500">Crea una tarea y vuelve al workspace para seguir moviendo el flujo.</p>
      </Card>
      <TaskForm redirectTo={taskListRoute()} />
    </div>
  );
}
