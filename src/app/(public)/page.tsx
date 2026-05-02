import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarCheck, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

function FlowtaskLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label="FlowTask inicio">
      <Image src="/icons/icon.png" alt="FlowTask" width={34} height={34} className="h-9 w-9 object-contain" priority />
      <span className="text-[1.08rem] font-black uppercase tracking-[0.16em] text-white/90">FlowTask</span>
    </Link>
  );
}

function LandingNavbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <nav className="mx-auto flex w-full max-w-[1480px] items-center justify-between px-6 py-7 md:px-10 lg:px-16">
        <FlowtaskLogo />
        <div className="flex items-center gap-3 md:gap-5">
          <Link href="/login" className="hidden text-sm font-semibold text-white/80 transition hover:text-white sm:inline-flex">
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-[14px] bg-[#16C784] px-5 text-sm font800 font-bold text-white shadow-[0_18px_38px_rgba(22,199,132,0.28)] transition hover:-translate-y-0.5 hover:bg-[#12b877] md:px-7"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </nav>
    </header>
  );
}

function MiniMetricCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-[18px] border border-white/10 bg-white/[0.045] p-4 shadow-[0_16px_42px_rgba(0,0,0,0.18)] backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#16C784]/18 text-[#16C784] ring-1 ring-[#16C784]/20">
            <CalendarCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[0.98rem] font-bold leading-snug text-white">3 tareas<br />por vencer</p>
            <p className="mt-1 text-xs font-medium text-white/60">Prioriza lo importante</p>
          </div>
        </div>
      </div>
      <div className="rounded-[18px] border border-white/10 bg-white/[0.045] p-4 shadow-[0_16px_42px_rgba(0,0,0,0.18)] backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/18 text-violet-300 ring-1 ring-violet-300/20">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[0.98rem] font-bold leading-snug text-white">Seguimiento<br />automático</p>
            <p className="mt-1 text-xs font-medium text-white/60">Avances al día</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroGlassCard() {
  return (
    <section className="relative w-full max-w-[520px] rounded-[30px] border border-white/20 bg-[#050B18]/42 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-[18px] md:p-9">
      <div className="pointer-events-none absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.16),transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.055] px-3.5 py-2 text-xs font-bold text-white/80 shadow-inner shadow-white/5">
          <span className="h-3 w-3 rounded-full bg-[#16C784] shadow-[0_0_20px_rgba(22,199,132,0.7)]" />
          FlowTask · Tu espacio de trabajo
        </div>

        <h1 className="mt-7 max-w-[480px] text-[2.35rem] font-black leading-[1.08] tracking-[-0.045em] text-white md:text-[3.15rem]">
          Gestiona tareas, proyectos y seguimiento <span className="text-[#16C784]">sin complicarte.</span>
        </h1>

        <p className="mt-5 max-w-[430px] text-[1rem] font-medium leading-7 text-white/70 md:text-[1.05rem]">
          Tablero personal privado, proyectos colaborativos y seguimiento automático para mantener el trabajo claro y al día.
        </p>

        <div className="mt-7 space-y-3">
          <Link
            href="/register"
            className="group inline-flex h-[54px] w-full items-center justify-center gap-3 rounded-[15px] bg-[#16C784] px-5 text-[0.98rem] font-black text-white shadow-[0_22px_42px_rgba(22,199,132,0.24)] transition hover:-translate-y-0.5 hover:bg-[#12b877]"
          >
            Crear cuenta gratis
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </Link>
          <Link
            href="/login"
            className="inline-flex h-[54px] w-full items-center justify-center rounded-[15px] border border-white/20 bg-white/[0.035] px-5 text-[0.98rem] font-bold text-white shadow-inner shadow-white/5 transition hover:bg-white/[0.075]"
          >
            Iniciar sesión
          </Link>
        </div>

        <div className="my-7 flex items-center gap-4 text-xs font-semibold text-white/50">
          <span className="h-px flex-1 bg-white/15" />
          <ShieldCheck className="h-4 w-4" />
          Hoy en tu espacio
          <span className="h-px flex-1 bg-white/15" />
        </div>

        <MiniMetricCards />
      </div>
    </section>
  );
}

function SideValueCard() {
  return (
    <aside className="hidden w-full max-w-[420px] rounded-[22px] border border-white/10 bg-[#050B18]/48 p-6 shadow-[0_26px_70px_rgba(0,0,0,0.34)] backdrop-blur-[14px] lg:block">
      <div className="flex items-center gap-2 text-sm font-black text-[#16C784]">
        <Sparkles className="h-4 w-4" />
        Planea, organiza y ejecuta
      </div>
      <p className="mt-4 max-w-[340px] text-[2rem] font-black leading-tight tracking-[-0.04em] text-white">
        con una vista moderna y clara.
      </p>
      <div className="mt-5 h-px w-full bg-gradient-to-r from-[#16C784]/70 via-white/10 to-transparent" />
    </aside>
  );
}

function LandingFooter() {
  return (
    <footer className="absolute inset-x-0 bottom-0 z-20 hidden border-t border-white/10 lg:block">
      <div className="mx-auto grid w-full max-w-[1480px] grid-cols-3 items-center px-16 py-7 text-sm font-medium text-white/60">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-white/60" />
          Seguridad y privacidad garantizadas
        </div>
        <p className="text-center">© 2026 FlowTask. Todos los derechos reservados.</p>
        <div className="flex justify-end gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xs font-black text-white/70 ring-1 ring-white/10">in</span>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xs font-black text-white/70 ring-1 ring-white/10">ig</span>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xs font-black text-white/70 ring-1 ring-white/10">f</span>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B18] text-white">
      <div className="absolute inset-0 z-0">
        <video
          className="absolute inset-0 h-full w-full scale-[1.02] object-cover"
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
        <div className="absolute inset-0 bg-[#050B18]/48" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_45%,rgba(255,255,255,0.10),transparent_28%),linear-gradient(90deg,rgba(5,11,24,0.60)_0%,rgba(5,11,24,0.32)_42%,rgba(5,11,24,0.58)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050B18]/82 to-transparent" />
      </div>

      <LandingNavbar />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1480px] items-center px-6 pb-24 pt-28 md:px-10 lg:px-16 lg:pb-28 lg:pt-28">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(460px,540px)]">
          <div className="flex min-h-[520px] items-end">
            <SideValueCard />
          </div>
          <div className="flex justify-center lg:justify-end">
            <HeroGlassCard />
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
