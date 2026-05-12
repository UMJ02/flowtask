import { createClient } from "@/lib/supabase/server";

export async function getOrganizationMembers(organizationId?: string | null, canView = false) {
  if (!organizationId || !canView) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("organization_members").select("id,user_id,role,is_default,created_at,profiles!inner(id,full_name,email)").eq("organization_id", organizationId).order("created_at", { ascending: true });
  return (data ?? []).map((row: any) => { const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles; return { id: row.id as string, userId: row.user_id as string, role: row.role as "admin_global" | "manager" | "member" | "viewer", isDefault: !!row.is_default, fullName: (profile?.full_name as string | null | undefined) || "", email: (profile?.email as string | null | undefined) || "" }; });
}
