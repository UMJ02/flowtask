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
    <div className="fixed inset-0 z-[120] overflow-hidden bg-[linear-gradient(180deg,#eff8f4_0%,#f8fafc_45%,#eef4f1_100%)] animate-fade-in">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-6">
        <div className="mx-auto flex w-full max-w-[880px] -translate-y-8 flex-col items-center text-center md:-translate-y-10">
          <BrandLoader className="mb-1" label="FlowTask" />
          <div className="w-full max-w-[680px]">
            <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-slate-400 md:text-[11px]">Cargando vista</div>
            <h1 className="mt-3 text-balance text-[clamp(1.85rem,3.4vw,3rem)] font-semibold tracking-[-0.045em] text-slate-900">
              {title}
            </h1>
            <p className="mx-auto mt-3 max-w-[660px] text-balance text-[clamp(0.98rem,1.65vw,1.25rem)] leading-[1.55] text-slate-600">
              {description}
            </p>
          </div>

          <div className="mt-8 grid w-full max-w-[860px] gap-3 md:grid-cols-3">
            {Array.from({ length: cards }).map((_, index) => (
              <div
                key={index}
                className="rounded-[18px] border border-white/80 bg-white/60 p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] backdrop-blur-sm"
              >
                <div className="skeleton h-2.5 w-20 rounded-full" />
                <div className="mt-3 skeleton h-5 w-2/3 rounded-full" />
                <div className="mt-4 skeleton h-2.5 w-full rounded-full" />
                <div className="mt-2 skeleton h-2.5 w-5/6 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
