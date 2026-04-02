import { NextResponse } from "next/server";
import { APP_VERSION } from "@/lib/release/version";

export const dynamic = "force-dynamic";

export async function GET() {
  const ready = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return NextResponse.json(
    {
      ok: ready,
      service: "flowtask",
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
    },
    {
      status: ready ? 200 : 503,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    },
  );
}
