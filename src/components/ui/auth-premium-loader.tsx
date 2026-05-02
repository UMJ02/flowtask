export function AuthPremiumLoader({
  title = 'Cargando Flowtask…',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex min-h-dvh w-screen items-center justify-center overflow-hidden bg-white/84 px-5 py-8 backdrop-blur-[20px]"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_22%,rgba(22,199,132,0.14),transparent_34%),radial-gradient(circle_at_54%_76%,rgba(15,23,42,0.08),transparent_42%),linear-gradient(180deg,rgba(248,250,252,0.78)_0%,rgba(255,255,255,0.92)_48%,rgba(238,247,243,0.80)_100%)]"
        aria-hidden
      />

      <section className="relative z-10 flex w-full max-w-[320px] flex-col items-center justify-center text-center">
        <video
          className="h-[150px] w-[150px] object-contain drop-shadow-[0_24px_42px_rgba(15,23,42,0.10)] sm:h-[170px] sm:w-[170px]"
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src="/animations/flowtask-loading.mov" type="video/mov" />
          <source src="/animations/flowtask-loading2.mp4" type="video/mp4" />
        </video>
        <h1 className="mt-2 text-[1rem] font-semibold tracking-[-0.02em] text-slate-950 sm:text-lg">{title}</h1>
      </section>
    </div>
  );
}
