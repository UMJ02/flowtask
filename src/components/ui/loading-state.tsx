import { BrandLoader } from '@/components/ui/brand-loader';

export function LoadingState({
  title = 'Preparando tu espacio…',
  description = 'Cargando tarjetas, accesos y contenido para que todo aparezca de forma clara.',
  cards = 3,
}: {
  title?: string;
  description?: string;
  cards?: number;
}) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-[28px] border border-slate-200/80 bg-white/[0.88] p-4 shadow-[0_12px_26px_rgba(15,23,42,0.05)] md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <BrandLoader className="md:min-w-[110px]" label="FlowTask" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-2">
              <div className="skeleton h-3.5 w-24 rounded-full" />
              <div className="skeleton h-8 w-full max-w-[320px] rounded-full" />
            </div>
            <div className="skeleton h-3.5 w-full max-w-3xl rounded-full" />
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3">
              <div className="text-sm font-semibold text-emerald-700">{title}</div>
              <p className="mt-1 text-sm leading-6 text-emerald-800/80">{description}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="skeleton h-32 rounded-[24px]" />
        ))}
      </div>
    </div>
  );
}
