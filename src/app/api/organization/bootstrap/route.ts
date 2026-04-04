import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const rawName = typeof body?.name === "string" ? body.name.trim() : "";
  const rawSlug = typeof body?.slug === "string" ? body.slug.trim() : "";

  if (rawName.length < 3) {
    return NextResponse.json({ error: "El nombre de la organización debe tener al menos 3 caracteres." }, { status: 400 });
  }

  const slug = normalizeSlug(rawSlug || rawName);
  if (!slug) {
    return NextResponse.json({ error: "No fue posible generar un slug válido para la organización." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("bootstrap_organization_workspace", {
    p_name: rawName,
    p_slug: slug,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, organizationId: data, redirectTo: "/app/organization" });
}
