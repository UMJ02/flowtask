import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const now = new Date();
  const { error } = await supabase.from("notifications").insert({
    user_id: user.id,
    title: "Notificación de prueba",
    body: `Se generó una alerta de prueba a las ${now.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" })}.`,
    kind: "info",
    entity_type: "project",
    entity_id: null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
