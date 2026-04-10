import { AuthBrand } from "@/components/auth/auth-brand";
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

      <div className="container-page relative flex min-h-screen items-center justify-center py-5">
        <div className="w-full max-w-[510px] rounded-[24px] border border-white/80 bg-white/90 p-4 shadow-[0_24px_64px_rgba(15,23,42,0.10)] backdrop-blur-xl md:p-6">
          <AuthBrand />
          <div className="mb-5 text-center">
            <h1 className="text-[1.8rem] font-bold text-slate-900 md:text-[2.05rem]">Iniciar sesión</h1>
            <p className="mt-1.5 text-sm text-slate-600 md:text-base">Accede a tu tablero personal y proyectos.</p>
          </div>

          <LoginForm initialNext={next} />
        </div>
      </div>
    </main>
  );
}
