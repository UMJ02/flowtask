# FlowTask v58.26.1 — Supabase Real Environment Checklist

## 1. Validar tablas

```sql
select
  to_regclass('public.workspace_spaces') as workspace_spaces,
  to_regclass('public.project_views') as project_views,
  to_regclass('public.workspace_space_projects') as workspace_space_projects;
```

Debe devolver las tres tablas.

## 2. Validar triggers

```sql
select
  tgname as trigger_name,
  relname as table_name
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
where relname in ('workspace_spaces', 'project_views', 'workspace_space_projects')
  and not tgisinternal
order by relname, tgname;
```

Deben existir:

- `workspace_spaces_set_updated_at`
- `project_views_set_updated_at`
- `workspace_space_projects_set_updated_at`

## 3. Validar RLS

```sql
select
  relname as table_name,
  relrowsecurity as rls_enabled,
  relforcerowsecurity as rls_forced
from pg_class
where relname in ('workspace_spaces', 'project_views', 'workspace_space_projects')
order by relname;
```

`rls_enabled` debe ser `true`.

## 4. Validar policies

```sql
select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('workspace_spaces', 'project_views', 'workspace_space_projects')
order by tablename, policyname;
```

## 5. Validar soporte Home en project_views

```sql
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.project_views'::regclass
  and conname = 'project_views_view_type_check';
```

Debe incluir:

```txt
home, list, board, timeline, table, canvas, files, reports
```

## 6. Prueba de idempotencia

La migración `0059_v58_26_1_workspace_real_environment_hardening.sql` se puede ejecutar más de una vez. No debe fallar por triggers existentes.

## 7. Rutas clásicas vivas

Confirmar que siguen cargando después de Workspace:

- `/app/tasks`
- `/app/projects`
- `/app/boards`
- `/app/reports`

Workspace no debe reemplazar ni romper estas rutas.
