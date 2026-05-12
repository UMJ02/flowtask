import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { AuthBrand } from '@/components/auth/auth-brand';
import { ResendConfirmationForm } from '@/components/auth/resend-confirmation-form';

function getErrorCopy(reason?: string) {
  if (reason === 'invalid-link') {
    return 'El enlace de confirmación no está completo o no coincide con el formato esperado.';
  }

  if (reason === 'expired-or-used') {
    return 'El enlace pudo haber vencido o ya fue utilizado. Solicita un nuevo correo para continuar.';
  }

  return 'No pudimos confirmar tu cuenta con este enlace. Puedes volver al login o solicitar un nuevo correo.';
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const reason = typeof params.reason === 'string' ? params.reason : undefined;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F7F9FC]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-90px] h-[280px] w-[280px] rounded-full bg-rose-100/60 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-80px] h-[260px] w-[260px] rounded-full bg-emerald-200/25 blur-3xl" />
      </div>

      <div className="container-page relative flex min-h-screen items-center justify-center px-4 py-5">
        <section className="w-full max-w-[560px] overflow-hidden rounded-[18px] border border-slate-200 bg-white p-5 text-center shadow-none md:p-6">
          <AuthBrand />
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 ring-8 ring-rose-50/70">
            <AlertCircle className="h-10 w-10 text-rose-500" aria-hidden="true" />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.28em] text-rose-600">Confirmación pendiente</p>
          <h1 className="mt-3 text-[24px] font-semibold tracking-[-0.02em] text-slate-950 md:text-[28px]">No pudimos confirmar tu cuenta</h1>
          <p className="mx-auto mt-3 max-w-[420px] text-sm leading-6 text-slate-600 md:text-base">{getErrorCopy(reason)}</p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-900" href="/login">
              Ir al login
            </Link>
            <Link className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50" href="/register">
              Crear cuenta nueva
            </Link>
          </div>

          <div className="mt-5">
            <ResendConfirmationForm />
          </div>
        </section>
      </div>
    </main>
  );
}
