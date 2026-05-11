import Image from 'next/image';
import Link from 'next/link';
import { AuthBrand } from '@/components/auth/auth-brand';

export default function ConfirmedPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F7F9FC]">
      <div className="container-page relative flex min-h-screen items-center justify-center px-4 py-5">
        <section className="w-full max-w-[720px] overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[var(--ft-shadow-card)] md:p-8">
          <AuthBrand />
          <div className="mx-auto mt-3 flex max-w-[320px] justify-center">
            <Image
              src="/check/confirmacion.png"
              alt="Cuenta confirmada"
              width={320}
              height={320}
              priority
              className="h-auto w-full object-contain"
            />
          </div>
          <h1 className="mt-6 text-[32px] font-bold tracking-[-0.03em] text-slate-950 md:text-[44px]">
            ¡Bienvenido a <span className="text-[#16C784]">FlowTask</span>!
          </h1>
          <p className="mx-auto mt-3 max-w-[520px] text-base leading-7 text-slate-600">
            Tu cuenta fue confirmada correctamente. Ya podés iniciar sesión y entrar a tu workspace.
          </p>
          <div className="mt-8">
            <Link href="/login" className="ft-apple-button ft-apple-button-primary">
              Ir al login
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
