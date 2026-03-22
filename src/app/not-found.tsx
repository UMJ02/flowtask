import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 py-16">
      <div className="w-full rounded-[28px] bg-white p-8 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">FlowTask</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">No encontramos lo que buscas</h1>
        <p className="mt-3 text-sm text-slate-600">El enlace puede haber cambiado, no existir o no estar disponible para tu organización actual.</p>
        <Link href="/app/dashboard" className="mt-6 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          Volver al dashboard
        </Link>
      </div>
    </main>
  );
}
