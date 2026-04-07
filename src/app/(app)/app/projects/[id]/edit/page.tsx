
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { ProjectForm } from '@/components/projects/project-form';
import { getProjectById } from '@/lib/queries/projects';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function ProjectEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const search = (await searchParams) ?? {};
  const queryString = new URLSearchParams(
    Object.entries(search).flatMap(([key, value]) => typeof value === 'string' && value ? [[key, value]] : [])
  ).toString();
  const project = await safeServerCall('getProjectById', () => getProjectById(id), null);
  if (!project) notFound();
  const department = Array.isArray(project.departments) ? project.departments[0] : project.departments;

  return (
    <div className="space-y-4">
      <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.92] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Editar proyecto</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{project.title}</h1>
        <p className="mt-2 text-sm text-slate-500">Actualiza datos del frente, visibilidad y deadline sin perder el contexto.</p>
      </Card>
      <ProjectForm
        projectId={project.id}
        redirectTo={queryString ? `/app/projects/${project.id}?${queryString}` as any : `/app/projects/${project.id}` as any}
        initialData={{
          title: project.title ?? '',
          description: project.description ?? '',
          status: project.status ?? 'activo',
          department: department?.code ?? '',
          clientName: project.client_name ?? '',
          dueDate: project.due_date ?? '',
          country: (project as any).country ?? '',
          isCollaborative: project.is_collaborative ?? false,
          shareToken: project.share_token ?? null,
        }}
      />
    </div>
  );
}
