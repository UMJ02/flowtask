import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container-page py-16">
        <div className="mx-auto max-w-5xl rounded-[28px] bg-white p-8 shadow-soft md:p-12">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div className="space-y-6">
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                FlowTask · Web app
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Gestiona tareas, proyectos y seguimiento sin complicarte.
              </h1>
              <p className="text-lg text-slate-600">
                Tablero personal privado, proyectos colaborativos, comentarios con fecha automática y vistas por link para jefatura.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white" href="/login">
                  Iniciar sesión
                </Link>
                <Link className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-800" href="/register">
                  Crear cuenta
                </Link>
              </div>
            </div>
            <div className="grid gap-4 rounded-[24px] bg-slate-100 p-5">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Hoy</p>
                <p className="mt-1 text-lg font-semibold">3 tareas por vencer</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Proyecto colaborativo</p>
                <p className="mt-1 text-lg font-semibold">Lanzamiento campaña abril</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Seguimiento</p>
                <p className="mt-1 text-lg font-semibold">Comentarios y cambios con fecha automática</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
