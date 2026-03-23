import { createClient } from "@/lib/supabase/server";

export async function getTaskAttachments(taskId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attachments")
    .select("id, file_name, mime_type, file_size, public_url, storage_path, created_at")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getProjectAttachments(projectId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attachments")
    .select("id, file_name, mime_type, file_size, public_url, storage_path, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getProjectSectionPermissions(projectId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("project_section_permissions")
    .select("id, user_id, section_key, can_view, can_edit")
    .eq("project_id", projectId)
    .order("section_key", { ascending: true });

  return data ?? [];
}
