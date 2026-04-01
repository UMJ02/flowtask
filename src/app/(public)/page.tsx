import Link from "next/link";
import { HomeShowcaseCard } from '@/components/public/home-showcase-card';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f2f7f4_48%,#eef5f2_100%)]">
      <div className="container-page py-8 md:py-12">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-slate-200/90 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)] lg:items-center">
            <div className="relative hidden min-h-[520px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-slate-950 shadow-[0_24px_56px_rgba(15,23,42,0.18)] lg:block">
              <video
                className="h-full w-full object-cover opacity-90"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              >
                <source src="/videos/videointro.mp4" type="video/mp4" />
              </video>
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.18),rgba(2,6,23,0.38))]" />
              <div className="absolute inset-x-6 bottom-6 rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">FlowTask experience</p>
                <p className="mt-3 max-w-md text-2xl font-bold text-white">Planea, organiza y ejecuta con una vista moderna y clara.</p>
              </div>
            </div>

            <div className="flex min-h-full items-center justify-center">
              <div className="w-full max-w-[560px] rounded-[30px] border border-slate-200/90 bg-white/[0.90] p-6 shadow-[0_18px_46px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  FlowTask · Web app
                </span>
                <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                  Gestiona tareas, proyectos y seguimiento sin complicarte.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 md:text-lg">
                  Tablero personal privado, proyectos colaborativos, comentarios con fecha automática y vistas por link para jefatura.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-950" href="/login">
                    Iniciar sesión
                  </Link>
                  <Link className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50" href="/register">
                    Crear cuenta
                  </Link>
                </div>
                <div className="mt-7">
                  <HomeShowcaseCard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
