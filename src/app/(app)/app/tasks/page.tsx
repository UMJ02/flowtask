import { UnifiedSearchBar } from '@/components/ui/unified-search-bar';
import { TaskEditableTable } from '@/components/tasks/task-editable-table';
import { getTasks } from '@/lib/queries/tasks';

export default async function TasksPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const resolved = searchParams ? await searchParams : {};
  const filters = {
    q: typeof resolved.q === 'string' ? resolved.q : '',
    status: typeof resolved.status === 'string' ? resolved.status : '',
    due: typeof resolved.due === 'string' ? resolved.due : '',
  };
  const tasks = await getTasks(filters);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">Tareas</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Control editable de tareas</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          Se eliminó la zona de trabajo y el flujo para concentrar la vista en una card vertical editable por columnas.
        </p>
      </section>

      <UnifiedSearchBar
        placeholder="Buscar tarea, cliente o deadline..."
        filters={[
          { key: 'status', label: 'Estado', options: [
            { value: 'en_proceso', label: 'En proceso' },
            { value: 'en_espera', label: 'En espera' },
            { value: 'concluido', label: 'Concluido' },
          ] },
          { key: 'due', label: 'Deadline', options: [
            { value: 'today', label: 'Hoy' },
            { value: 'soon', label: 'Próximas' },
            { value: 'overdue', label: 'Vencidas' },
            { value: 'none', label: 'Sin fecha' },
          ] },
        ]}
        values={filters}
      />

      <TaskEditableTable
        initialTasks={tasks.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          due_date: task.due_date ?? null,
          priority: (task as any).priority ?? 'media',
          client_name: task.client_name ?? null,
        }))}
      />
    </div>
  );
}
