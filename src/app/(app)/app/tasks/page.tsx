"use client";

import SearchUnified from "@/components/ui/search-unified";

export default function TasksPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-semibold">Tareas</h1>
      <SearchUnified />

      <div className="overflow-hidden rounded-xl border">
        <div className="grid grid-cols-6 bg-gray-100 px-4 py-2 text-sm font-medium">
          <div>Nombre</div>
          <div>Status</div>
          <div>Deadline</div>
          <div>Prioridad</div>
          <div>Cliente</div>
          <div></div>
        </div>

        {[1, 2, 3].map((i) => (
          <div key={i} className="grid grid-cols-6 border-t px-4 py-2 text-sm">
            <input defaultValue="Tarea" />
            <select><option>En progreso</option></select>
            <input type="date" />
            <select><option>Alta</option></select>
            <input defaultValue="Cliente" />
            <button className="text-green-600" type="button">Guardar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
