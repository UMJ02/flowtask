import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { deriveOrganizationAccess } from "@/lib/security/organization-access";

const allowedRoles = ["manager", "member", "viewer"] as const;

type AllowedInviteRole = (typeof allowedRoles)[number];

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const organizationId = body?.organizationId as string | undefined;
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
  const role = body?.role as AllowedInviteRole | undefined;

  if (!organizationId || !email || !role) {
    return NextResponse.json({ error: "Faltan datos de invitación." }, { status: 400 });
  }

  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: "Rol inválido para invitación." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .maybeSingle();

  const access = deriveOrganizationAccess((membership?.role as any) ?? null);
  if (!access.canManageInvites) {
    return NextResponse.json({ error: "No tienes permiso para invitar miembros." }, { status: 403 });
  }

  if (membership?.role === "manager" && role === "manager") {
    return NextResponse.json({ error: "Un manager solo puede invitar miembros o visualizadores." }, { status: 403 });
  }

  const { data: existingInvite } = await supabase
    .from("organization_invites")
    .select("id,status")
    .eq("organization_id", organizationId)
    .eq("email", email)
    .eq("status", "pending")
    .maybeSingle();

  if (existingInvite?.id) {
    return NextResponse.json({ error: "Ya existe una invitación pendiente para ese correo." }, { status: 409 });
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
