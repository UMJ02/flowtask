import Link from 'next/link';
import { ArrowRightLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { IntelligenceModuleDefinition } from '@/lib/intelligence/module-registry';

const lifecycleClassMap = {
  core: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  support: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
  legacy: 'bg-amber-50 text-amber-800 ring-1 ring-amber-100',
} as const;

export function ModuleConsolidationBanner({
  module,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  module: IntelligenceModuleDefinition;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <Card className="border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_100%)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${lifecycleClassMap[module.lifecycle]}`}>
              {module.lifecycleLabel}
            </span>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              {module.shortLabel}
            </span>
          </div>
          <h3 className="mt-3 text-xl font-bold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={primaryHref}>
            <Button>
              <ArrowRightLeft className="h-4 w-4" /> {primaryLabel}
            </Button>
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link href={secondaryHref}>
              <Button variant="secondary">
                <ArrowUpRight className="h-4 w-4" /> {secondaryLabel}
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
