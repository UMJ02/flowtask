-- v58.28.21 — Supabase / RLS / Client Readiness Final
-- Run these checks in Supabase SQL Editor before tagging the client release candidate.
-- They are read-only, except where clearly marked as optional cleanup.

-- 1) tasks.status constraint must allow the full final status set.
select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.tasks'::regclass
  and conname = 'tasks_status_check';
-- Expected values in definition:
-- pendiente, en_proceso, produccion, en_espera, revision, concluido

-- 2) Count real task status distribution. No unexpected values should appear.
select status, count(*)
from public.tasks
group by status
order by status;

-- 3) Confirm RLS is enabled on the core client tables.
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles',
    'projects',
    'tasks',
    'task_assignees',
    'visual_boards',
    'visual_board_elements',
    'visual_board_comments',
    'visual_board_activity',
    'attachments',
    'organizations',
    'organization_members',
    'workspace_spaces',
    'workspace_space_projects',
    'project_views'
  )
order by tablename;

-- 4) List important policies for workspace personal and workspace organización isolation.
select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'projects',
    'tasks',
    'visual_boards',
    'attachments',
    'organizations',
    'organization_members',
    'workspace_spaces',
    'workspace_space_projects',
    'project_views'
  )
order by tablename, policyname;

-- 5) Confirm every organization task belongs to an organization membership scope.
select t.organization_id, count(*) as tasks
from public.tasks t
where t.organization_id is not null
group by t.organization_id
order by tasks desc;

-- 6) Confirm personal tasks are scoped without organization_id.
select count(*) as personal_tasks
from public.tasks
where organization_id is null;

-- 7) Detect tasks whose project organization scope does not match the task scope.
select t.id, t.title, t.organization_id as task_organization_id, p.organization_id as project_organization_id
from public.tasks t
join public.projects p on p.id = t.project_id
where t.project_id is not null
  and t.organization_id is distinct from p.organization_id
limit 50;

-- 8) Detect unexpected task status values.
select id, title, status
from public.tasks
where status not in ('pendiente', 'en_proceso', 'produccion', 'en_espera', 'revision', 'concluido')
limit 50;

-- 9) Confirm workspace tables exist and are queryable.
select 'workspace_spaces' as table_name, count(*) from public.workspace_spaces
union all
select 'workspace_space_projects', count(*) from public.workspace_space_projects
union all
select 'project_views', count(*) from public.project_views;

-- 10) Optional manual cross-user RLS QA:
-- Login as User A and User B in two different browsers.
-- User A should not see User B personal tasks/projects/boards.
-- Organization members should only see organization data where they belong to organization_members.
