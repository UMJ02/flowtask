# QA — v58.24.9 Workspace Data Isolation + Organization Lifecycle Hardening

## 1. Validar integridad actual

```sql
select p.id, p.title, p.owner_id, p.organization_id
from public.projects p
where p.organization_id is not null
  and not exists (
    select 1 from public.organization_members om
    where om.organization_id = p.organization_id
      and om.user_id = p.owner_id
  );

select t.id, t.title, t.owner_id, t.organization_id
from public.tasks t
where t.organization_id is not null
  and not exists (
    select 1 from public.organization_members om
    where om.organization_id = t.organization_id
      and om.user_id = t.owner_id
  );

select t.id, t.title, t.organization_id as task_org, p.organization_id as project_org
from public.tasks t
join public.projects p on p.id = t.project_id
where t.organization_id is null
  and p.organization_id is not null;

select t.id, t.title, t.organization_id as task_org, p.organization_id as project_org
from public.tasks t
join public.projects p on p.id = t.project_id
where t.organization_id is not null
  and p.organization_id is null;
```

Todos deben devolver 0 filas.

## 2. Workspace personal

Validar que los datos personales usen:

```txt
organization_id = null
owner_id = auth.uid()
```

## 3. Workspace organización

Validar que los datos de organización usen:

```txt
organization_id = org.id
owner_id = auth.uid()
```

y que el usuario exista en `organization_members`.

## 4. Eliminación recuperable

```sql
select public.schedule_organization_deletion('ORG_ID'::uuid, 30);
```

Debe llenar:

- `deleted_at`
- `purge_scheduled_at`
- `purge_after`

## 5. Restauración

```sql
select public.restore_organization('ORG_ID'::uuid);
```

Debe limpiar:

- `deleted_at`
- `purge_scheduled_at`
- `purge_after`

y llenar:

- `reactivated_at`

## 6. Migración explícita personal → organización

```sql
select public.move_personal_project_to_organization(
  'PROJECT_ID'::uuid,
  'ORG_ID'::uuid
);
```

Debe mover el proyecto y sus tareas directas a la organización.

## 7. Purga final

Solo probar con una organización temporal de staging:

```sql
select public.purge_organization_data('ORG_ID'::uuid, true);
```

Debe devolver JSON con conteos por tabla.
