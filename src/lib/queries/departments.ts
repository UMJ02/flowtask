import { createClient } from "@/lib/supabase/client";

type DepartmentCatalogRow = {
  id: number | string;
  code: string | null;
  name: string | null;
  organization_id?: string | null;
  account_owner_id?: string | null;
};

type RankedDepartment = {
  row: DepartmentCatalogRow;
  rank: number;
};

function normalizeCatalogValue(value: string) {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function rankDepartment(row: DepartmentCatalogRow, userId: string, organizationId?: string | null) {
  if (organizationId && row.organization_id === organizationId) return 0;
  if (!organizationId && !row.organization_id && row.account_owner_id === userId) return 0;
  if (!row.organization_id && !row.account_owner_id) return 1;
  return 9;
}

export async function getDepartmentIdByCode(code?: string | null) {
  if (!code) return null;
  const supabase = createClient();
  const normalized = normalizeCatalogValue(code);
  const { data, error } = await supabase.from("departments").select("id,code,name").limit(300);
  if (error) throw error;

  const match = ((data ?? []) as DepartmentCatalogRow[]).find((row) => {
    return normalizeCatalogValue(String(row.code ?? "")) === normalized || normalizeCatalogValue(String(row.name ?? "")) === normalized;
  });

  return typeof match?.id === "number" ? match.id : match?.id ? Number(match.id) : null;
}

export async function getWorkspaceDepartmentIdByCode(params: {
  code?: string | null;
  userId: string;
  organizationId?: string | null;
}) {
  const normalized = params.code?.trim();
  if (!normalized) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("departments")
    .select("id,code,name,organization_id,account_owner_id")
    .limit(300);
  if (error) throw error;

  const target = normalizeCatalogValue(normalized);
  const match = ((data ?? []) as DepartmentCatalogRow[])
    .filter((row) => normalizeCatalogValue(String(row.code ?? "")) === target || normalizeCatalogValue(String(row.name ?? "")) === target || String(row.id) === normalized)
    .map<RankedDepartment>((row) => ({ row, rank: rankDepartment(row, params.userId, params.organizationId) }))
    .filter((item) => item.rank < 2)
    .sort((a, b) => a.rank - b.rank)[0]?.row;

  return typeof match?.id === "number" ? match.id : match?.id ? Number(match.id) : null;
}
