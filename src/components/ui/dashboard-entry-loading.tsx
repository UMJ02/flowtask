import { BrandLoader } from '@/components/ui/brand-loader';

export function DashboardEntryLoading() {
  return (
    <div className="fixed inset-0 z-[120] overflow-hidden bg-[linear-gradient(180deg,#eefaf5_0%,#f8fafc_42%,#eef5f2_100%)] animate-fade-in">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="mx-auto flex w-full max-w-[760px] flex-col items-center text-center">
          <BrandLoader className="-mb-3 scale-[0.72] md:scale-75" label="FlowTask" />
          <div className="mt-0 w-full max-w-[640px]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-400 md:text-xs">Cargando vista</div>
            <h1 className="mt-3 text-balance text-[clamp(1.75rem,3vw,2.65rem)] font-semibold tracking-[-0.04em] text-slate-900">
              Preparando tu espacio…
            </h1>
            <p className="mx-auto mt-3 max-w-[640px] text-balance text-[clamp(0.98rem,1.55vw,1.18rem)] leading-[1.55] text-slate-600">
              Cargando tarjetas, listas y accesos rápidos para que todo aparezca de una forma más fluida.
            </p>
          </div>

          <div className="mt-8 grid w-full max-w-[860px] gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
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
