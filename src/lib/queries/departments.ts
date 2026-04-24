import { createClient } from "@/lib/supabase/client";
function normalizeCatalogValue(value: string) { return value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
export async function getDepartmentIdByCode(code?: string | null) { if (!code) return null; const supabase = createClient(); const normalized = normalizeCatalogValue(code); const { data, error } = await supabase.from("departments").select("id,code,name").limit(300); if (error) throw error; const match = (data ?? []).find((row: any) => normalizeCatalogValue(String(row.code ?? '')) === normalized || normalizeCatalogValue(String(row.name ?? '')) === normalized); return match?.id ?? null; }
export async function getWorkspaceDepartmentIdByCode(params: { code?: string | null; userId: string; organizationId?: string | null; }) {
  const normalized = params.code?.trim(); if (!normalized) return null;
  const supabase = createClient(); const { data, error } = await supabase.from("departments").select("id,code,name,organization_id,account_owner_id").limit(300); if (error) throw error;
  const target = normalizeCatalogValue(normalized);
  const match = (data ?? []).filter((row: any) => normalizeCatalogValue(String(row.code ?? '')) === target || normalizeCatalogValue(String(row.name ?? '')) === target).map((row: any) => { let rank = 9; if (params.organizationId && row.organization_id === params.organizationId) rank = 0; else if (!params.organizationId && !row.organization_id && row.account_owner_id === params.userId) rank = 0; else if (!row.organization_id && !row.account_owner_id) rank = 1; return { row, rank }; }).filter((item) => item.rank < 2).sort((a, b) => a.rank - b.rank)[0]?.row;
  return (match?.id as number | null | undefined) ?? null;
}
