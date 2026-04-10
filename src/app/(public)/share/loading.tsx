import { LoadingState } from '@/components/ui/loading-state';

export default function SharedLandingLoading() {
  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="mx-auto max-w-[1080px]">
        <LoadingState
          title="Abriendo reporte compartido…"
          description="Estamos armando una vista limpia para que el reporte cargue rápido y sin ruido visual."
          cards={2}
        />
      </div>
    </main>
  );
}
