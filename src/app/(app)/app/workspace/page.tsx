import { InteractiveBoard } from "@/components/workspace/interactive-board";
import { QuickActionsMenu } from "@/components/workspace/quick-actions-menu";

export default function WorkspacePage() {
  return (
    <main className="p-6 space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Workspace</p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Tu tablero</h1>
            <p className="text-sm text-muted-foreground">
              Entra, organiza y actúa rápido.
            </p>
          </div>
          <QuickActionsMenu />
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border p-4">
          <p className="text-sm text-muted-foreground">Hoy</p>
          <p className="mt-2 text-2xl font-semibold">4 tareas</p>
          <p className="mt-1 text-sm text-muted-foreground">2 requieren atención.</p>
        </article>
        <article className="rounded-2xl border p-4">
          <p className="text-sm text-muted-foreground">Proyectos activos</p>
          <p className="mt-2 text-2xl font-semibold">6</p>
          <p className="mt-1 text-sm text-muted-foreground">1 con bloqueo.</p>
        </article>
        <article className="rounded-2xl border p-4">
          <p className="text-sm text-muted-foreground">Bloqueos</p>
          <p className="mt-2 text-2xl font-semibold">3</p>
          <p className="mt-1 text-sm text-muted-foreground">Revísalos primero.</p>
        </article>
        <article className="rounded-2xl border p-4">
          <p className="text-sm text-muted-foreground">Foco semanal</p>
          <p className="mt-2 text-2xl font-semibold">12</p>
          <p className="mt-1 text-sm text-muted-foreground">Items en seguimiento.</p>
        </article>
      </section>

      <InteractiveBoard />
    </main>
  );
}
