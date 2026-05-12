# QA — v58.24.9.2 Organization Delete RPC Schema + Workspace Switch Fix

## 1. Borrado recuperable

1. Entrar como admin/owner de una organización.
2. Ejecutar borrar organización normal.
3. Confirmar que no aparece:
   - `Could not find the function public.schedule_organization_deletion`
4. Confirmar que vuelve a workspace personal.
5. Confirmar en DB:
   - `deleted_at is not null`
   - `purge_after is not null`
   - `purge_scheduled_at is not null`

## 2. Restauración

1. Reactivar organización.
2. Confirmar en DB:
   - `deleted_at is null`
   - `purge_after is null`
   - `purge_scheduled_at is null`
   - `reactivated_at is not null`

## 3. Workspace switch

1. Estar en organización.
2. Cambiar a workspace personal.
3. Confirmar que la app cambia sola, sin refresh manual.
4. Confirmar que muestra tareas/proyectos personales.
5. Cambiar a organización.
6. Confirmar que la app cambia sola, sin refresh manual.
7. Confirmar que muestra tareas/proyectos de organización.

## 4. RPC full lifecycle

Aplicar migración v58.24.9 y validar que existan:

```sql
select
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'schedule_organization_deletion',
    'restore_organization',
    'purge_organization_data',
    'purge_expired_organizations',
    'move_personal_project_to_organization'
  )
order by p.proname;
```
