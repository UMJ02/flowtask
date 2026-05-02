import { BrandLoader } from '@/components/ui/brand-loader';

export function AuthPremiumLoader({
  title = 'Preparando tu espacio…',
  description = 'Estamos cargando Flowtask.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex min-h-dvh w-screen items-center justify-center overflow-hidden bg-white/86 px-5 py-8 backdrop-blur-[18px]"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(22,199,132,0.10),transparent_36%),linear-gradient(180deg,rgba(248,250,252,0.76)_0%,rgba(255,255,255,0.92)_48%,rgba(238,247,243,0.80)_100%)]" aria-hidden />
      <section className="relative z-10 w-full max-w-[380px] rounded-[28px] border border-slate-200/80 bg-white/94 p-6 text-center shadow-[0_24px_70px_rgba(15,23,42,0.11)]">
        <BrandLoader className="mx-auto" label="Flowtask" />
        <div className="mx-auto mt-5 h-[3px] w-full max-w-[210px] overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-1/2 animate-[auth-loader-slide_2.5s_ease-in-out_infinite] rounded-full bg-[#16C784]" />
        </div>
        <h1 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-slate-950">{title}</h1>
        <p className="mx-auto mt-2 max-w-[270px] text-sm leading-6 text-slate-500">{description}</p>
      </section>
    </div>
  );
}
