import { LoadingState } from '@/components/ui/loading-state';

export default function SharedLandingLoading() {
  return (
    <main className="min-h-screen bg-white">
      <LoadingState
        title="Abriendo reporte compartido…"
        description="Estamos armando una vista limpia para que el reporte cargue rápido y sin ruido visual."
      />
    </main>
  );
}
