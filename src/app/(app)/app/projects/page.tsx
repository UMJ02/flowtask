import { ProjectEditableTable } from '@/components/projects/project-editable-table';
import { UnifiedSearchBar } from '@/components/ui/unified-search-bar';
import { getProjects } from '@/lib/queries/projects';

export default async function ProjectsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const resolved = searchParams ? await searchParams : {};
  const filters = {
    q: typeof resolved.q === 'string' ? resolved.q : '',
    status: typeof resolved.status === 'string' ? resolved.status : '',
    mode: typeof resolved.mode === 'string' ? resolved.mode : '',
  };
  const projects = await getProjects(filters);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">Proyectos</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Vista editable de proyectos</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          Cada proyecto aparece en una card vertical editable por columnas, con guardado directo por fila al final.
        </p>
      </section>

      <UnifiedSearchBar
        placeholder="Buscar proyecto, cliente o modalidad..."
        filters={[
          { key: 'status', label: 'Estado', options: [
            { value: 'activo', label: 'Activo' },
            { value: 'en_pausa', label: 'En pausa' },
            { value: 'completado', label: 'Completado' },
            { value: 'vencido', label: 'Vencido' },
          ] },
          { key: 'mode', label: 'Modalidad', options: [
            { value: 'solo', label: 'Solo' },
            { value: 'collaborative', label: 'Colaborativo' },
          ] },
        ]}
        values={filters}
      />

      <ProjectEditableTable
        initialProjects={projects.map((project) => ({
          id: project.id,
          title: project.title,
          status: project.status,
          due_date: project.due_date ?? null,
          is_collaborative: project.is_collaborative ?? false,
          client_name: project.client_name ?? null,
        }))}
      />
    </div>
  );
}
