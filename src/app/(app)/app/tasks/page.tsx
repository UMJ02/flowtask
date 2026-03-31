"use client";

import SearchUnified from "@/components/ui/search-unified";

export default function TasksPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Tareas</h1>
        <p className="text-sm text-slate-600">
          Vista editable por filas. Aquí ya no se muestra el flujo ni la pizarra.
        </p>
      </div>

      <SearchUnified />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid grid-cols-6 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          <div>Nombre</div>
          <div>Status</div>
          <div>Deadline</div>
          <div>Prioridad</div>
          <div>Cliente</div>
          <div className="text-right">Acción</div>
        </div>

        {[1, 2, 3].map((i) => (
          <div key={i} className="grid grid-cols-6 items-center gap-3 border-t border-slate-100 px-4 py-3 text-sm">
            <input defaultValue={`Tarea ${i}`} className="rounded-lg border border-slate-200 px-2 py-2" />
            <select className="rounded-lg border border-slate-200 px-2 py-2">
              <option>En progreso</option>
              <option>Pendiente</option>
              <option>Hecho</option>
            </select>
            <input type="date" className="rounded-lg border border-slate-200 px-2 py-2" />
            <select className="rounded-lg border border-slate-200 px-2 py-2">
              <option>Alta</option>
              <option>Media</option>
              <option>Baja</option>
            </select>
            <input defaultValue="Cliente" className="rounded-lg border border-slate-200 px-2 py-2" />
            <div className="text-right">
              <button className="rounded-lg bg-emerald-600 px-3 py-2 text-white" type="button">Guardar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
