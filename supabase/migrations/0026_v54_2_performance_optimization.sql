-- V54.2 Performance + Query Optimization

create index if not exists projects_org_created_idx
  on public.projects (organization_id, created_at desc);

create index if not exists projects_org_status_created_idx
  on public.projects (organization_id, status, created_at desc);

create index if not exists projects_org_client_idx
  on public.projects (organization_id, client_id);

create index if not exists tasks_org_created_idx
  on public.tasks (organization_id, created_at desc);

create index if not exists tasks_org_status_due_idx
  on public.tasks (organization_id, status, due_date);

create index if not exists tasks_org_project_created_idx
  on public.tasks (organization_id, project_id, created_at desc);

create index if not exists tasks_org_client_idx
  on public.tasks (organization_id, client_id);

create index if not exists comments_project_created_idx
  on public.comments (project_id, created_at desc)
  where project_id is not null;

create index if not exists comments_task_created_idx
  on public.comments (task_id, created_at desc)
  where task_id is not null;

create index if not exists project_members_project_role_idx
  on public.project_members (project_id, role, created_at asc);

create index if not exists task_assignees_task_assigned_idx
  on public.task_assignees (task_id, assigned_at desc);

create index if not exists client_permissions_org_user_client_idx
  on public.client_permissions (organization_id, user_id, client_id);

create index if not exists usage_events_org_created_idx
  on public.usage_events (organization_id, created_at desc);

create index if not exists error_logs_org_created_idx
  on public.error_logs (organization_id, created_at desc);

create index if not exists support_tickets_org_status_created_idx
  on public.support_tickets (organization_id, status, created_at desc);
