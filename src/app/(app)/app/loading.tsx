function Block({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function AppLoading() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="rounded-[32px] border border-slate-200/70 bg-white/80 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
        <div className="mb-5 flex items-center gap-3">
          <Block className="h-14 w-14 rounded-[24px]" />
          <div className="space-y-2">
            <Block className="h-4 w-28 rounded-full" />
            <Block className="h-9 w-72 rounded-full" />
          </div>
        </div>
        <Block className="h-4 w-full max-w-3xl rounded-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Block className="h-40 rounded-[28px]" />
        <Block className="h-40 rounded-[28px]" />
        <Block className="h-40 rounded-[28px]" />
      </div>
      <Block className="h-24 w-full rounded-[28px]" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Block className="h-64 rounded-[28px]" />
        <Block className="h-64 rounded-[28px]" />
      </div>
      <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/80 px-4 py-3">
        <div className="flex items-center gap-3 text-sm font-medium text-emerald-700">
          <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.14)]" />
          Preparando tu espacio…
        </div>
        <p className="mt-1 text-sm text-emerald-800/80">Cargando tarjetas, listas y accesos rápidos para que todo aparezca de una forma más fluida.</p>
      </div>
    </div>
  );
}
