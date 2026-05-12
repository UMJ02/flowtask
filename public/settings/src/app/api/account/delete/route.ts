import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (body?.confirmation !== 'ELIMINAR') {
    return NextResponse.json({ error: 'Confirmación inválida.' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  const profileUpdate = await admin
    .from('profiles')
    .update({
      account_deletion_requested_at: now,
      account_deletion_status: 'scheduled',
      updated_at: now,
    })
    .eq('id', authData.user.id);

  if (profileUpdate.error) {
    return NextResponse.json({ error: profileUpdate.error.message }, { status: 400 });
  }

  await admin
    .from('organizations')
    .update({
      deleted_at: now,
      deletion_requested_at: now,
      deletion_status: 'scheduled',
      deletion_requested_by: authData.user.id,
      updated_at: now,
    })
    .eq('owner_id', authData.user.id)
    .is('deleted_at', null);

  await supabase.auth.signOut();

  return NextResponse.json({ ok: true, scheduled_at: now });
}
