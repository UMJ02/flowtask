import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deriveOrganizationAccess, getActiveMembership } from "@/lib/security/organization-access";

export async function GET() {
  const { supabase, user, membership } = await getActiveMembership();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const access = deriveOrganizationAccess(membership?.role ?? null);
  if (!membership?.organizationId) {
    return NextResponse.json({ roles: [], permissions: [] });
  }

  if (!access.canManageRoles) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [rolesRes, permissionsRes] = await Promise.all([
    supabase.from("organization_role_templates").select("id,name,description,is_system").eq("organization_id", membership.organizationId).order("name"),
    supabase.from("organization_permission_definitions").select("key,label,description,category").order("category").order("label"),
  ]);

  return NextResponse.json({
    roles: rolesRes.data ?? [],
    permissions: permissionsRes.data ?? [],
  });
}
