export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">FlowTask</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Sin conexión</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Parece que no tienes internet en este momento. Cuando vuelvas a conectarte, podrás seguir trabajando normalmente.
        </p>
      </div>
    </main>
  );
}
