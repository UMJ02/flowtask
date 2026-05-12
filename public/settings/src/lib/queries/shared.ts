import { createClient } from "@/lib/supabase/server";

export async function getSharedProject(token: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("shared_project_details", { p_token: token });
  if (error) return null;
  return data as
    | {
        project: {
          title: string;
          description: string | null;
          status: string;
          client_name: string | null;
          due_date: string | null;
          created_at: string;
          department_name: string | null;
        };
        tasks: Array<{
          id: string;
          title: string;
          status: string;
          client_name: string | null;
          due_date: string | null;
          created_at: string;
        }>;
        comments: Array<{
          content: string;
          created_at: string;
        }>;
      }
    | null;
}

export async function getSharedTask(token: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("shared_task_details", { p_token: token });
  if (error) return null;
  return data as
    | {
        task: {
          title: string;
          description: string | null;
          status: string;
          client_name: string | null;
          due_date: string | null;
          created_at: string;
          priority: string;
          department_name: string | null;
          project_title: string | null;
        };
        comments: Array<{
          content: string;
          created_at: string;
        }>;
      }
    | null;
}
