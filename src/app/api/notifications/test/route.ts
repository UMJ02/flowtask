import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const body = `Se generó una alerta de prueba a las ${now.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    })}.`;

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Notificación de prueba',
        body,
        kind: 'info',
        entity_type: 'project',
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    await supabase.from('usage_events').insert({
      user_id: user.id,
      event_name: 'notification_test_created',
      route: '/app/notifications',
      metadata: { notification_id: data.id },
    });

    return NextResponse.json({ ok: true, notificationId: data.id }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: 'unexpected_error' }, { status: 500 });
  }
}
