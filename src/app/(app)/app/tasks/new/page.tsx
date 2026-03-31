export const dynamic = 'force-dynamic';

import { TaskForm } from '@/components/tasks/task-form';
import { Card } from '@/components/ui/card';

export default function NewTaskPage() {
  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Nueva tarea</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Crear tarea</h1>
        <p className="mt-2 text-sm text-slate-500">Crea la tarea, guarda y entra directo al detalle para seguir con comentarios, asignaciones y estado.</p>
      </Card>
      <TaskForm />
    </div>
  );
}
