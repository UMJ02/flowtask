import { NextResponse } from "next/server";

export async function GET() {
  const ready = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return NextResponse.json(
    {
      status: ready ? "ok" : "degraded",
      service: "flowtask",
      version: "53.1.0-security-access-foundation",
      timestamp: new Date().toISOString(),
    },
    {
      status: ready ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
