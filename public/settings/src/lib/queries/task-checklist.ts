import { createClient } from "@/lib/supabase/server";
export type TaskChecklistItem = { id: string; task_id: string; owner_id: string; title: string; done: boolean; due_date?: string | null; position: number; created_at?: string | null; updated_at?: string | null; };
export async function getTaskChecklistItems(taskId: string): Promise<TaskChecklistItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("task_checklist_items").select("id, task_id, owner_id, title, done, due_date, position, created_at, updated_at").eq("task_id", taskId).order("position", { ascending: true }).order("created_at", { ascending: true });
  if (error) { console.error("[getTaskChecklistItems]", error.message); return []; }
  return (data ?? []) as TaskChecklistItem[];
}
