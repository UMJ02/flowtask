import { NextResponse } from "next/server";
import { APP_RELEASE_STAGE, APP_VERSION } from "@/lib/release/version";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    appUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL || process.env.FLOWTASK_BASE_URL),
  };
  const ready = checks.supabaseUrl && checks.supabaseAnonKey;

  return NextResponse.json(
    {
      ok: ready,
      service: "flowtask-ready",
      checks,
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
