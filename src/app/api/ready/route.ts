import { NextResponse } from "next/server";

export async function GET() {
  const ready = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return NextResponse.json(
    {
      ok: ready,
      service: "flowtask-ready",
      timestamp: new Date().toISOString(),
    },
    {
      status: ready ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
