"use client";

export function QuickActionsMenu() {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="rounded-xl border px-4 py-2 text-sm font-medium">Nueva tarea</button>
      <button className="rounded-xl border px-4 py-2 text-sm font-medium">Nuevo proyecto</button>
      <button className="rounded-xl border px-4 py-2 text-sm font-medium">Asignar</button>
      <button className="rounded-xl border px-4 py-2 text-sm font-medium">Prioridad</button>
    </div>
  );
}
