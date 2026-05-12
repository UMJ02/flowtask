import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function normalizeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const eventName = normalizeString(body?.eventName);
    if (!eventName) {
      return NextResponse.json({ ok: false, error: "event_name_required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const payload = {
      user_id: user.id,
      organization_id: normalizeString(body?.organizationId) || null,
      event_name: eventName.slice(0, 80),
      route: normalizeString(body?.route) || null,
      metadata: body?.metadata && typeof body.metadata === "object" ? body.metadata : {},
    };

    const { error } = await supabase.from("usage_events").insert(payload);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "unexpected_error" }, { status: 500 });
  }
}
