import { NextResponse } from 'next/server';
import { getNotificationPreferences } from '@/lib/queries/notification-preferences';

export async function GET() {
  const data = await getNotificationPreferences();

  if (!data) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  return NextResponse.json({ data });
}
