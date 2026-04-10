import { LoadingState } from '@/components/ui/loading-state';

export default function PublicLoading() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eefaf5_0%,#f8fafc_38%,#eef5f2_100%)] px-4 py-10">
      <div className="container-page">
        <LoadingState
          title="Abriendo FlowTask…"
          description="Estamos preparando la transición para que entres con una sensación más fluida, clara y ligera."
          cards={2}
        />
      </div>
    </main>
  );
}
