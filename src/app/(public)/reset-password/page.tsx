import { AuthBrand } from "@/components/auth/auth-brand";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#ecfdf5_0%,#f8fafc_38%,#eef5f2_100%)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-90px] h-[280px] w-[280px] rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-80px] h-[260px] w-[260px] rounded-full bg-emerald-300/35 blur-3xl" />
      </div>

      <div className="container-page relative flex min-h-screen items-center justify-center py-8">
        <div className="w-full max-w-[560px] rounded-[34px] border border-white/80 bg-white/88 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl md:p-8">
          <AuthBrand />
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Nueva contraseña</h1>
            <p className="mt-2 text-sm text-slate-600 md:text-base">Actualiza tu acceso para seguir trabajando con seguridad.</p>
          </div>

          <ResetPasswordForm />
        </div>
      </div>
    </main>
  );
}
