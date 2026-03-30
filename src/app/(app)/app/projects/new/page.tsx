import { ProjectForm } from '@/components/projects/project-form';
import { Card } from '@/components/ui/card';
import { projectListRoute } from '@/lib/navigation/routes';

export default function NewProjectPage() {
  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Nuevo proyecto</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Crear proyecto</h1>
      </Card>
      <ProjectForm redirectTo={projectListRoute()} />
    </div>
  );
}
