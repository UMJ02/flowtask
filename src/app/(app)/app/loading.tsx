import { LoadingState } from '@/components/ui/loading-state';

export default function AppLoading() {
  return (
    <LoadingState
      title="Preparando la vista…"
      description="Estamos acomodando el contenido para que la navegación interna se vea clara y sin saltos visuales."
      cards={3}
    />
  );
}
