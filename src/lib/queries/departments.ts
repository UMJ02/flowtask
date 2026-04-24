import { createClient } from "@/lib/supabase/client";

export async function getDepartmentIdByCode(code?: string | null) {
  if (!code) return null;
  const supabase = createClient();
  const { data, error } = await supabase.from("departments").select("id").eq("code", code).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export async function getWorkspaceDepartmentIdByCode(params: {
  code?: string | null;
  userId: string;
  organizationId?: string | null;
}) {
  const normalized = params.code?.trim();
  if (!normalized) return null;

  const supabase = createClient();
  let query = supabase.from("departments").select("id,organization_id,account_owner_id").eq("code", normalized).limit(20);
  const { data, error } = await query;
  if (error) throw error;

  const scoped = (data ?? []).find((row: any) => {
    if (params.organizationId) return row.organization_id === params.organizationId;
    return !row.organization_id && row.account_owner_id === params.userId;
  });

  return (scoped?.id as number | null | undefined) ?? null;
}
