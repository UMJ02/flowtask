import { LottieLoader } from '@/components/ui/lottie-loader';

export function LoadingState({
  title = 'Preparando tu espacio…',
  description = 'Estamos acomodando la vista para que todo aparezca claro, ordenado y sin saltos visuales.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10 animate-fade-in">
      <div className="flex w-full max-w-[420px] flex-col items-center justify-center text-center">
        <LottieLoader size={260} className="-mb-2" />
        <div className="mt-1 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Cargando vista</p>
          <h2 className="text-[1.2rem] font-bold leading-tight text-slate-900 md:text-[1.35rem]">{title}</h2>
          <p className="text-sm leading-6 text-slate-600 md:text-[15px]">{description}</p>
        </div>
      </div>
    </div>
  );
}
