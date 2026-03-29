import Link from "next/link";
import { ArrowRight, LayoutGrid, ListChecks, ShieldCheck, Sparkles } from "lucide-react";

const highlights = [
  {
    label: "Centro de control",
    title: "Pizarra, lista y agenda en un mismo flujo.",
    copy: "Mueve trabajo, retoma contexto y decide rápido con el mismo lenguaje visual del workspace.",
    icon: LayoutGrid,
  },
  {
    label: "Seguimiento real",
    title: "Tareas, proyectos y recordatorios conectados.",
    copy: "Todo vive en Supabase para que lo que hagas en la app se refleje en tus módulos operativos.",
    icon: ListChecks,
  },
  {
    label: "Compartir sin fricción",
    title: "Links, comentarios y visibilidad del equipo.",
    copy: "Colabora sin saltar entre herramientas y mantén trazabilidad con una experiencia limpia.",
    icon: ShieldCheck,
  },
];

const statCards = [
  { label: "Vista principal", value: "Board + Lista", helper: "Decide y ejecuta rápido." },
  { label: "Operación", value: "Tareas reales", helper: "Conectadas a la base de datos." },
  { label: "Contexto", value: "Agenda + foco", helper: "Mismo lenguaje visual en toda la app." },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#061a16] text-white">
      <div className="absolute inset-0">
        <video
          className="hidden h-full w-full object-cover md:block"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/icons/iconoapp.png"
          aria-hidden="true"
        >
          <source src="/videos/desk-movie.mp4" type="video/mp4" />
        </video>
        <video
          className="h-full w-full object-cover md:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/icons/iconoapp.png"
          aria-hidden="true"
        >
          <source src="/videos/movil-movie.mov" type="video/quicktime" />
          <source src="/videos/movil-movie.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(6,59,44,0.88)_0%,rgba(8,20,40,0.78)_46%,rgba(2,6,23,0.94)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.16),transparent_32%),radial-gradient(circle_at_85%_18%,rgba(59,130,246,0.16),transparent_24%)]" />
      </div>

      <div className="relative z-10">
        <div className="container-page flex min-h-screen flex-col py-5 md:py-7">
          <header className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-xl md:px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-[0_8px_30px_rgba(2,6,23,0.22)]">
                <Sparkles className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300/90">FlowTask</p>
                <p className="text-sm text-slate-300">Workspace operativo con Supabase</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" className="rounded-2xl border border-white/10 bg-white/8 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/12">
                Iniciar sesión
              </Link>
              <Link href="/register" className="rounded-2xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
                Crear cuenta
              </Link>
            </div>
          </header>

          <section className="flex flex-1 items-center py-10 md:py-14">
            <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)] xl:items-end">
              <div className="max-w-3xl rounded-[32px] border border-white/10 bg-white/8 p-6 shadow-[0_18px_60px_rgba(2,6,23,0.2)] backdrop-blur-xl md:p-8 lg:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-300">Vista principal</p>
                <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.04] tracking-tight text-white md:text-6xl">
                  Gestiona tareas, proyectos y seguimiento con una experiencia moderna y enfocada.
                </h1>
                <p className="prose-balance mt-5 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
                  FlowTask unifica tablero, calendario, agenda y módulos operativos en un solo workspace visual para decidir rápido y ejecutar mejor.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/register" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_30px_rgba(16,185,129,0.28)] transition hover:bg-emerald-300">
                    Crear cuenta <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/login" className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12">
                    Entrar al workspace
                  </Link>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {statCards.map((item) => (
                    <div key={item.label} className="rounded-[22px] border border-white/10 bg-slate-950/22 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">{item.label}</p>
                      <p className="mt-3 text-xl font-bold tracking-tight text-white">{item.value}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{item.helper}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-[28px] border border-white/10 bg-white/8 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.16)] backdrop-blur-xl md:p-6">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-emerald-400/14 text-emerald-200">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">{item.label}</p>
                          <h2 className="mt-2 text-xl font-bold leading-tight text-white">{item.title}</h2>
                          <p className="mt-3 text-sm leading-6 text-slate-300">{item.copy}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <div className="mt-auto flex flex-col gap-3 rounded-[28px] border border-white/10 bg-slate-950/28 px-5 py-4 text-sm text-slate-300 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <p className="max-w-3xl leading-6 text-slate-300">
              Usa los videos en <span className="font-semibold text-white">public/videos</span> para tener una portada viva sin romper el estilo del dashboard.
            </p>
            <div className="flex gap-3">
              <Link href="/contact" className="rounded-2xl border border-white/10 px-4 py-2 font-semibold text-white transition hover:bg-white/10">
                Contacto
              </Link>
              <Link href="/app/dashboard" className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 font-semibold text-emerald-200 transition hover:bg-emerald-400/16">
                Ir al panel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
