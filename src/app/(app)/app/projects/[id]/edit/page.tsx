import { notFound } from 'next/navigation';
import { ProjectForm } from '@/components/projects/project-form';
import { Card } from '@/components/ui/card';
import { projectDetailRoute } from '@/lib/navigation/routes';
import { getProjectById } from '@/lib/queries/projects';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function EditProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const queryString = new URLSearchParams(Object.entries(query).flatMap(([key, value]) => typeof value === 'string' ? [[key, value]] : Array.isArray(value) ? value.map((item) => [key, item]) : [])).toString();
  const project = await safeServerCall('getProjectById', () => getProjectById(id), null);
  if (!project) notFound();
  const department = Array.isArray(project.departments) ? project.departments[0] : project.departments;

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Editar proyecto</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{project.title}</h1>
      </Card>
      <ProjectForm
        projectId={id}
        redirectTo={projectDetailRoute(id, queryString)}
        initialData={{
          title: project.title,
          description: project.description ?? '',
          status: project.status,
          department: department?.code ?? '',
          clientName: project.client_name ?? '',
          dueDate: project.due_date ?? '',
          isCollaborative: project.is_collaborative ?? false,
          shareToken: project.share_token ?? null,
        }}
      />
    </div>
  );
}
