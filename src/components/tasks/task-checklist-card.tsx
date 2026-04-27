"use client";

import { useMemo, useState } from "react";
import { GripVertical, Plus } from "lucide-react";

type ChecklistItem = {
  id: string;
  title: string;
  done: boolean;
  dueDate: string;
};

const defaultItems: ChecklistItem[] = [
  { id: "check-1", title: "Reunión inicial con cliente", done: true, dueDate: "08/04/2026" },
  { id: "check-2", title: "Definir productos y categorías", done: true, dueDate: "09/04/2026" },
  { id: "check-3", title: "Fotografía de productos", done: true, dueDate: "12/04/2026" },
  { id: "check-4", title: "Diseño de catálogo", done: true, dueDate: "15/04/2026" },
  { id: "check-5", title: "Revisión y aprobación final", done: false, dueDate: "20/04/2026" },
  { id: "check-6", title: "Correcciones finales", done: false, dueDate: "22/04/2026" },
  { id: "check-7", title: "Entrega de archivos finales", done: false, dueDate: "25/04/2026" },
  { id: "check-8", title: "Publicación y distribución", done: false, dueDate: "30/04/2026" },
];

export function TaskChecklistCard() {
  const [items, setItems] = useState<ChecklistItem[]>(defaultItems);
  const [draft, setDraft] = useState("");
  const done = useMemo(() => items.filter((item) => item.done).length, [items]);
  const pct = Math.round((done / Math.max(items.length, 1)) * 100);

  const toggle = (id: string) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, done: !item.done } : item));
  };

  const addItem = () => {
    const title = draft.trim();
    if (!title) return;
    setItems((current) => [...current, { id: `check-${Date.now()}`, title, done: false, dueDate: "Sin fecha" }]);
    setDraft("");
  };

  return (
    <section id="checklist" className="rounded-[24px] border border-[#E5EAF1] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-black text-[#0F172A]">Checklist</h2>
          <div className="flex min-w-[220px] overflow-hidden rounded-[14px] border border-[#E5EAF1] bg-white">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addItem();
                }
              }}
              placeholder="Nueva tarea..."
              className="h-10 min-w-0 flex-1 px-3 text-sm font-semibold outline-none placeholder:text-[#94A3B8]"
            />
            <button type="button" onClick={addItem} className="inline-flex h-10 items-center gap-2 border-l border-[#E5EAF1] px-3 text-sm font-black text-[#0F172A] transition hover:bg-[#F8FAFC]">
              <Plus className="h-4 w-4" /> Agregar tarea
            </button>
          </div>
        </div>
        <span className="text-sm font-bold text-[#64748B]">{done}/{items.length} completadas ({pct}%)</span>
      </div>

      <div className="mt-5 h-2 rounded-full bg-[#EEF2F7]">
        <div className="h-2 rounded-full bg-[#16C784] transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-5 divide-y divide-[#E5EAF1]">
        {items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 py-3 text-sm transition hover:bg-[#F8FAFC] sm:px-2">
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className={`grid h-5 w-5 place-items-center rounded-[6px] border text-xs font-black ${item.done ? "border-[#16C784] bg-[#16C784] text-white" : "border-[#CBD5E1] bg-white text-transparent"}`}
              aria-label={item.done ? "Marcar pendiente" : "Marcar completada"}
            >
              ✓
            </button>
            <span className={`min-w-0 font-semibold ${item.done ? "text-[#64748B] line-through" : "text-[#334155]"}`}>{item.title}</span>
            <span className="hidden text-xs font-bold text-[#64748B] sm:inline">{item.dueDate}</span>
            <GripVertical className="h-4 w-4 text-[#94A3B8]" aria-hidden />
          </div>
        ))}
      </div>
    </section>
  );
}
