import { LoadingState } from '@/components/ui/loading-state';

export default function IntelligenceLoading() {
  return (
    <LoadingState
      title="Preparando inteligencia operativa…"
      description="Estamos reuniendo indicadores, prioridades y señales del workspace para que entren limpias a tu panel."
      cards={4}
    />
  );
}
