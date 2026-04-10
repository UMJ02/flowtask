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
    <div className="fixed inset-0 z-[120] overflow-hidden bg-[linear-gradient(180deg,#eefaf5_0%,#f8fafc_42%,#eef5f2_100%)] animate-fade-in">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="mx-auto flex w-full max-w-[920px] flex-col items-center text-center">
          <BrandLoader className="-mb-2" label="FlowTask" />
          <div className="mt-1 w-full max-w-[760px]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-400 md:text-xs">Cargando vista</div>
            <h1 className="mt-4 text-balance text-[clamp(2.1rem,4vw,3.55rem)] font-semibold tracking-[-0.04em] text-slate-900">
              {title}
            </h1>
            <p className="mx-auto mt-4 max-w-[760px] text-balance text-[clamp(1.05rem,2vw,1.45rem)] leading-[1.65] text-slate-600">
              {description}
            </p>
          </div>

          <div className="mt-10 grid w-full max-w-[920px] gap-3 md:grid-cols-3">
            {Array.from({ length: cards }).map((_, index) => (
              <div
                key={index}
                className="rounded-[22px] border border-white/80 bg-white/70 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur-sm"
              >
                <div className="skeleton h-3 w-24 rounded-full" />
                <div className="mt-4 skeleton h-6 w-2/3 rounded-full" />
                <div className="mt-5 skeleton h-3 w-full rounded-full" />
                <div className="mt-2 skeleton h-3 w-5/6 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
