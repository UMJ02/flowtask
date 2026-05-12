import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function normalizeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const subject = normalizeString(body?.subject);
    const message = normalizeString(body?.message);
    const organizationId = normalizeString(body?.organizationId) || null;
    const route = normalizeString(body?.route) || null;
    const priority = ["low", "normal", "high", "critical"].includes(body?.priority) ? body.priority : "normal";
    const source = ["in_app", "email", "whatsapp", "phone"].includes(body?.source) ? body.source : "in_app";

    if (!subject || !message) {
      return NextResponse.json({ ok: false, error: "subject_and_message_required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const subjectWithRoute = route ? `${subject} · ${route}` : subject;
    const { data, error } = await supabase
      .from("internal_support_tickets")
      .insert({
        organization_id: organizationId,
        requester_user_id: user.id,
        subject: subjectWithRoute.slice(0, 180),
        status: "open",
        priority,
        source,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      organization_id: organizationId,
      entity_type: "support_ticket",
      entity_id: data.id,
      action: "support_ticket_created",
      metadata: {
        subject,
        route,
        message_preview: message.slice(0, 280),
        source,
        priority,
      },
    });

    await supabase.from("usage_events").insert({
      user_id: user.id,
      organization_id: organizationId,
      event_name: "support_ticket_created",
      route,
      metadata: {
        ticket_id: data.id,
        priority,
        source,
      },
    });

    return NextResponse.json({ ok: true, ticketId: data.id }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "unexpected_error" }, { status: 500 });
  }
}
