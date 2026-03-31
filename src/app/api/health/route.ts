import { NextResponse } from 'next/server';

export async function GET() {
  const envState = {
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    appUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    serviceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };

  const requiredReady = Object.values(envState).every(Boolean);

  return NextResponse.json(
    {
      status: requiredReady ? 'ok' : 'degraded',
      app: 'flowtask',
      version: '8.7.0-production-guardrails-v9',
      timestamp: new Date().toISOString(),
      env: envState,
    },
    {
      status: requiredReady ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
