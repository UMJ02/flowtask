import type { SupabaseClient } from '@supabase/supabase-js';

export type SafeDeleteResult = {
  ok: boolean;
  taskId: string;
  fallback?: boolean;
  error?: string;
};

function isMissingRpc(error?: { code?: string; message?: string } | null) {
  const normalized = `${error?.code ?? ''} ${error?.message ?? ''}`.toLowerCase();
  return (
    error?.code === '42883' ||
    error?.code === 'PGRST202' ||
    normalized.includes('schema cache') ||
    normalized.includes('could not find the function') ||
    (normalized.includes('function') && normalized.includes('does not exist'))
  );
}

export async function safeDeleteTaskClient(supabase: SupabaseClient, taskId: string): Promise<SafeDeleteResult> {
  const { data, error } = await supabase.rpc('safe_delete_task', { p_task_id: taskId });

  if (!error) {
    const result = data as SafeDeleteResult | null;
    if (result?.ok === false) return result;
    return { ok: true, taskId, ...(result ?? {}) };
  }

  if (!isMissingRpc(error)) {
    return { ok: false, taskId, error: error.message };
  }

  // Fallback keeps old deployments usable until migration 0052 is applied.
  // v58.24.9.7 still recommends applying the migration for true soft delete.
  const { data: deletedRows, error: deleteError } = await supabase.from('tasks').delete().eq('id', taskId).select('id');

  if (deleteError || !deletedRows || deletedRows.length === 0) {
    return { ok: false, taskId, fallback: true, error: deleteError?.message ?? 'No se pudo confirmar la eliminación de la tarea.' };
  }

  return { ok: true, taskId, fallback: true };
}

export async function safeDeleteTasksClient(supabase: SupabaseClient, taskIds: string[]) {
  const results = [];
  for (const taskId of taskIds) {
    // Sequential deletes are intentional: each row can respect its own RLS/RPC result.
    // This also lets the UI report partial failures later if needed.
    // eslint-disable-next-line no-await-in-loop
    results.push(await safeDeleteTaskClient(supabase, taskId));
  }
  return results;
}
