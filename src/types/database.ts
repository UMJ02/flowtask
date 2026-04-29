export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Row<T> = T;
type Insert<T, Generated extends keyof T = never> = Omit<T, Generated> & Partial<Pick<T, Generated>>;
type Update<T> = Partial<T>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Row<{ id: string; full_name: string; email: string; avatar_url: string | null; created_at: string; updated_at: string }>;
        Insert: Insert<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Update<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      organizations: {
        Row: Row<{ id: string; name: string; slug: string; owner_id: string | null; created_at: string; updated_at: string; deleted_at: string | null; purge_scheduled_at: string | null; purge_after: string | null; reactivated_at: string | null }>;
        Insert: Insert<Database["public"]["Tables"]["organizations"]["Row"], "id" | "created_at" | "updated_at" | "deleted_at" | "purge_scheduled_at" | "purge_after" | "reactivated_at">;
        Update: Update<Database["public"]["Tables"]["organizations"]["Row"]>;
        Relationships: [];
      };
      organization_members: {
        Row: Row<{ id: string; organization_id: string; user_id: string; role: "admin_global" | "manager" | "member" | "viewer"; is_default: boolean; created_at: string }>;
        Insert: Insert<Database["public"]["Tables"]["organization_members"]["Row"], "id" | "created_at" | "is_default">;
        Update: Update<Database["public"]["Tables"]["organization_members"]["Row"]>;
        Relationships: [];
      };
      organization_invites: {
        Row: Row<{ id: string; organization_id: string; email: string; role: "admin_global" | "manager" | "member" | "viewer"; token: string; status: string; created_by: string | null; accepted_by: string | null; accepted_at: string | null; created_at: string }>;
        Insert: Insert<Database["public"]["Tables"]["organization_invites"]["Row"], "id" | "token" | "status" | "accepted_by" | "accepted_at" | "created_at">;
        Update: Update<Database["public"]["Tables"]["organization_invites"]["Row"]>;
        Relationships: [];
      };
      organization_subscriptions: {
        Row: Row<{ id: string; organization_id: string; plan_code: string; plan_name: string; status: string; billing_cycle: string; trial_ends_at: string | null; renews_at: string | null; seats_included: number; seats_used: number; projects_included: number; projects_used: number; storage_gb_included: number; storage_gb_used: number; external_customer_id: string | null; external_subscription_id: string | null; created_at: string; updated_at: string; activation_code_id: string | null; auto_renew: boolean; expires_at: string | null; last_renewed_at: string | null; renewal_grace_ends_at: string | null; soft_locked: boolean; soft_locked_at: string | null; soft_lock_reason: string | null; scheduled_plan_code: string | null; scheduled_plan_name: string | null; scheduled_change_at: string | null }>;
        Insert: Insert<Database["public"]["Tables"]["organization_subscriptions"]["Row"], "id" | "created_at" | "updated_at" | "seats_used" | "projects_used" | "storage_gb_used" | "auto_renew" | "soft_locked">;
        Update: Update<Database["public"]["Tables"]["organization_subscriptions"]["Row"]>;
        Relationships: [];
      };
      activation_codes: {
        Row: Row<{ id: string; code: string; plan_code: string; plan_name: string; account_mode: string; billing_cycle: string; seat_limit: number | null; project_limit: number | null; storage_gb_limit: number | null; organization_limit: number; is_active: boolean; is_used: boolean; expires_at: string | null; used_by_user_id: string | null; used_at: string | null; created_by: string | null; organization_id: string | null; notes: string | null; created_at: string; updated_at: string }>;
        Insert: Insert<Database["public"]["Tables"]["activation_codes"]["Row"], "id" | "billing_cycle" | "organization_limit" | "is_active" | "is_used" | "created_at" | "updated_at">;
        Update: Update<Database["public"]["Tables"]["activation_codes"]["Row"]>;
        Relationships: [];
      };
      tasks: {
        Row: Row<{ id: string; owner_id: string; organization_id: string | null; project_id: string | null; client_id: string | null; title: string; description: string | null; status: "en_proceso" | "en_espera" | "concluido"; department_id: number | null; client_name: string | null; due_date: string | null; priority: "baja" | "media" | "alta"; country: string | null; share_enabled: boolean; share_token: string | null; completed_at: string | null; created_at: string; updated_at: string }>;
        Insert: Insert<Database["public"]["Tables"]["tasks"]["Row"], "id" | "status" | "priority" | "share_enabled" | "share_token" | "completed_at" | "created_at" | "updated_at">;
        Update: Update<Database["public"]["Tables"]["tasks"]["Row"]>;
        Relationships: [];
      };
      projects: {
        Row: Row<{ id: string; owner_id: string; organization_id: string | null; client_id: string | null; title: string; description: string | null; status: string; client_name: string | null; department_id: number | null; country: string | null; is_collaborative: boolean; share_enabled: boolean; share_token: string | null; due_date: string | null; image_url: string | null; created_at: string; updated_at: string }>;
        Insert: Insert<Database["public"]["Tables"]["projects"]["Row"], "id" | "status" | "is_collaborative" | "share_enabled" | "share_token" | "created_at" | "updated_at">;
        Update: Update<Database["public"]["Tables"]["projects"]["Row"]>;
        Relationships: [];
      };
      clients: {
        Row: Row<{ id: string; organization_id: string | null; account_owner_id: string | null; name: string; status: string; notes: string | null; contact_email: string | null; created_at: string }>;
        Insert: Insert<Database["public"]["Tables"]["clients"]["Row"], "id" | "status" | "created_at">;
        Update: Update<Database["public"]["Tables"]["clients"]["Row"]>;
        Relationships: [];
      };
      countries: {
        Row: Row<{ id: number; code: string; name: string; organization_id: string | null; account_owner_id: string | null; created_at: string }>;
        Insert: Insert<Database["public"]["Tables"]["countries"]["Row"], "id" | "created_at">;
        Update: Update<Database["public"]["Tables"]["countries"]["Row"]>;
        Relationships: [];
      };
      departments: {
        Row: Row<{ id: number; code: string; name: string; phone: string | null; organization_id: string | null; account_owner_id: string | null; created_at: string }>;
        Insert: Insert<Database["public"]["Tables"]["departments"]["Row"], "id" | "created_at">;
        Update: Update<Database["public"]["Tables"]["departments"]["Row"]>;
        Relationships: [];
      };
      task_checklist_items: {
        Row: Row<{ id: string; task_id: string; owner_id: string; title: string; done: boolean; due_date: string | null; position: number; created_at: string; updated_at: string }>;
        Insert: Insert<Database["public"]["Tables"]["task_checklist_items"]["Row"], "id" | "done" | "position" | "created_at" | "updated_at">;
        Update: Update<Database["public"]["Tables"]["task_checklist_items"]["Row"]>;
        Relationships: [];
      };
    };
    Views: {
      v_countries_catalog: { Row: { id: number; code: string; name: string; organization_id: string | null; account_owner_id: string | null }; Relationships: [] };
      v_departments_catalog: { Row: { id: number; code: string; name: string; phone: string | null; organization_id: string | null; account_owner_id: string | null }; Relationships: [] };
    };
    Functions: {
      bootstrap_organization_workspace: { Args: { p_name: string; p_slug: string }; Returns: string };
      sync_organization_subscription_lifecycle: { Args: { p_organization_id: string }; Returns: undefined };
      sync_organization_subscription_usage: { Args: { p_organization_id: string }; Returns: undefined };
      accept_organization_invite: { Args: { p_token: string }; Returns: Json };
      shared_task_details: { Args: { p_token: string }; Returns: Json };
      shared_project_details: { Args: { p_token: string }; Returns: Json };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
