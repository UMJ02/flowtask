import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .limit(1)
    .single();

  if (!membership?.organization_id) {
    return NextResponse.json({ roles: [], permissions: [] });
  }

  const [rolesRes, permissionsRes] = await Promise.all([
    supabase.from("organization_role_templates").select("id,name,description,is_system").eq("organization_id", membership.organization_id).order("name"),
    supabase.from("organization_permission_definitions").select("key,label,description,category").order("category").order("label"),
  ]);

  return NextResponse.json({
    roles: rolesRes.data ?? [],
    permissions: permissionsRes.data ?? [],
  });
}
