import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { IntelligenceModuleDefinition } from '@/lib/intelligence/module-registry';

const lifecycleClassMap = {
  core: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  support: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
  legacy: 'bg-amber-50 text-amber-800 ring-1 ring-amber-100',
} as const;

export function ModuleMap({
  title,
  description,
  modules,
}: {
  title: string;
  description: string;
  modules: IntelligenceModuleDefinition[];
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {modules.map((module) => (
          <div key={module.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${lifecycleClassMap[module.lifecycle]}`}>
                {module.lifecycleLabel}
              </span>
              <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                {module.shortLabel}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">{module.title}</p>
            <p className="mt-2 text-sm text-slate-500">{module.description}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
              <Link href={module.href} className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900">
                {module.cta} <ArrowUpRight className="h-4 w-4" />
              </Link>
              {module.pdfHref ? (
                <Link href={module.pdfHref} target="_blank" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700">
                  PDF <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
