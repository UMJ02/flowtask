import { createClient } from "@/lib/supabase/client";

type DepartmentCatalogRow = {
  id: number;
  code: string | null;
  name: string | null;
  organization_id?: string | null;
  account_owner_id?: string | null;
};

type RankedDepartmentRow = {
  row: DepartmentCatalogRow;
  rank: number;
};

function normalizeCatalogValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getScopeRank(row: DepartmentCatalogRow, userId?: string | null, organizationId?: string | null): number {
  if (organizationId && row.organization_id === organizationId) return 0;
  if (!organizationId && !row.organization_id && row.account_owner_id === userId) return 0;
  if (!row.organization_id && !row.account_owner_id) return 1;
  return 9;
}

export async function getDepartmentIdByCode(code?: string | null): Promise<number | null> {
  if (!code) return null;

  const supabase = createClient();
  const target = normalizeCatalogValue(code);
  const { data, error } = await supabase
    .from("departments")
    .select("id,code,name")
    .limit(300);

  if (error) throw error;

  const rows = (data ?? []) as DepartmentCatalogRow[];
  const match = rows.find((row: DepartmentCatalogRow) => {
    return normalizeCatalogValue(String(row.code ?? "")) === target || normalizeCatalogValue(String(row.name ?? "")) === target;
  });

  return match?.id ?? null;
}

export async function getWorkspaceDepartmentIdByCode(params: {
  code?: string | null;
  userId: string;
  organizationId?: string | null;
}): Promise<number | null> {
  const normalized = params.code?.trim();
  if (!normalized) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("departments")
    .select("id,code,name,organization_id,account_owner_id")
    .limit(300);

  if (error) throw error;

  const target = normalizeCatalogValue(normalized);
  const rows = (data ?? []) as DepartmentCatalogRow[];

  const match = rows
    .filter((row: DepartmentCatalogRow) => {
      return normalizeCatalogValue(String(row.code ?? "")) === target || normalizeCatalogValue(String(row.name ?? "")) === target;
    })
    .map((row: DepartmentCatalogRow): RankedDepartmentRow => ({
      row,
      rank: getScopeRank(row, params.userId, params.organizationId),
    }))
    .filter((item: RankedDepartmentRow) => item.rank < 2)
    .sort((a: RankedDepartmentRow, b: RankedDepartmentRow) => a.rank - b.rank)[0]?.row;

  return match?.id ?? null;
}
