import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="container-page max-w-md">
        <div className="rounded-[28px] bg-white p-8 shadow-soft">
          <div className="mb-6 space-y-2 text-center">
            <Link className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500" href="/">
              FlowTask
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Recuperar contraseña</h1>
            <p className="text-sm text-slate-600">Te enviaremos un enlace por correo.</p>
          </div>
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
