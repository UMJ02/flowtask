"use client";

import { useState } from "react";

export default function SearchUnified() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          className="w-full rounded-xl border px-3 py-2"
          placeholder="Buscar..."
        />
        <button
          onClick={() => setOpen(!open)}
          className="rounded-xl border px-3"
          type="button"
        >
          ⚙
        </button>
        <button className="rounded-xl bg-green-600 px-4 text-white" type="button">
          Buscar
        </button>
      </div>

      {open && (
        <div className="grid grid-cols-3 gap-3 rounded-xl border p-3">
          <select><option>Status</option></select>
          <select><option>Área</option></select>
          <select><option>Fecha</option></select>
        </div>
      )}
    </div>
  );
}
