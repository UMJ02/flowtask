"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="bg-slate-50">
        <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 py-16">
          <div className="w-full rounded-[28px] bg-white p-8 text-center shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">FlowTask Runtime</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Algo falló en esta vista</h1>
            <p className="mt-3 text-sm text-slate-600">La app se mantuvo activa, pero esta pantalla tuvo un problema inesperado. Puedes reintentar sin perder la sesión.</p>
            <button onClick={reset} className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Reintentar
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
