import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function normalizeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const message = normalizeString(body?.message);
    if (!message) {
      return NextResponse.json({ ok: false, error: "message_required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const payload = {
      user_id: user.id,
      organization_id: normalizeString(body?.organizationId) || null,
      level: ["info", "warning", "error", "critical"].includes(body?.level) ? body.level : "error",
      source: ["frontend", "backend", "api", "job"].includes(body?.source) ? body.source : "frontend",
      route: normalizeString(body?.route) || null,
      message: message.slice(0, 500),
      details: body?.details && typeof body.details === "object" ? body.details : {},
    };

    const { error } = await supabase.from("error_logs").insert(payload);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "unexpected_error" }, { status: 500 });
  }
}
