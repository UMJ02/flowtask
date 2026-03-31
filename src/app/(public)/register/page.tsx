import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="container-page max-w-md">
        <div className="rounded-[28px] bg-white p-8 shadow-soft">
          <div className="mb-6 space-y-2 text-center">
            <Link className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500" href="/">
              FlowTask
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Crear cuenta</h1>
            <p className="text-sm text-slate-600">Tu tablero es privado. Tus proyectos pueden ser colaborativos.</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
