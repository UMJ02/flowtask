import { ProjectForm } from "@/components/projects/project-form";

export default function NewProjectPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-[24px] bg-white p-5 shadow-soft">
        <h1 className="text-2xl font-bold text-slate-900">Nuevo proyecto</h1>
        <p className="text-sm text-slate-500">Crea un proyecto normal o colaborativo.</p>
      </div>
      <ProjectForm />
    </div>
  );
}
