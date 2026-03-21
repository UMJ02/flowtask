import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/projects/project-form";
import { getProjectById } from "@/lib/queries/projects";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) notFound();

  const department = Array.isArray(project.departments) ? project.departments[0] : project.departments;

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] bg-white p-5 shadow-soft">
        <h1 className="text-2xl font-bold text-slate-900">Editar proyecto</h1>
        <p className="text-sm text-slate-500">Actualiza datos principales, colaboración y deadline.</p>
      </div>
      <ProjectForm
        projectId={project.id}
        redirectTo={`/app/projects/${project.id}`}
        initialData={{
          title: project.title,
          description: project.description ?? "",
          status: project.status,
          department: department?.code ?? "",
          clientName: project.client_name ?? "",
          dueDate: project.due_date ? String(project.due_date).slice(0, 10) : "",
          isCollaborative: project.is_collaborative,
        }}
      />
    </div>
  );
}
