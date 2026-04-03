import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

    const admin = createAdminClient();
    const { error, count } = await admin.from('notifications').delete({ count: 'exact' }).eq('user_id', user.id).eq('is_read', true);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, archivedCount: count ?? 0 }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, error: 'unexpected_error' }, { status: 500 });
  }
}
