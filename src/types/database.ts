export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type GenericTable = { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] };
type Table<Row extends Record<string, unknown>> = { Row: Row; Insert: Partial<Row> & Record<string, unknown>; Update: Partial<Row> & Record<string, unknown>; Relationships: [] };

// v58.17.1b DB contract generated from the Supabase schema export shared for Flowtask.
// Insert/Update stay permissive to keep v58.17 code compatible, while Row types document real columns.
export type Database = {
  public: {
    Tables: {
      activation_codes: Table<{
        id: string;
        code: string;
        plan_code: string;
        plan_name: string;
        account_mode: string;
        billing_cycle: string;
        seat_limit: number | null;
        project_limit: number | null;
        storage_gb_limit: number | null;
        organization_limit: number;
        is_active: boolean;
        is_used: boolean;
        expires_at: string | null;
        used_by_user_id: string | null;
        used_at: string | null;
        created_by: string | null;
        organization_id: string | null;
        notes: string | null;
        created_at: string;
        updated_at: string;
      }>;
      activity_logs: Table<{
        id: string;
        user_id: string | null;
        entity_type: string;
        entity_id: string;
        action: string;
        metadata: Json;
        created_at: string;
        organization_id: string | null;
        client_id: string | null;
        project_id: string | null;
        task_id: string | null;
      }>;
      attachments: Table<{
        id: string;
        owner_id: string | null;
        task_id: string | null;
        project_id: string | null;
        file_name: string;
        mime_type: string | null;
        file_size: number | null;
        storage_path: string;
        public_url: string | null;
        created_at: string;
      }>;
      boards: Table<{
        id: string;
        user_id: string;
        title: string;
        layout_config: Json;
        theme_config: Json;
        created_at: string;
        updated_at: string;
      }>;
      client_permissions: Table<{
        id: string;
        organization_id: string;
        client_id: string;
        user_id: string | null;
        role: string;
        can_view: boolean;
        can_edit: boolean;
        can_manage_members: boolean;
        created_at: string;
      }>;
      clients: Table<{
        id: string;
        organization_id: string | null;
        name: string;
        created_at: string;
        status: string;
        notes: string | null;
        account_owner_id: string | null;
        contact_email: string | null;
      }>;
      comments: Table<{
        id: string;
        author_id: string;
        project_id: string | null;
        task_id: string | null;
        content: string;
        created_at: string;
      }>;
      countries: Table<{
        id: number;
        code: string;
        name: string;
        organization_id: string | null;
        account_owner_id: string | null;
        created_at: string;
      }>;
      daily_notification_digests: Table<{
        id: string;
        user_id: string;
        digest_date: string;
        delivery_frequency: string;
        status: string;
        total_notifications: number;
        summary_title: string;
        summary_body: string | null;
        created_at: string;
        processed_at: string | null;
      }>;
      departments: Table<{
        id: number;
        code: string;
        name: string;
        phone: string | null;
        organization_id: string | null;
        account_owner_id: string | null;
        created_at: string;
      }>;
      error_logs: Table<{
        id: string;
        user_id: string | null;
        organization_id: string | null;
        level: string;
        source: string;
        route: string | null;
        message: string;
        details: Json;
        created_at: string;
      }>;
      internal_support_tickets: Table<{
        id: string;
        organization_id: string | null;
        requester_user_id: string | null;
        subject: string;
        status: string;
        priority: string;
        source: string;
        created_at: string;
        updated_at: string;
      }>;
      notification_deliveries: Table<{
        id: string;
        notification_id: string;
        user_id: string;
        channel: string;
        status: string;
        error_message: string | null;
        provider_response: Json;
        attempted_at: string;
        delivered_at: string | null;
        created_at: string;
        attempt_number: number;
        retry_after: string | null;
        retry_group: string | null;
      }>;
      notification_preferences: Table<{
        user_id: string;
        enable_task: boolean;
        enable_project: boolean;
        enable_comment: boolean;
        enable_reminder: boolean;
        enable_toasts: boolean;
        enable_email: boolean;
        enable_whatsapp: boolean;
        delivery_frequency: string;
        daily_digest_hour: number;
        created_at: string;
        updated_at: string;
        quiet_hours_enabled: boolean;
        quiet_hours_start: number;
        quiet_hours_end: number;
      }>;
      notifications: Table<{
        id: string;
        user_id: string;
        title: string;
        body: string | null;
        kind: string;
        entity_type: string | null;
        entity_id: string | null;
        is_read: boolean;
        created_at: string;
        read_at: string | null;
        deleted_at: string | null;
      }>;
      organization_invites: Table<{
        id: string;
        organization_id: string;
        email: string;
        role: string;
        token: string;
        status: string;
        created_by: string | null;
        accepted_by: string | null;
        accepted_at: string | null;
        created_at: string;
      }>;
      organization_invoices: Table<{
        id: string;
        organization_id: string;
        amount_cents: number;
        currency: string;
        status: string;
        period_start: string | null;
        period_end: string | null;
        issued_at: string;
        external_invoice_id: string | null;
        created_at: string;
      }>;
      organization_members: Table<{
        id: string;
        organization_id: string;
        user_id: string;
        role: string;
        is_default: boolean;
        created_at: string;
      }>;
      organization_permission_definitions: Table<{
        key: string;
        label: string;
        description: string | null;
        category: string;
        created_at: string;
      }>;
      organization_role_permissions: Table<{
        id: string;
        organization_id: string;
        role_template_id: string;
        permission_key: string;
        created_at: string;
      }>;
      organization_role_templates: Table<{
        id: string;
        organization_id: string;
        name: string;
        description: string;
        is_system: boolean;
        created_at: string;
      }>;
      organization_subscriptions: Table<{
        id: string;
        organization_id: string;
        plan_code: string;
        plan_name: string;
        status: string;
        billing_cycle: string;
        trial_ends_at: string | null;
        renews_at: string | null;
        seats_included: number;
        seats_used: number;
        projects_included: number;
        projects_used: number;
        storage_gb_included: number;
        storage_gb_used: number;
        external_customer_id: string | null;
        external_subscription_id: string | null;
        created_at: string;
        updated_at: string;
        activation_code_id: string | null;
        auto_renew: boolean;
        expires_at: string | null;
        last_renewed_at: string | null;
        renewal_grace_ends_at: string | null;
        soft_locked: boolean;
        soft_locked_at: string | null;
        soft_lock_reason: string | null;
        scheduled_plan_code: string | null;
        scheduled_plan_name: string | null;
        scheduled_change_at: string | null;
      }>;
      organizations: Table<{
        id: string;
        name: string;
        slug: string;
        owner_id: string | null;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
        purge_scheduled_at: string | null;
        purge_after: string | null;
        reactivated_at: string | null;
      }>;
      platform_admins: Table<{
        id: string;
        user_id: string;
        active: boolean;
        created_at: string;
        grant_source: string;
      }>;
      profiles: Table<{
        id: string;
        full_name: string;
        email: string;
        avatar_url: string | null;
        created_at: string;
        updated_at: string;
      }>;
      project_members: Table<{
        id: string;
        project_id: string;
        user_id: string;
        role: string;
        created_at: string;
      }>;
      project_section_permissions: Table<{
        id: string;
        project_id: string;
        user_id: string;
        section_key: string;
        can_view: boolean;
        can_edit: boolean;
        created_at: string;
        updated_at: string;
      }>;
      projects: Table<{
        id: string;
        owner_id: string;
        title: string;
        description: string | null;
        status: string;
        client_name: string | null;
        department_id: number | null;
        is_collaborative: boolean;
        share_enabled: boolean;
        share_token: string | null;
        created_at: string;
        updated_at: string;
        due_date: string | null;
        completed_at: string | null;
        organization_id: string | null;
        client_id: string | null;
        country: string | null;
      }>;
      reminders: Table<{
        id: string;
        user_id: string;
        task_id: string | null;
        project_id: string | null;
        remind_at: string;
        sent_at: string | null;
        created_at: string;
      }>;
      task_assignees: Table<{
        id: string;
        task_id: string;
        user_id: string;
        assigned_at: string;
      }>;
      task_checklist_items: Table<{
        id: string;
        task_id: string;
        owner_id: string;
        title: string;
        done: boolean;
        due_date: string | null;
        position: number;
        created_at: string;
        updated_at: string;
      }>;
      task_dependencies: Table<{
        id: string;
        predecessor_task_id: string;
        successor_task_id: string;
        dependency_type: string;
        created_by: string | null;
        created_at: string;
      }>;
      task_view_preferences: Table<{
        id: string;
        user_id: string;
        organization_id: string | null;
        scope: string;
        name: string;
        view_mode: string;
        config: Json;
        created_at: string;
        updated_at: string;
      }>;
      tasks: Table<{
        id: string;
        owner_id: string;
        project_id: string | null;
        title: string;
        description: string | null;
        status: string;
        department_id: number | null;
        client_name: string | null;
        due_date: string | null;
        priority: string;
        share_enabled: boolean;
        share_token: string | null;
        created_at: string;
        updated_at: string;
        completed_at: string | null;
        organization_id: string | null;
        client_id: string | null;
        country: string | null;
      }>;
      usage_events: Table<{
        id: string;
        user_id: string | null;
        organization_id: string | null;
        event_name: string;
        route: string | null;
        metadata: Json;
        created_at: string;
      }>;
      user_account_modes: Table<{
        user_id: string;
        account_mode: string;
        selected_plan_code: string | null;
        selected_plan_name: string | null;
        billing_cycle: string | null;
        activation_source: string;
        default_organization_id: string | null;
        onboarding_completed: boolean;
        created_at: string;
        updated_at: string;
      }>;
      v_countries_catalog: Table<{
        id: number | null;
        code: string | null;
        name: string | null;
        organization_id: string | null;
        account_owner_id: string | null;
        created_at: string | null;
      }>;
      v_departments_catalog: Table<{
        id: number | null;
        code: string | null;
        name: string | null;
        phone: string | null;
        organization_id: string | null;
        account_owner_id: string | null;
        created_at: string | null;
      }>;
    } & Record<string, GenericTable>;
    Views: { v_countries_catalog: GenericTable; v_departments_catalog: GenericTable } & Record<string, GenericTable>;
    Functions: { bootstrap_organization_workspace: { Args: { p_name: string; p_slug: string }; Returns: string }; repair_organization_owner_memberships: { Args: Record<string, never>; Returns: number }; flowtask_db_contract_v58171b_check: { Args: Record<string, never>; Returns: Json } } & Record<string, { Args: Record<string, unknown>; Returns: unknown }>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
export type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationMemberRow = Database["public"]["Tables"]["organization_members"]["Row"];
export type OrganizationSubscriptionRow = Database["public"]["Tables"]["organization_subscriptions"]["Row"];
export type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
export type ChecklistItemRow = Database["public"]["Tables"]["task_checklist_items"]["Row"];
