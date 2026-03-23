import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";

export function createRealtimeChannel(
  supabase: SupabaseClient,
  name: string,
): RealtimeChannel {
  return supabase.channel(name, {
    config: {
      broadcast: { self: true },
      presence: { key: name },
    },
  });
}

export function removeRealtimeChannel(
  supabase: SupabaseClient,
  channel: RealtimeChannel | null,
) {
  if (!channel) return;
  void supabase.removeChannel(channel);
}
