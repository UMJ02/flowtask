import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const organizationId = body?.organizationId as string | undefined;
  const email = body?.email as string | undefined;
  const role = body?.role as string | undefined;

  if (!organizationId || !email || !role) {
    return NextResponse.json({ error: "Faltan datos de invitación." }, { status: 400 });
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || !["admin_global", "manager"].includes(membership.role)) {
    return NextResponse.json({ error: "No tienes permiso para invitar miembros." }, { status: 403 });
  }

  const token = randomUUID();
  const { error } = await supabase.from("organization_invites").insert({
    organization_id: organizationId,
    email,
    role,
    token,
    created_by: user.id,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, token });
}
