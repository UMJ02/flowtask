"use client";

import { useEffect } from "react";
import { WorkspaceRecoveryPanel } from "@/components/workspace-system/workspace-recovery-panel";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[workspace:error-boundary]", error);
  }, [error]);

  return (
    <main className="ft-ws-shell min-h-screen p-5 md:p-8">
      <WorkspaceRecoveryPanel
        reason="error"
        title="No se pudo cargar el Workspace"
        description="El workspace encontró un error recuperable. Podés reintentar, volver al Home del workspace o abrir el dashboard clásico sin perder el resto de la app."
        details={[
          error.message || "Error desconocido en la vista Workspace.",
          error.digest ? `Digest: ${error.digest}` : "Sin digest de Next disponible.",
          "Las rutas clásicas de FlowTask siguen disponibles como recuperación segura.",
        ]}
        onRetry={reset}
      />
    </main>
  );
}
