"use client";

import SearchUnified from "@/components/ui/search-unified";

export default function ProjectsPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-semibold">Proyectos</h1>
      <SearchUnified />

      <div className="overflow-hidden rounded-xl border">
        <div className="grid grid-cols-6 bg-gray-100 px-4 py-2 text-sm font-medium">
          <div>Nombre</div>
          <div>Status</div>
          <div>Deadline</div>
          <div>Área</div>
          <div>Cliente</div>
          <div></div>
        </div>

        {[1, 2].map((i) => (
          <div key={i} className="grid grid-cols-6 border-t px-4 py-2 text-sm">
            <input defaultValue="Proyecto" />
            <select><option>Activo</option></select>
            <input type="date" />
            <input defaultValue="Marketing" />
            <input defaultValue="Cliente" />
            <button className="text-green-600" type="button">Guardar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
