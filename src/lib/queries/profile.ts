import { getAuthenticatedServerContext } from '@/lib/performance/server-cache';

export async function getCurrentProfile() {
  const { supabase, user } = await getAuthenticatedServerContext();

  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  return {
    id: user.id,
    fullName: (data?.full_name as string | null) ?? user.user_metadata?.full_name ?? '',
    email: (data?.email as string | null) ?? user.email ?? '',
    avatarUrl: (data?.avatar_url as string | null) ?? null,
  };
}
