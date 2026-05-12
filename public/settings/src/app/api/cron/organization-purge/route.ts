import { NextResponse } from 'next/server';
import { purgeExpiredOrganizations } from '@/lib/organization/purge';

export const dynamic = 'force-dynamic';

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return false;
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${secret}`) {
    return true;
  }

  const cronHeader = request.headers.get('x-vercel-cron');
  if (cronHeader === '1') {
    return true;
  }

  return false;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado para ejecutar la purga.' }, { status: 401 });
  }

  try {
    const result = await purgeExpiredOrganizations();
    return NextResponse.json({ ok: true, ...result, message: result.purged ? 'Purga automática completada.' : 'No había organizaciones vencidas para purgar.' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No fue posible ejecutar la purga.' }, { status: 500 });
  }
}
