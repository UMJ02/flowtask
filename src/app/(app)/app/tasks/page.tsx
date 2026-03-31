import Link from 'next/link';
import { TaskEditableList } from '@/components/tasks/task-editable-list';
import { SearchUnified } from '@/components/ui/search-unified';
import { Card } from '@/components/ui/card';
import { taskNewRoute } from '@/lib/navigation/routes';
import { getTasks } from '@/lib/queries/tasks';
import { getDepartmentOptions } from '@/lib/queries/catalog';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function TasksPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const filters = {
    q: typeof params.q === 'string' ? params.q : '',
    status: typeof params.status === 'string' ? params.status : '',
    department: typeof params.department === 'string' ? params.department : '',
    due: typeof params.due === 'string' ? params.due : '',
  };

  const [tasks, departments] = await Promise.all([
    safeServerCall('getTasks', () => getTasks(filters), []),
    safeServerCall('getDepartmentOptions', () => getDepartmentOptions(), []),
  ]);

  return (
    <div className="space-y-5 lg:space-y-6">
      <Card className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tareas</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Listado editable del workspace</h1>
          <p className="mt-2 text-sm text-slate-500">Busca desde una sola barra y actualiza cada tarea en línea sin pasar por la vista de flujo.</p>
        </div>
        <Link href={taskNewRoute()} className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white">
          Nueva tarea
        </Link>
      </Card>

      <SearchUnified
        placeholder="Escribe una tarea, cliente o palabra clave"
        initialValues={filters}
        advancedFields={[
          {
            name: 'status',
            label: 'Estado',
            options: [
              { value: 'en_proceso', label: 'En progreso' },
              { value: 'en_espera', label: 'Pendiente' },
              { value: 'concluido', label: 'Hecho' },
            ],
          },
          {
            name: 'department',
            label: 'Área',
            options: departments.map((department) => ({ value: department.code, label: department.name })),
          },
          {
            name: 'due',
            label: 'Fecha',
            options: [
              { value: 'today', label: 'Hoy' },
              { value: 'soon', label: 'Próximas' },
              { value: 'overdue', label: 'Vencidas' },
              { value: 'none', label: 'Sin fecha' },
            ],
          },
        ]}
      />

      <TaskEditableList tasks={tasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        due_date: task.due_date ?? null,
        priority: task.priority ?? 'media',
        client_name: task.client_name ?? null,
      }))} />
    </div>
  );
}
