import { getWorkspaceContext } from '@/lib/queries/workspace';

export async function getDepartmentOptions() {
  const { supabase, user } = await getWorkspaceContext();
  if (!user) return [] as Array<{ id: number; code: string; name: string }>;

  const { data, error } = await supabase
    .from('departments')
    .select('id, code, name')
    .order('name', { ascending: true });

  if (error) {
    console.error('[getDepartmentOptions]', error.message);
    return [];
  }

  return (data ?? []).map((department: any) => ({
    id: Number(department.id),
    code: String(department.code ?? ''),
    name: String(department.name ?? ''),
  }));
}
