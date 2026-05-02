import { BrandLoader } from '@/components/ui/brand-loader';

export function AuthPremiumLoader({
  title = 'Preparando tu espacio…',
  description = 'Estamos cargando Flowtask.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(22,199,132,0.12),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#ffffff_52%,#eef7f3_100%)] px-5 py-10">
      <section
        className="w-full max-w-[420px] rounded-[30px] border border-slate-200/80 bg-white/90 p-6 text-center shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl"
        aria-busy="true"
        aria-live="polite"
        role="status"
      >
        <BrandLoader className="mx-auto" label="Flowtask" />
        <div className="mx-auto mt-5 h-[3px] w-full max-w-[220px] overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-1/2 animate-[auth-loader-slide_1.15s_ease-in-out_infinite] rounded-full bg-[#16C784]" />
        </div>
        <h1 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-slate-950">{title}</h1>
        <p className="mx-auto mt-2 max-w-[280px] text-sm leading-6 text-slate-500">{description}</p>
      </section>
    </div>
  );
}
