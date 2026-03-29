import type { SupabaseClient } from "@supabase/supabase-js";

type RealtimeChannel = ReturnType<SupabaseClient["channel"]>;

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
