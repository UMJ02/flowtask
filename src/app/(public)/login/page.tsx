import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const next = typeof params.next === "string" ? params.next : undefined;

  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="container-page max-w-md">
        <div className="rounded-[28px] bg-white p-8 shadow-soft">
          <div className="mb-6 space-y-2 text-center">
            <Link className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500" href="/">
              FlowTask
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Iniciar sesión</h1>
            <p className="text-sm text-slate-600">Accede a tu tablero personal y proyectos.</p>
          </div>
          <LoginForm initialNext={next} />
        </div>
      </div>
    </main>
  );
}
