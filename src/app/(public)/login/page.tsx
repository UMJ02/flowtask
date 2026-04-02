import Image from "next/image";
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
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#ecfdf5_0%,#f8fafc_38%,#eef5f2_100%)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-90px] h-[280px] w-[280px] rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-80px] h-[260px] w-[260px] rounded-full bg-emerald-300/35 blur-3xl" />
      </div>

      <div className="container-page relative flex min-h-screen items-center justify-center py-8">
        <div className="w-full max-w-[560px] rounded-[34px] border border-white/80 bg-white/88 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl md:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 shadow-[0_16px_36px_rgba(15,23,42,0.16)]">
              <Image src="/icons/icon.png" alt="FlowTask" width={30} height={30} className="h-[30px] w-[30px] object-contain" priority />
            </div>
            <Link className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700" href="/">
              FlowTask
            </Link>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">Iniciar sesión</h1>
            <p className="mt-2 text-sm text-slate-600 md:text-base">Accede a tu tablero personal y proyectos.</p>
          </div>

          <LoginForm initialNext={next} />

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Aún no tienes cuenta?{" "}
            <Link href="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
