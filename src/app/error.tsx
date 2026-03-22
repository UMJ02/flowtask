"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';

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
          <div className="w-full">
            <ErrorState
              title="Algo falló en esta vista"
              description="La app se mantuvo activa, pero esta pantalla tuvo un problema inesperado. Puedes reintentar sin perder la sesión."
              action={
                <Button onClick={reset}>
                  Reintentar
                </Button>
              }
            />
          </div>
        </main>
      </body>
    </html>
  );
}
