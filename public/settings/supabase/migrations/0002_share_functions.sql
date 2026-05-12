create or replace function public.shared_project_details(p_token text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  with project_row as (
    select
      p.id,
      p.title,
      p.description,
      p.status,
      p.client_name,
      p.due_date,
      p.created_at,
      p.updated_at,
      p.is_collaborative,
      d.name as department_name
    from public.projects p
    left join public.departments d on d.id = p.department_id
    where p.share_enabled = true
      and p.share_token = p_token
    limit 1
  ),
  project_comments as (
    select jsonb_agg(
      jsonb_build_object(
        'content', c.content,
        'created_at', c.created_at
      ) order by c.created_at desc
    ) as items
    from public.comments c
    join project_row p on p.id = c.project_id
  ),
  project_tasks as (
    select jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'title', t.title,
        'status', t.status,
        'client_name', t.client_name,
        'due_date', t.due_date,
        'created_at', t.created_at
      ) order by t.created_at desc
    ) as items
    from public.tasks t
    join project_row p on p.id = t.project_id
  )
  select case
    when exists(select 1 from project_row) then
      (
        select jsonb_build_object(
          'project', to_jsonb(project_row.*),
          'comments', coalesce(project_comments.items, '[]'::jsonb),
          'tasks', coalesce(project_tasks.items, '[]'::jsonb)
        )
        from project_row, project_comments, project_tasks
      )
    else null
  end;
$$;

grant execute on function public.shared_project_details(text) to anon, authenticated;

create or replace function public.shared_task_details(p_token text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  with task_row as (
    select
      t.id,
      t.title,
      t.description,
      t.status,
      t.client_name,
      t.due_date,
      t.created_at,
      t.updated_at,
      t.priority,
      d.name as department_name,
      p.title as project_title
    from public.tasks t
    left join public.departments d on d.id = t.department_id
    left join public.projects p on p.id = t.project_id
    where t.share_enabled = true
      and t.share_token = p_token
    limit 1
  ),
  task_comments as (
    select jsonb_agg(
      jsonb_build_object(
        'content', c.content,
        'created_at', c.created_at
      ) order by c.created_at desc
    ) as items
    from public.comments c
    join task_row t on t.id = c.task_id
  )
  select case
    when exists(select 1 from task_row) then
      (
        select jsonb_build_object(
          'task', to_jsonb(task_row.*),
          'comments', coalesce(task_comments.items, '[]'::jsonb)
        )
        from task_row, task_comments
      )
    else null
  end;
$$;

grant execute on function public.shared_task_details(text) to anon, authenticated;
