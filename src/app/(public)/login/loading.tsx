import { LoadingState } from '@/components/ui/loading-state';

export default function LoginLoading() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ecfdf5_0%,#f8fafc_38%,#eef5f2_100%)]">
      <LoadingState
        title="Preparando acceso seguro…"
        description="Validamos el acceso y dejamos el login listo para entrar sin interrupciones."
      />
    </main>
  );
}
