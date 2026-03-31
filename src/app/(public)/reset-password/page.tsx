import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="container-page max-w-md">
        <div className="rounded-[28px] bg-white p-8 shadow-soft">
          <div className="mb-6 space-y-2 text-center">
            <Link className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500" href="/">
              FlowTask
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Nueva contraseña</h1>
            <p className="text-sm text-slate-600">Actualiza tu acceso para seguir trabajando.</p>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
    </main>
  );
}
