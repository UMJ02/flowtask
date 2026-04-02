import { NextResponse } from "next/server";
import { APP_RELEASE_STAGE, APP_VERSION } from "@/lib/release/version";

export const dynamic = "force-dynamic";

export async function GET() {
  const ready = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return NextResponse.json(
    {
      ok: ready,
      service: "flowtask-ready",
      version: APP_VERSION,
      stage: APP_RELEASE_STAGE,
      timestamp: new Date().toISOString(),
    },
    {
      status: ready ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-FlowTask-Version": APP_VERSION,
        "X-FlowTask-Stage": APP_RELEASE_STAGE,
      },
    },
  );
}
