import { memo } from 'react';
import { NativeDotsLoader } from '@/components/ui/native-dots-loader';

function AuthPremiumLoaderComponent({
  title = 'Cargando Flowtask…',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex min-h-dvh w-screen items-center justify-center overflow-hidden bg-white/86 px-5 py-5 backdrop-blur-[22px]"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_22%,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_52%_74%,rgba(16,185,129,0.09),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(248,250,252,0.88)_48%,rgba(240,253,250,0.76)_100%)]"
        aria-hidden="true"
      />

      <section className="relative z-10 flex w-full max-w-[320px] flex-col items-center justify-center text-center">
        <NativeDotsLoader />
        <h1 className="mt-8 text-[1rem] font-semibold tracking-[-0.02em] text-slate-950 sm:text-base">{title}</h1>
      </section>
    </div>
  );
}

export const AuthPremiumLoader = memo(AuthPremiumLoaderComponent);
