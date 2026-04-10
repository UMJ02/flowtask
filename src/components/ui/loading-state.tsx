import { BrandLoader } from '@/components/ui/brand-loader';

export function LoadingState({
  title = 'Preparando tu espacio…',
  description = 'Estamos acomodando la vista para que todo aparezca claro, ordenado y sin saltos visuales.',
  cards = 3,
}: {
  title?: string;
  description?: string;
  cards?: number;
}) {
  return (
    <div className="flex min-h-[54vh] flex-col items-center justify-center gap-7 px-4 py-8 animate-fade-in">
      <div className="mx-auto flex max-w-[420px] flex-col items-center text-center">
        <BrandLoader label="FlowTask" />
        <div className="mt-2 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Cargando vista</p>
          <h2 className="text-[1.35rem] font-bold leading-tight text-slate-900 md:text-[1.55rem]">{title}</h2>
          <p className="text-sm leading-6 text-slate-600 md:text-[15px]">{description}</p>
        </div>
      </div>
      <div className="grid w-full max-w-4xl gap-3 md:grid-cols-3">
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="skeleton h-24 rounded-[22px]" />
        ))}
      </div>
    </div>
  );
}
