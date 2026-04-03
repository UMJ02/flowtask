export const dynamic = 'force-dynamic';

import { PageIntro } from '@/components/ui/page-intro';
import { Card } from '@/components/ui/card';
import { TaskForm } from '@/components/tasks/task-form';

export default async function TaskNewPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const search = (await searchParams) ?? {};
  const queryString = new URLSearchParams(
    Object.entries(search).flatMap(([key, value]) => typeof value === 'string' && value ? [[key, value]] : [])
  ).toString();

  const projectId = typeof search.projectId === 'string' ? search.projectId : '';
  const clientName = typeof search.clientName === 'string' ? search.clientName : '';

  return (
    <div className="space-y-4">
      <PageIntro
        eyebrow="Nueva tarea"
        title="Crear tarea"
        description="Completa los datos básicos para dejar la tarea lista en el workspace. La experiencia V56 mejora la lectura del formulario, los mensajes de error y el feedback de guardado."
        aside={
          <Card className="rounded-[24px] border border-sky-200 bg-sky-50/75 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">Buena práctica</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-sky-900">
              <li>• Vincula proyecto cuando la tarea forme parte de un frente activo</li>
              <li>• Usa prioridad alta solo para trabajo urgente real</li>
              <li>• Completa cliente y deadline para mejor seguimiento</li>
            </ul>
          </Card>
        }
      />
      <TaskForm
        initialData={{ projectId, clientName }}
        redirectTo={queryString ? `/app/tasks?${queryString}` as any : '/app/tasks'}
      />
    </div>
  );
}
