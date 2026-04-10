import { LoadingState } from '@/components/ui/loading-state';

export default function LoginLoading() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ecfdf5_0%,#f8fafc_38%,#eef5f2_100%)] px-4 py-10">
      <div className="container-page">
        <LoadingState
          title="Preparando acceso seguro…"
          description="Validamos el acceso y dejamos el login listo para entrar sin interrupciones."
          cards={2}
        />
      </div>
    </main>
  );
}
