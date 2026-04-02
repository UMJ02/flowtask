
export const dynamic = 'force-dynamic';

import { Card } from '@/components/ui/card';
import { ProjectForm } from '@/components/projects/project-form';

export default async function ProjectNewPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const search = (await searchParams) ?? {};
  const queryString = new URLSearchParams(
    Object.entries(search).flatMap(([key, value]) => typeof value === 'string' && value ? [[key, value]] : [])
  ).toString();

  return (
    <div className="space-y-4">
      <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.92] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Nuevo proyecto</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Crear proyecto</h1>
        <p className="mt-2 text-sm text-slate-500">Prepara un frente nuevo con su cliente, deadline, área y modo colaborativo.</p>
      </Card>
      <ProjectForm redirectTo={queryString ? `/app/projects?${queryString}` as any : '/app/projects'} />
    </div>
  );
}
