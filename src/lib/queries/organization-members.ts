import { createClient } from "@/lib/supabase/server";
import type { OrganizationMemberSummary } from "@/types/organization";

export async function getOrganizationMembers(organizationId?: string | null, canView = false): Promise<OrganizationMemberSummary[]> {
  if (!organizationId || !canView) return [];
  const supabase = await createClient();

  const [{ data: membersData }, { data: organizationData }] = await Promise.all([
    supabase
      .from("organization_members")
      .select("id,user_id,role,is_default,created_at,profiles!inner(id,full_name,email)")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true }),
    supabase
      .from("organizations")
      .select("owner_id")
      .eq("id", organizationId)
      .maybeSingle(),
  ]);

  const ownerId = (organizationData?.owner_id as string | null | undefined) ?? null;

  return (membersData ?? []).map((row: any) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const userId = row.user_id as string;
    return {
      id: row.id as string,
      userId,
      role: row.role as OrganizationMemberSummary["role"],
      isDefault: !!row.is_default,
      isOwner: !!ownerId && ownerId === userId,
      fullName: (profile?.full_name as string | null | undefined) || "",
      email: (profile?.email as string | null | undefined) || "",
    };
  });
}
