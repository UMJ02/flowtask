import Link from 'next/link';
import { ProjectEditableList } from '@/components/projects/project-editable-list';
import { SearchUnified } from '@/components/ui/search-unified';
import { Card } from '@/components/ui/card';
import { projectNewRoute } from '@/lib/navigation/routes';
import { getProjects } from '@/lib/queries/projects';
import { getDepartmentOptions } from '@/lib/queries/catalog';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function ProjectsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const filters = {
    q: typeof params.q === 'string' ? params.q : '',
    status: typeof params.status === 'string' ? params.status : '',
    department: typeof params.department === 'string' ? params.department : '',
    mode: typeof params.mode === 'string' ? params.mode : '',
    client: typeof params.client === 'string' ? params.client : '',
  };

  const [projects, departments] = await Promise.all([
    safeServerCall('getProjects', () => getProjects(filters), []),
    safeServerCall('getDepartmentOptions', () => getDepartmentOptions(), []),
  ]);

  return (
    <div className="space-y-5 lg:space-y-6">
      <Card className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Proyectos</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Listado editable del workspace</h1>
          <p className="mt-2 text-sm text-slate-500">Consulta, filtra y actualiza el estado de cada proyecto desde una vista compacta y editable.</p>
        </div>
        <Link href={projectNewRoute()} className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white">Nuevo proyecto</Link>
      </Card>

      <SearchUnified
        placeholder="Escribe un proyecto, cliente o palabra clave"
        initialValues={filters}
        advancedFields={[
          {
            name: 'status',
            label: 'Estado',
            options: [
              { value: 'activo', label: 'Activo' },
              { value: 'en_pausa', label: 'En pausa' },
              { value: 'completado', label: 'Completado' },
              { value: 'vencido', label: 'Vencido' },
            ],
          },
          {
            name: 'department',
            label: 'Área',
            options: departments.map((department) => ({ value: department.code, label: department.name })),
          },
          {
            name: 'client',
            label: 'Cliente',
            type: 'text',
            placeholder: 'Filtrar por cliente',
          },
          {
            name: 'mode',
            label: 'Modo',
            options: [
              { value: 'solo', label: 'Solo owner' },
              { value: 'collaborative', label: 'Colaborativo' },
            ],
          },
        ]}
      />

      <ProjectEditableList
        departments={departments}
        projects={projects.map((project) => ({
          id: project.id,
          title: project.title,
          status: project.status,
          due_date: project.due_date ?? null,
          client_name: project.client_name ?? null,
          departmentCode: project.departmentCode ?? null,
        }))}
      />
    </div>
  );
}
