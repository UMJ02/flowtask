import { LoadingState } from '@/components/ui/loading-state';

export default function AppLoading() {
  return (
    <LoadingState
      title="Preparando tu espacio…"
      description="Cargando tarjetas, listas y accesos rápidos para que todo aparezca de una forma más fluida."
      cards={3}
    />
  );
}
