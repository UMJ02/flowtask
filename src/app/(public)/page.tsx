import Link from "next/link";
import { HomeShowcaseCard } from '@/components/public/home-showcase-card';

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 hidden lg:block">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/videos/videointro.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.50)_0%,rgba(2,6,23,0.16)_38%,rgba(2,6,23,0.34)_100%)]" />
      </div>

      <div className="relative min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f2f7f4_48%,#eef5f2_100%)] lg:bg-transparent">
        <div className="container-page flex min-h-screen items-center py-8 md:py-10">
          <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,540px)] lg:items-center">
            <div className="hidden min-h-[620px] items-end lg:flex">
              <div className="max-w-[520px] rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(15,23,42,0.72))] px-6 py-6 shadow-[0_28px_60px_rgba(15,23,42,0.22)] backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">FlowTask experience</p>
                <p className="mt-3 text-2xl font-bold leading-tight text-white">
                  Planea, organiza y ejecuta con una vista moderna y clara.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-[540px] rounded-[32px] border border-white/60 bg-white/78 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-xl md:p-8">
                <span className="inline-flex rounded-full bg-emerald-50/90 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
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
                  <Link className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50" href="/register">
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
