# QA — v58.24.9.1 Organization Manage RPC Alignment + Service Role Guard

## 1. Confirmar funciones RPC

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

Debe devolver 5 filas.

## 2. Validar borrar organización recuperable

Desde UI:

1. Entrar como `admin_global`.
2. Ir a organización.
3. Eliminar organización sin force.
4. Confirmar que la app vuelve a workspace personal.
5. Confirmar en DB:
   - `deleted_at is not null`
   - `purge_after is not null`
   - `purge_scheduled_at is not null`

## 3. Validar restaurar organización

1. Reactivar organización desde UI.
2. Confirmar en DB:
   - `deleted_at is null`
   - `purge_after is null`
   - `purge_scheduled_at is null`
   - `reactivated_at is not null`

## 4. Validar force delete

Solo con organización temporal:

1. Crear organización de prueba.
2. Crear datos de prueba.
3. Eliminar con force.
4. Confirmar que `purge_organization_data` devuelve conteos.
5. Confirmar que ya no existe la organización.

## 5. Validar service role guard

Si `SUPABASE_SERVICE_ROLE_KEY` es incorrecta:

- `runtime-check` debe advertir o fallar si puede detectar el problema.
- `/api/organization/manage` normal no debe depender de esa key para schedule/restore/force delete.
- El cron `/api/cron/organization-purge` sí puede requerir service role.
