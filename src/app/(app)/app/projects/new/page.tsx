export const dynamic = 'force-dynamic';

import { PageIntro } from '@/components/ui/page-intro';
import { Card } from '@/components/ui/card';
import { ProjectForm } from '@/components/projects/project-form';

export default async function ProjectNewPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const search = (await searchParams) ?? {};
  const queryString = new URLSearchParams(
    Object.entries(search).flatMap(([key, value]) => typeof value === 'string' && value ? [[key, value]] : [])
  ).toString();

  const clientName = typeof search.clientName === 'string' ? search.clientName : '';

  return (
    <div className="space-y-4">
      <PageIntro
        eyebrow="Nuevo proyecto"
        title="Crear proyecto"
        description="Prepara un frente nuevo con su cliente, deadline, área y modo colaborativo. Esta pantalla ya incluye feedback visual, validaciones visibles y mensajes más claros para un flujo de cliente real."
        aside={
          <Card className="rounded-[24px] border border-emerald-200 bg-emerald-50/75 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Checklist rápido</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-900">
              <li>• Define un nombre entendible para el equipo</li>
              <li>• Asigna cliente si aplica</li>
              <li>• Marca colaborativo solo si compartirán miembros</li>
            </ul>
          </Card>
        }
      />
      <ProjectForm
        initialData={{ clientName }}
        redirectTo={queryString ? `/app/projects?${queryString}` as any : '/app/projects'}
      />
    </div>
  );
}
