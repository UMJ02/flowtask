import { HomeShowcaseCard } from '@/components/public/home-showcase-card';
import { HomeAuthActions } from '@/components/public/home-auth-actions';

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 lg:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/videos/videointro.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/icons/icon.png"
        >
          Tu navegador no soporta video HTML5.
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.28)_0%,rgba(2,6,23,0.10)_38%,rgba(2,6,23,0.22)_100%)]" />
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="container-page flex min-h-screen items-center py-5 md:py-6">
          <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(400px,520px)] lg:items-center">
            <div className="hidden min-h-[520px] items-end lg:flex">
              <div className="max-w-[520px] rounded-[22px] border border-white/12 bg-[linear-gradient(180deg,rgba(15,23,42,0.78),rgba(15,23,42,0.64))] px-4 py-4 shadow-[0_28px_60px_rgba(15,23,42,0.22)] backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">FlowTask experience</p>
                <p className="mt-2.5 text-[1.85rem] font-bold leading-tight text-white">
                  Planea, organiza y ejecuta con una vista moderna y clara.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-[500px] rounded-[24px] border border-white/70 bg-white/74 p-4 shadow-[0_22px_56px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:bg-white/12 lg:shadow-[0_24px_64px_rgba(15,23,42,0.22)] md:p-6">
                <span className="inline-flex rounded-full bg-emerald-50/90 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  FlowTask · Web app
                </span>

                <h1 className="mt-4 text-[2.35rem] font-bold tracking-tight text-slate-900 lg:text-white md:text-[2.95rem] lg:[text-shadow:0_10px_30px_rgba(15,23,42,0.35)]">
                  Gestiona tareas, proyectos y seguimiento sin complicarte.
                </h1>

                <p className="mt-4 max-w-xl text-[15px] leading-7 text-slate-600 md:text-lg lg:text-white lg:[text-shadow:0_8px_24px_rgba(15,23,42,0.28)]">
                  Tablero personal privado, proyectos colaborativos, comentarios con fecha automática y vistas por link para jefatura.
                </p>

                <HomeAuthActions />

                <div className="mt-6">
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
