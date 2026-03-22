function Block({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function AppLoading() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-[32px] border border-slate-200/70 bg-white/80 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="mb-4 flex items-center gap-3">
          <Block className="h-12 w-12 rounded-2xl" />
          <div className="space-y-2">
            <Block className="h-4 w-28 rounded-full" />
            <Block className="h-8 w-64 rounded-full" />
          </div>
        </div>
        <Block className="h-4 w-full max-w-2xl rounded-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Block className="h-40" />
        <Block className="h-40" />
        <Block className="h-40" />
      </div>
      <Block className="h-24 w-full" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Block className="h-64" />
        <Block className="h-64" />
      </div>
      <div className="flex items-center gap-2 px-1 text-sm font-medium text-slate-500">
        <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
        Cargando tu espacio de trabajo…
      </div>
    </div>
  );
}
