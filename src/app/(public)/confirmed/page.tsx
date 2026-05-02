import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { AuthBrand } from '@/components/auth/auth-brand';
import { AuthRedirectCountdown } from '@/components/auth/auth-redirect-countdown';

export default function ConfirmedPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F7F9FC]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-90px] h-[280px] w-[280px] rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-80px] h-[260px] w-[260px] rounded-full bg-emerald-300/25 blur-3xl" />
      </div>

      <div className="container-page relative flex min-h-screen items-center justify-center px-4 py-8">
        <section className="w-full max-w-[560px] overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-[0_24px_64px_rgba(15,23,42,0.08)] md:p-8">
          <AuthBrand />
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/70">
            <CheckCircle2 className="h-10 w-10 text-[#16C784]" aria-hidden="true" />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-700">Confirmación completada</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">Cuenta confirmada</h1>
          <p className="mx-auto mt-3 max-w-[390px] text-sm leading-6 text-slate-600 md:text-base">
            Tu correo fue validado correctamente. Ya podés iniciar sesión y continuar con tu workspace de FlowTask.
          </p>

          <div className="mt-7">
            <AuthRedirectCountdown href="/login" seconds={5} />
          </div>

          <p className="mt-5 text-xs text-slate-400">
            ¿Necesitás crear otra cuenta?{' '}
            <Link className="font-semibold text-emerald-700 hover:text-emerald-800" href="/register">
              Ir a registro
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
