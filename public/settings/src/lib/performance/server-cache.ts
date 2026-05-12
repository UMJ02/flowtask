import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getServerClientCached = cache(async () => createClient());

export const getAuthenticatedServerContext = cache(async () => {
  const supabase = await getServerClientCached();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
});
