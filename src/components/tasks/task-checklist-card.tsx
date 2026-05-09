"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity/log-client";
import { formatDate } from "@/lib/utils/dates";
import type { TaskChecklistItem } from "@/lib/queries/task-checklist";

type ChecklistItem = { id: string; title: string; done: boolean; dueDate?: string | null; updatedAt?: string | null; position: number; persisted: boolean };

function normalizeItems(items: TaskChecklistItem[] = []): ChecklistItem[] {
  return items.map((item, index) => ({ id: item.id, title: item.title, done: Boolean(item.done), dueDate: item.due_date ?? null, updatedAt: item.updated_at ?? null, position: item.position ?? index, persisted: true }));
}

export function TaskChecklistCard({ taskId, initialItems = [], canManage = true }: { taskId: string; initialItems?: TaskChecklistItem[]; canManage?: boolean }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<ChecklistItem[]>(() => normalizeItems(initialItems));
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startRefresh] = useTransition();
  const done = useMemo(() => items.filter((item) => item.done).length, [items]);
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  const toggle = async (id: string) => {
    if (!canManage) return;
    const target = items.find((item) => item.id === id);
    if (!target) return;
    const previous = items;
    const nextDone = !target.done;
    setItems((current) => current.map((item) => item.id === id ? { ...item, done: nextDone } : item));
    setBusyId(id);
    setError(null);
    const { error: updateError } = await supabase.from("task_checklist_items").update({ done: nextDone }).eq("id", id);
    setBusyId(null);
    if (updateError) { setItems(previous); setError(updateError.message); return; }
    await logActivity(supabase, { entityType: "task", entityId: taskId, action: nextDone ? "checklist_item_completed" : "checklist_item_reopened", metadata: { title: target.title, checklist_item_id: id } });
    startRefresh(() => router.refresh());
  };

  const addItem = async () => {
    if (!canManage) return;
    const title = draft.trim();
    if (!title) return;
    setError(null); setBusyId("new");
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) { setBusyId(null); setError("Sesión no válida."); return; }
    const position = items.length ? Math.max(...items.map((item) => item.position)) + 1 : 0;
    const optimisticId = `temp-${Date.now()}`;
    setItems((current) => [...current, { id: optimisticId, title, done: false, dueDate: null, updatedAt: null, position, persisted: false }]);
    setDraft("");
    const { data, error: insertError } = await supabase.from("task_checklist_items").insert({ task_id: taskId, owner_id: user.id, title, done: false, position }).select("id, due_date").single();
    setBusyId(null);
    if (insertError) { setItems((current) => current.filter((item) => item.id !== optimisticId)); setError(insertError.message); return; }
    setItems((current) => current.map((item) => item.id === optimisticId ? { ...item, id: data.id, dueDate: data.due_date ?? null, updatedAt: null, persisted: true } : item));
    await logActivity(supabase, { entityType: "task", entityId: taskId, action: "checklist_item_added", metadata: { title, checklist_item_id: data.id } });
    startRefresh(() => router.refresh());
  };

  const deleteItem = async (id: string) => {
    if (!canManage) return;
    const target = items.find((item) => item.id === id);
    if (!target || !window.confirm("¿Eliminar este punto del checklist?")) return;
    const previous = items;
    setItems((current) => current.filter((item) => item.id !== id));
    setBusyId(id); setError(null);
    const { error: deleteError } = await supabase.from("task_checklist_items").delete().eq("id", id);
    setBusyId(null);
    if (deleteError) { setItems(previous); setError(deleteError.message); return; }
    await logActivity(supabase, { entityType: "task", entityId: taskId, action: "checklist_item_deleted", metadata: { title: target.title, checklist_item_id: id } });
    startRefresh(() => router.refresh());
  };

  return (
    <section id="checklist" className="space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-base font-semibold text-[#0F172A]">Checklist</h2>
          <div className="flex min-w-[220px] overflow-hidden rounded-[14px] border border-[#E5EAF1] bg-white">
            <input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addItem(); } }} disabled={!canManage || busyId === "new"} placeholder="Nueva tarea..." className="h-10 min-w-0 flex-1 px-3 text-sm font-semibold outline-none placeholder:text-[#94A3B8] disabled:bg-slate-50" />
            <button type="button" onClick={addItem} disabled={!canManage || busyId === "new" || !draft.trim()} className="inline-flex h-10 items-center gap-2 border-l border-[#E5EAF1] px-3 text-sm font-semibold text-[#0F172A] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"><Plus className="h-4 w-4" /> {busyId === "new" ? "Guardando..." : "Agregar"}</button>
          </div>
        </div>
        <span className="text-sm font-bold text-[#64748B]">{done}/{items.length} completadas ({pct}%)</span>
      </div>
      <div className="mt-5 h-2 rounded-full bg-[#EEF2F7]"><div className="h-2 rounded-full bg-[#16C784] transition-all" style={{ width: `${pct}%` }} /></div>
      {error ? <p className="mt-3 rounded-[14px] bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{error}</p> : null}
      <div className="mt-5 divide-y divide-[#E5EAF1]">
        {items.length ? items.map((item) => (
          <div key={item.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 py-3 text-sm transition hover:bg-[#F8FAFC] sm:px-2">
            <button type="button" onClick={() => toggle(item.id)} disabled={!canManage || busyId === item.id || !item.persisted} className={`grid h-5 w-5 place-items-center rounded-[6px] border text-xs font-semibold disabled:opacity-60 ${item.done ? "border-[#16C784] bg-[#16C784] text-white" : "border-[#CBD5E1] bg-white text-transparent"}`} aria-label={item.done ? "Marcar pendiente" : "Marcar completada"}>✓</button>
            <span className={`min-w-0 font-semibold ${item.done ? "text-[#64748B] line-through" : "text-[#334155]"}`}>{item.title}</span>
            <span className="hidden text-xs font-bold text-[#64748B] sm:inline">{item.done ? (item.updatedAt ? `Completada ${formatDate(item.updatedAt)}` : "Completada") : "Pendiente"}</span>
            <button type="button" onClick={() => deleteItem(item.id)} disabled={!canManage || busyId === item.id || !item.persisted} className="grid h-8 w-8 place-items-center rounded-[10px] text-[#94A3B8] transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50" aria-label="Eliminar punto del checklist"><Trash2 className="h-4 w-4" /></button>
            <GripVertical className="h-4 w-4 text-[#94A3B8]" aria-hidden />
          </div>
        )) : <p className="rounded-[16px] bg-[#F8FAFC] p-4 text-sm font-semibold text-[#64748B]">Todavía no hay checklist. Agregá el primer punto para darle seguimiento real a esta tarea.</p>}
      </div>
    </section>
  );
}
