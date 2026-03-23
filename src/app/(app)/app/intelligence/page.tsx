export default function IntelligencePage() {
  return (
    <main className="p-6 space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Intelligence</p>
        <h1 className="text-3xl font-semibold tracking-tight">Qué atender</h1>
        <p className="text-sm text-muted-foreground">Menos ruido, más claridad.</p>
      </header>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border p-4">
          <h2 className="font-medium">Estado del espacio</h2>
          <p className="mt-2 text-sm text-muted-foreground">Falta cerrar automatización y permisos finos.</p>
        </article>
        <article className="rounded-2xl border p-4">
          <h2 className="font-medium">Riesgos</h2>
          <p className="mt-2 text-sm text-muted-foreground">Hay tareas vencidas y un proyecto con presión alta.</p>
        </article>
        <article className="rounded-2xl border p-4">
          <h2 className="font-medium">Plan</h2>
          <p className="mt-2 text-sm text-muted-foreground">La próxima semana tiene carga media.</p>
        </article>
      </section>
    </main>
  );
}
