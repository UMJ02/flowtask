import { createClient } from "@/lib/supabase/client";

export async function getDepartmentIdByCode(code?: string | null) {
  if (!code) return null;
  const supabase = createClient();
  const { data, error } = await supabase.from("departments").select("id").eq("code", code).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}
