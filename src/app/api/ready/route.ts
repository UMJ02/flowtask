import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "flowtask-ready",
    timestamp: new Date().toISOString(),
    checks: {
      supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      serviceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      cronSecret: Boolean(process.env.CRON_SECRET),
      appUrl: Boolean(process.env.FLOWTASK_APP_URL),
    },
  });
}
