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
    <div className="space-y-5 animate-fade-in">
      <div className="rounded-[32px] border border-slate-200/70 bg-white/[0.80] p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
        <div className="mb-5 flex items-center gap-3">
          <div className="skeleton h-14 w-14 rounded-[24px]" />
          <div className="space-y-2">
            <div className="skeleton h-4 w-28 rounded-full" />
            <div className="skeleton h-9 w-72 rounded-full" />
          </div>
        </div>
        <div className="skeleton h-4 w-full max-w-3xl rounded-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="skeleton h-40 rounded-[28px]" />
        ))}
      </div>
      <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/80 px-4 py-3">
        <div className="flex items-center gap-3 text-sm font-medium text-emerald-700">
          <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.14)]" />
          {title}
        </div>
        <p className="mt-1 text-sm text-emerald-800/80">{description}</p>
      </div>
    </div>
  );
}
